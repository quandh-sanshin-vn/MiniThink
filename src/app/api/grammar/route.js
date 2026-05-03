import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const data = await req.json();
    const { patternSyntax, meaning, nuance, initialJa, initialVi } = data;

    // TODO: Khi tích hợp Auth thật (NextAuth), lấy userId từ session
    // Tạm thời dùng dummy userId (User đã được seed)
    const dummyUserId = "11111111-1111-1111-1111-111111111111"; // Default seed user

    // 1. Tạo cấu trúc ngữ pháp mới
    const newGrammar = await prisma.userGrammar.create({
      data: {
        userId: dummyUserId,
        patternSyntax,
        meaning,
        nuance,
        examples: {
          create: [
            {
              jaSentence: initialJa,
              viMeaning: initialVi,
              isReviewGenerated: false
            }
          ]
        }
      }
    });

    // 2. Tự động sinh bản ghi LearningProgress (SRS) để ngày mai ôn tập
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await prisma.learningProgress.create({
      data: {
        userId: dummyUserId,
        itemId: newGrammar.id,
        itemType: 'grammar',
        qualityScore: 4, // Mặc định lần đầu là điểm cao nhất
        interval: 1,     // 1 ngày sau ôn lại
        easeFactor: 2.5,
        nextReviewDate: tomorrow,
        consecutiveCorrect: 1
      }
    });

    return NextResponse.json({ success: true, data: newGrammar });

  } catch (error) {
    console.error("Error saving UserGrammar:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
