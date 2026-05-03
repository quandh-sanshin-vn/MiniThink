import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { taskId, reason } = await request.json();

    if (!taskId || !reason || reason.length < 10) {
      return NextResponse.json({ success: false, error: 'Missing taskId or valid reason (min 10 chars)' }, { status: 400 });
    }

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId }
    });

    if (!task || task.status !== 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'Task not found or not completed' }, { status: 400 });
    }

    // 1. Revert Learning Progress Data
    const itemIds = Array.isArray(task.itemIds) ? task.itemIds : [];
    
    if (itemIds.length > 0) {
      if (!task.isReview) {
        // For NEW tasks, reverting means completely removing the "Learned" records
        // so that they go back to the unlearned pool.
        await prisma.learningProgress.deleteMany({
          where: {
            userId: task.userId,
            itemType: task.taskType || 'vocab',
            itemId: { in: itemIds }
          }
        });
      } else {
        // For REVIEW tasks, we can't easily restore the previous SM-2 mathematical state.
        // But we can reset the nextReviewDate to now so they are immediately due again,
        // and decrement the consecutiveCorrect as a penalty/reset.
        await prisma.learningProgress.updateMany({
          where: {
            userId: task.userId,
            itemType: task.taskType || 'vocab',
            itemId: { in: itemIds }
          },
          data: {
            nextReviewDate: new Date(),
            consecutiveCorrect: {
              decrement: 1
            }
          }
        });
      }
    }

    // Note: User requested to ALSO clear itemIds, so the task forgets the assigned words.
    // The next time they start it, it will fetch a new batch based on the deterministic logic.
    const updatedTask = await prisma.dailyTask.update({
      where: { id: taskId },
      data: {
        status: 'PENDING',
        completedAt: null,
        itemIds: []
      }
    });

    // 3. Log this potentially destructive action
    await prisma.planModificationLog.create({
      data: {
        userId: task.userId,
        goalId: task.goalId,
        eventType: 'TASK_REVERTED',
        reason: reason,
        changes: {
          taskId: task.id,
          taskTitle: task.title,
          action: "Reverted DailyTask to PENDING and wiped associated LearningProgress"
        }
      }
    });

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Reset task error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
