import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(request) {
  try {
    const { filePath } = await request.json();
    if (!filePath) {
      return NextResponse.json({ success: false, error: 'Thiếu filePath' }, { status: 400 });
    }

    const absolutePath = path.join(process.cwd(), 'public', filePath);
    
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy file: ' + absolutePath }, { status: 404 });
    }

    const text = await new Promise((resolve, reject) => {
      // 1 means return text content only
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", errData => reject(new Error(errData.parserError)));
      
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      
      pdfParser.loadPDF(absolutePath);
    });

    return NextResponse.json({ 
      success: true, 
      text: text
    });

  } catch (error) {
    console.error('PDF Parse error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
