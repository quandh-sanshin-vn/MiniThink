import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const getFiles = (folderName) => {
    const dir = path.join(process.cwd(), 'public', 'music', folderName);
    try {
      if (!fs.existsSync(dir)) {
        return [];
      }
      return fs.readdirSync(dir).filter(f => 
        f.endsWith('.mp3') || f.endsWith('.m4a') || f.endsWith('.ogg') || f.endsWith('.wav')
      );
    } catch (e) {
      return [];
    }
  };

  return NextResponse.json({
    pomodoro: getFiles('porodomo'),
    breakTime: getFiles('break-time')
  });
}
