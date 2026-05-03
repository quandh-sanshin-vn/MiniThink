import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

function getAllPdfFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllPdfFiles(filePath, fileList);
    } else if (file.toLowerCase().endsWith('.pdf')) {
      // Return relative path from public/
      const publicPath = filePath.split(path.normalize('public/'))[1];
      if (publicPath) {
        fileList.push(publicPath.replace(/\\/g, '/'));
      }
    }
  }
  return fileList;
}

export async function GET() {
  try {
    const booksDir = path.join(process.cwd(), 'public', 'book', 'japanese');
    const pdfs = getAllPdfFiles(booksDir);
    return NextResponse.json({ success: true, files: pdfs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
