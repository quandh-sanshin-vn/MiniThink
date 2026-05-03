import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { taskId, results } = await request.json();

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId }
    });

    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });

    const userId = task.userId;

    for (const res of results) {
      const currentProgress = await prisma.learningProgress.findUnique({
        where: { id: res.progressId }
      });

      if (!currentProgress) continue;

      const quality = res.score;
      let { intervalDays, easeFactor, consecutiveCorrect } = currentProgress;

      if (quality >= 3) {
        if (consecutiveCorrect === 0) intervalDays = 1;
        else if (consecutiveCorrect === 1) intervalDays = 6;
        else intervalDays = Math.round(intervalDays * easeFactor);
        
        consecutiveCorrect += 1;
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;
      } else {
        consecutiveCorrect = 0;
        intervalDays = 1;
      }

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
      nextReviewDate.setHours(0, 0, 0, 0);

      await prisma.learningProgress.update({
        where: { id: currentProgress.id },
        data: {
          intervalDays,
          easeFactor,
          consecutiveCorrect,
          nextReviewDate,
          lastReviewedAt: new Date()
        }
      });
    }

    await prisma.dailyTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });

    await prisma.planModificationLog.create({
      data: {
        userId,
        goalId: task.goalId,
        eventType: 'TASK_COMPLETED',
        reason: 'Consolidate completed',
        changes: { itemsReviewed: results.length }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit Consolidate Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
