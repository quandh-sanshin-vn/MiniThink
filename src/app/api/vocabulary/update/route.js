import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { wordId, examples } = await req.json();

    // Kiểm tra từ vựng có tồn tại không
    const word = await prisma.vocabulary.findUnique({
      where: { id: wordId }
    });

    if (!word) {
      return NextResponse.json({ success: false, error: 'Word not found in Database' }, { status: 404 });
    }

    // Xóa toàn bộ câu ví dụ cũ của từ này
    await prisma.exampleSentence.deleteMany({
      where: { vocabularyId: wordId }
    });

    // Thêm các câu ví dụ mới
    if (examples && examples.length > 0) {
      await prisma.exampleSentence.createMany({
        data: examples.map(ex => ({
          vocabularyId: wordId,
          ja: ex.ja,
          vi: ex.vi
        }))
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update vocab error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
