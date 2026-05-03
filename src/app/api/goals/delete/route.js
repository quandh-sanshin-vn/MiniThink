import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { goalId } = await request.json();
    
    if (!goalId) {
      return NextResponse.json({ success: false, error: 'Missing goalId' }, { status: 400 });
    }

    const user = await prisma.user.findFirst();

    // Delete all daily tasks
    await prisma.dailyTask.deleteMany({
      where: { goalId: goalId }
    });

    // Mark goal as deleted
    await prisma.goal.update({
      where: { id: goalId },
      data: { status: 'DELETED' }
    });

    // Log the deletion
    const log = await prisma.planModificationLog.create({
      data: {
        userId: user.id,
        goalId: goalId,
        eventType: 'GOAL_DELETED',
        reason: 'Target and daily tasks destroyed by user command. Logs preserved.',
        changes: { action: 'DELETED' }
      }
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Delete goal error", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
