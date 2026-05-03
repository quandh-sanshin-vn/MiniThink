import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { taskId, results } = await request.json();

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const userId = task.userId;

    // 1. Lưu các câu ví dụ mới do người dùng tự tạo vào DB
    const examplesData = results.map(r => ({
      grammarId: r.grammarId,
      jaSentence: r.jaSentence,
      viMeaning: r.viMeaning,
      isReviewGenerated: true
    }));

    await prisma.grammarExample.createMany({
      data: examplesData
    });

    // 2. Cập nhật tiến độ SRS (LearningProgress) cho từng ngữ pháp
    for (const res of results) {
      const currentProgress = await prisma.learningProgress.findFirst({
        where: { userId, itemId: res.grammarId, itemType: 'grammar' }
      });

      if (!currentProgress) continue; // Nếu không có, bỏ qua

      const quality = res.score;
      let { interval, easeFactor, consecutiveCorrect } = currentProgress;

      if (quality >= 3) {
        if (consecutiveCorrect === 0) interval = 1;
        else if (consecutiveCorrect === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        
        consecutiveCorrect += 1;
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;
      } else {
        consecutiveCorrect = 0;
        interval = 1;
      }

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);
      nextReviewDate.setHours(0, 0, 0, 0);

      await prisma.learningProgress.update({
        where: { id: currentProgress.id },
        data: {
          qualityScore: quality,
          interval,
          easeFactor,
          consecutiveCorrect,
          nextReviewDate,
          lastReviewed: new Date()
        }
      });
    }

    // 3. Mark task as completed
    await prisma.dailyTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED' }
    });

    // 4. Log completion
    await prisma.planModificationLog.create({
      data: {
        userId,
        goalId: task.goalId,
        event: 'TASK_COMPLETED',
        details: `Completed grammar generative study task: ${task.title}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit Grammar Study Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
