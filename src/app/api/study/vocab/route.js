import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Missing taskId' }, { status: 400 });
    }

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    let vocabs = [];
    const itemIds = Array.isArray(task.itemIds) ? task.itemIds : [];

    if (itemIds.length > 0) {
      // Task already has allocated itemIds (Review task, or already-initialized/completed NEW task)
      vocabs = await prisma.vocabulary.findMany({
        where: { id: { in: itemIds } },
        include: { examples: true }
      });
    } else if (task.status === 'COMPLETED') {
      // Edge case: Task was completed before we implemented itemIds saving.
      // We just fetch any learned items to let them practice.
      const match = task.title.match(/\d+/);
      const quota = match ? parseInt(match[0], 10) : 5;
      
      const learnedProgress = await prisma.learningProgress.findMany({
        where: { userId: task.userId, itemType: task.taskType || 'vocab' },
        take: quota,
        select: { itemId: true }
      });
      const learnedIds = learnedProgress.map(p => p.itemId);
      
      // Filter out invalid UUIDs (e.g. mock data like 'v-old-5') to prevent DB casting errors
      const validUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validLearnedIds = learnedIds.filter(id => validUuidRegex.test(id));
      
      if (validLearnedIds.length > 0) {
        vocabs = await prisma.vocabulary.findMany({
          where: { id: { in: validLearnedIds } },
          include: { examples: true }
        });
      }
    } else {
      // It's an uninitialized NEW task. We need to extract the quota from the title
      const match = task.title.match(/\d+/);
      const quota = match ? parseInt(match[0], 10) : 5; // default 5 if not found

      // Find already learned item IDs
      const learnedProgress = await prisma.learningProgress.findMany({
        where: { userId: task.userId, itemType: 'vocab' },
        select: { itemId: true }
      });
      const learnedIds = learnedProgress.map(p => p.itemId);

      const validUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validLearnedIds = learnedIds.filter(id => validUuidRegex.test(id));

      // Fetch new vocabulary not in learnedIds (Ordered chronologically by source book page!)
      vocabs = await prisma.vocabulary.findMany({
        where: {
          id: { notIn: validLearnedIds }
        },
        take: quota,
        orderBy: [
          { sourcePage: 'asc' },
          { id: 'asc' } // Tie-breaker to ensure absolute deterministic output
        ],
        include: { examples: true }
      });

      // Save these itemIds to the task so if user refreshes/re-learns, they get the same set
      if (vocabs.length > 0) {
        await prisma.dailyTask.update({
          where: { id: task.id },
          data: { itemIds: vocabs.map(v => v.id) }
        });
      }
    }

    // Shuffle the vocabs for randomness
    const shuffled = vocabs.sort(() => 0.5 - Math.random());
    
    return NextResponse.json({ success: true, data: shuffled });
  } catch (error) {
    console.error("Fetch vocab error", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
