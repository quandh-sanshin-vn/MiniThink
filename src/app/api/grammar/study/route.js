import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) return NextResponse.json({ success: false, error: "Missing taskId" }, { status: 400 });

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId }
    });

    if (!task) return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });

    const itemIds = Array.isArray(task.itemIds) ? task.itemIds : [];
    const match = task.title.match(/\d+/);
    const quota = match ? parseInt(match[0], 10) : 1;

    let grammars = [];
    if (itemIds.length > 0) {
      grammars = await prisma.userGrammar.findMany({
        where: { id: { in: itemIds } }
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: grammars,
      taskInfo: {
        id: task.id,
        title: task.title,
        quota,
        isCompleted: task.status === 'COMPLETED'
      }
    });
  } catch (error) {
    console.error("Fetch grammar Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { taskId, grammars } = await request.json();
    const task = await prisma.dailyTask.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });

    const newGrammarIds = [];
    for (const g of grammars) {
      const created = await prisma.userGrammar.create({
        data: {
          userId: task.userId,
          patternSyntax: g.patternSyntax,
          meaning: g.meaning,
          nuance: g.nuance || ''
        }
      });
      newGrammarIds.push(created.id);
      
      await prisma.learningProgress.create({
        data: {
          userId: task.userId,
          itemType: 'grammar',
          itemId: created.id,
          learningPhase: 1,
          nextReviewDate: new Date(),
          lastReviewedAt: new Date()
        }
      });
    }

    await prisma.dailyTask.update({
      where: { id: taskId },
      data: { 
        itemIds: newGrammarIds,
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    await prisma.planModificationLog.create({
      data: {
        userId: task.userId,
        goalId: task.goalId,
        eventType: 'TASK_COMPLETED',
        details: `Inputted ${grammars.length} new grammar rules for task: ${task.title}`,
        changes: {}
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit grammar input Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
