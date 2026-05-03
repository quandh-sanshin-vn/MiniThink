import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body; 
    
    if (!type || !data) {
      return NextResponse.json({ success: false, error: 'Thiếu tham số type hoặc data' }, { status: 400 });
    }

    let newItems = Array.isArray(data) ? data : JSON.parse(data);

    if (type === 'vocabulary') {
      let savedCount = 0;
      
      for (const item of newItems) {
        // Kiểm tra xem từ này đã tồn tại chưa (dựa trên kanji và hiragana)
        const existing = await prisma.vocabulary.findFirst({
          where: {
            kanji: item.kanji,
            hiragana: item.hiragana
          }
        });

        if (!existing) {
          await prisma.vocabulary.create({
            data: {
              kanji: item.kanji || '',
              hiragana: item.hiragana || '',
              meaning: item.meaning || '',
              type: item.type || 'unknown',
              level: item.level || 'N3',
              sourcePage: item.source_page ? parseInt(item.source_page) : null,
              examples: {
                create: (item.examples || []).map(ex => ({
                  ja: ex.ja,
                  vi: ex.vi
                }))
              }
            }
          });
          savedCount++;
        }
      }

      return NextResponse.json({ success: true, count: savedCount, savedPath: 'Database (PostgreSQL)' });
    } else {
      // Giữ lại logic cũ cho các type khác (grammar, conversations...)
      const dataDir = path.join(process.cwd(), 'public', 'data', 'japanese');
      await fs.mkdir(dataDir, { recursive: true });

      const filePath = path.join(dataDir, `${type}.json`);
      
      let existingData = [];
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        existingData = JSON.parse(fileContent);
      } catch(e) {
        // file does not exist, start fresh
      }

      const mergedData = [...existingData];
      let added = 0;
      for (const item of newItems) {
        const isDuplicate = mergedData.some(existing => 
          existing.hiragana === item.hiragana && existing.kanji === item.kanji
        );
        if (!isDuplicate) {
          if (!item.id) item.id = crypto.randomUUID();
          if (!item.added_date) {
            const now = new Date();
            item.added_date = now.toISOString().split('T')[0];
          }
          mergedData.push(item);
          added++;
        }
      }

      await fs.writeFile(filePath, JSON.stringify(mergedData, null, 2), 'utf8');

      return NextResponse.json({ success: true, count: added, savedPath: `/public/data/japanese/${type}.json` });
    }
  } catch (error) {
    console.error('Save Data Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
