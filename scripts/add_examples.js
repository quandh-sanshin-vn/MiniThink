const fs = require('fs');

const API_KEY = process.argv[2];
if (!API_KEY) {
  console.log("❌ Lỗi: Bạn chưa nhập OpenAI API Key.");
  console.log("👉 Hướng dẫn: node scripts/add_examples.js sk-...");
  process.exit(1);
}

const filePath = './public/data/japanese/vocabulary.json';
let data = [];
try {
  data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch (e) {
  console.log("❌ Lỗi: Không thể đọc file vocabulary.json.");
  process.exit(1);
}

async function processWords() {
  console.log(`🚀 Bắt đầu thêm ví dụ cho ${data.length} từ vựng...`);
  
  const batchSize = 10;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // Nếu tất cả trong batch đã có examples thì bỏ qua để tiết kiệm tiền/thời gian
    if (batch.every(w => w.examples && w.examples.length >= 3)) {
      console.log(`⏩ Bỏ qua từ ${i + 1} đến ${Math.min(i + batchSize, data.length)} (Đã có ví dụ)`);
      continue;
    }

    console.log(`⏳ Đang xử lý từ ${i + 1} đến ${Math.min(i + batchSize, data.length)}...`);
    
    const prompt = `Bạn là chuyên gia tiếng Nhật. Hãy thêm 3 câu ví dụ giao tiếp thực tế cho mỗi từ vựng sau.
Dữ liệu đầu vào:
${JSON.stringify(batch.map(w => ({ kanji: w.kanji, hiragana: w.hiragana, meaning: w.meaning })))}

Yêu cầu BẮT BUỘC:
1. Mỗi từ phải có đúng 3 câu ví dụ.
2. Trả về DUY NHẤT một MẢNG JSON, không dùng markdown (\`\`\`json), không giải thích.
3. Các object trong mảng xuất ra phải tương ứng ĐÚNG THỨ TỰ với đầu vào.

Cấu trúc output:
[
  {
    "examples": [
      { "ja": "Câu tiếng Nhật 1", "vi": "Nghĩa tiếng Việt 1" },
      { "ja": "Câu tiếng Nhật 2", "vi": "Nghĩa tiếng Việt 2" },
      { "ja": "Câu tiếng Nhật 3", "vi": "Nghĩa tiếng Việt 3" }
    ]
  },
  ...
]`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });
      
      const resData = await response.json();
      if (resData.error) {
        throw new Error(resData.error.message);
      }
      
      let text = resData.choices[0].message.content;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const generated = JSON.parse(text);
      for (let j = 0; j < generated.length; j++) {
        if (data[i + j]) {
          data[i + j].examples = generated[j].examples;
        }
      }
      
      // Lưu file ngay sau mỗi batch để tránh mất dữ liệu nếu bị lỗi giữa chừng
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Đã lưu xong từ ${i + 1} đến ${i + generated.length}.`);
      
    } catch (e) {
      console.error(`❌ Lỗi ở batch từ ${i + 1}:`, e.message);
      console.log("Dừng lại để bạn kiểm tra lỗi (có thể do hết Token hoặc lỗi mạng).");
      process.exit(1);
    }
  }
  console.log("🎉 HOÀN THÀNH! Toàn bộ từ vựng đã được cập nhật ví dụ.");
}

processWords();
