import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { taskId, results } = await request.json();

    if (!taskId || !results || !Array.isArray(results)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found");

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId }
    });

    if (!task) throw new Error("Task not found");

    // Process SRS for each result
    // result shape: { itemId, qualityScore } (0-4)
    for (const res of results) {
      const { itemId, qualityScore } = res;
      const q = Number(qualityScore) || 0;

      // Find existing progress
      let progress = await prisma.learningProgress.findUnique({
        where: {
          userId_itemId_itemType: {
            userId: user.id,
            itemId: itemId,
            itemType: 'vocab' // hardcoded for now
          }
        }
      });

      if (!progress) {
        progress = await prisma.learningProgress.create({
          data: {
            userId: user.id,
            itemId: itemId,
            itemType: 'vocab'
          }
        });
      }

      // Calculate SM-2
      let newR = progress.consecutiveCorrect;
      let newI = progress.intervalDays;
      let newEF = progress.easeFactor;

      if (q >= 3) {
        if (newR === 0) newI = 1;
        else if (newR === 1) newI = 6;
        else newI = Math.round(newI * newEF);
        newR += 1;
      } else {
        newR = 0;
        newI = 1;
      }

      newEF = newEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (newEF < 1.3) newEF = 1.3; // minimum EF

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newI);
      nextReviewDate.setHours(0, 0, 0, 0);

      await prisma.learningProgress.update({
        where: { id: progress.id },
        data: {
          consecutiveCorrect: newR,
          intervalDays: newI,
          easeFactor: newEF,
          lastReviewedAt: new Date(),
          nextReviewDate: nextReviewDate
        }
      });
    }

    // Mark task as completed
    await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Generate Log
    await prisma.planModificationLog.create({
      data: {
        userId: user.id,
        goalId: task.goalId,
        eventType: 'TASK_COMPLETED',
        reason: `Completed task: ${task.title} with ${results.length} items.`,
        changes: { action: 'COMPLETED', taskType: task.taskType }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit study error", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
