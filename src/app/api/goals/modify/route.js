import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // We expect { goalId, userId (optional), reason, changes }
    const { goalId, reason, changes, type } = data;

    if (!goalId) {
      return NextResponse.json({ success: false, error: 'Missing goalId' }, { status: 400 });
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No user found' }, { status: 400 });
    }

    // 1. Create the modification log
    const log = await prisma.planModificationLog.create({
      data: {
        userId: user.id,
        goalId: goalId,
        eventType: type || 'PLAN_MODIFIED',
        reason: reason || null,
        changes: changes || {}
      }
    });

    // 2. If it's a GOAL modification, update the goal itself
    if (type === 'GOAL_MODIFIED' && changes) {
      const updateData = {};
      if (changes.endDate) updateData.endDate = new Date(changes.endDate);
      if (changes.vocabTarget) updateData.vocabTarget = parseInt(changes.vocabTarget);
      
      if (Object.keys(updateData).length > 0) {
        await prisma.goal.update({
          where: { id: goalId },
          data: updateData
        });
      }
    }

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Modify goal error", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
