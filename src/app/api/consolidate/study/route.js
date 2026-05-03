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

    let itemIds = Array.isArray(task.itemIds) ? task.itemIds : [];
    let progressItems = [];

    if (itemIds.length > 0) {
      // If already generated, fetch them
      progressItems = await prisma.learningProgress.findMany({
        where: { id: { in: itemIds } }
      });
    } else if (task.status !== 'COMPLETED') {
      // Fetch all overdue items
      progressItems = await prisma.learningProgress.findMany({
        where: {
          userId: task.userId,
          nextReviewDate: { lte: new Date() },
          itemType: { in: ['vocab', 'grammar'] }
        }
      });
      if (progressItems.length > 0) {
         await prisma.dailyTask.update({
           where: { id: task.id },
           data: { itemIds: progressItems.map(p => p.id) }
         });
      }
    }

    if (progressItems.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Populate actual data
    const vocabIds = progressItems.filter(p => p.itemType === 'vocab').map(p => p.itemId);
    const grammarIds = progressItems.filter(p => p.itemType === 'grammar').map(p => p.itemId);

    let vocabs = [];
    if (vocabIds.length > 0) {
      const validUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validVocabIds = vocabIds.filter(id => validUuidRegex.test(id));
      if (validVocabIds.length > 0) {
         vocabs = await prisma.vocabulary.findMany({
           where: { id: { in: validVocabIds } },
           include: { examples: true }
         });
      } else {
         // Maybe they are integers? But Schema says uuid. 
         // Some previous code handled them differently. We'll just fetch normally if they are standard uuids.
      }
    }

    let grammars = [];
    if (grammarIds.length > 0) {
      grammars = await prisma.userGrammar.findMany({
        where: { id: { in: grammarIds } }
      });
    }

    // Map them to a unified flashcard format
    const cards = progressItems.map(p => {
      if (p.itemType === 'vocab') {
        const v = vocabs.find(v => v.id === p.itemId);
        if (!v) return null;
        return {
          progressId: p.id,
          itemType: 'vocab',
          itemId: p.itemId,
          front: v.kanji || v.hiragana,
          backTitle: v.kanji ? v.hiragana : '',
          backMeaning: v.meaning,
          examples: v.examples || []
        };
      } else if (p.itemType === 'grammar') {
        const g = grammars.find(g => g.id === p.itemId);
        if (!g) return null;
        return {
          progressId: p.id,
          itemType: 'grammar',
          itemId: p.itemId,
          front: g.patternSyntax,
          backTitle: g.meaning,
          backMeaning: g.nuance || '',
          examples: []
        };
      }
      return null;
    }).filter(Boolean);

    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);

    return NextResponse.json({ success: true, data: cards });
  } catch (error) {
    console.error("Consolidate Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
