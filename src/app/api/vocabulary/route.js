import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const vocabularies = await prisma.vocabulary.findMany({
      include: {
        examples: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Format data back to match the old JSON structure so frontend won't break
    const formattedData = vocabularies.map(v => ({
      id: v.id,
      kanji: v.kanji,
      hiragana: v.hiragana,
      meaning: v.meaning,
      type: v.type,
      level: v.level,
      source_page: v.sourcePage,
      examples: v.examples.map(ex => ({
        ja: ex.ja,
        vi: ex.vi
      }))
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Failed to fetch vocabulary:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
