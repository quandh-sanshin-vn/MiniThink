# Mervyn MiniThink (Productivity Ecosystem)

Mervyn MiniThink là một hệ sinh thái các ứng dụng năng suất và học tập được thiết kế tối giản, dựa trên tính cách và triết lý thiết kế của **Harry Mervyn** (Tối giản - Thiết thực - Tinh tế). 

Dự án này được xây dựng trên nền tảng Next.js, React, PostgreSQL và Prisma ORM. Thay vì là một ứng dụng đơn lẻ, MiniThink tập hợp nhiều công cụ (Modules) mạnh mẽ nhằm tối ưu hóa sự tập trung và cường độ học tập của người dùng. Hiện tại, hệ thống bao gồm 2 phân hệ chính:

1. **Japanese Learning System (SRS):** Hệ thống học thuật Tiếng Nhật khắc nghiệt, ứng dụng thuật toán lặp lại ngắt quãng (Spaced Repetition - SM2) kết hợp với thiết kế giao diện Terminal Brutalist siêu ngầu.
2. **Mervyn Pomodoro Timer:** Ứng dụng quản lý thời gian làm việc tối giản với hệ thống Web Audio tự tạo tiếng ồn trắng (White/Brown noise) giúp tăng cường sự tập trung tuyệt đối.

---

## 🎨 Ngôn ngữ Thiết kế (Mervyn Style)
- **Phong cách:** Minimalism (Tối giản), loại bỏ mọi yếu tố thị giác gây nhiễu.
- **Bảng màu chủ đạo:**
  - `Blue` (#2563eb): Chế độ Pomodoro (Làm việc / Tập trung).
  - `Gray` (#64748b): Chế độ Short Break (Nghỉ ngắn).
  - `Black` (#0f172a): Chế độ Long Break (Nghỉ dài).
- **Trải nghiệm người dùng (UX):** Tooltips và chữ giải thích được làm nhỏ, gọn gàng, tự động ẩn/hiện hợp lý để không làm rác giao diện.

---

## ✨ Tính năng Nổi bật

### 1. Quản lý Thời gian Thông minh
- Hỗ trợ đầy đủ chu kỳ: Pomodoro, Short Break, Long Break.
- Tự động thống kê số chu kỳ làm việc (Sessions) đã hoàn thành.

### 2. Cài đặt Thời gian & Quick Profiles
- Cho phép người dùng tùy chỉnh thời lượng phút cho từng chế độ.
- Hỗ trợ chọn nhanh các Profiles thiết lập sẵn:
  - **Mặc định:** 25 làm / 5 nghỉ ngắn / 15 nghỉ dài
  - **Tập trung sâu:** 50 làm / 10 nghỉ ngắn / 30 nghỉ dài
  - **Nhịp độ nhanh:** 15 làm / 3 nghỉ ngắn / 10 nghỉ dài

### 3. Hệ thống Âm nhạc (Music Background)
Ứng dụng tự động đọc các file nhạc (`.mp3`, `.wav`, v.v.) trực tiếp từ thư mục local để phát nhạc nền:
- **Nhạc Pomodoro (`public/music/porodomo/`):** Tự động phát **tuần tự** lần lượt từng bài hát trong thư mục để duy trì mạch làm việc.
- **Nhạc Break (`public/music/break-time/`):** Tự động phát **ngẫu nhiên (Random)** các bài hát trong thư mục để tạo cảm giác thư giãn mới mẻ.
- **Fallback Noise (Âm thanh nhân tạo):** Trong trường hợp thư mục nhạc trống, hệ thống sử dụng **Web Audio API** để tự động tổng hợp ra *Brown noise* (tiếng mưa rơi - cho Pomodoro) và *Pink noise* (tiếng gió biển - cho Break) hoàn toàn không cần file gốc.

### 4. Hệ thống Âm báo (Alert Sounds)
Không dùng file tải ngoài để tránh lỗi 404 (Link rot). Ứng dụng dùng toán học và dao động sóng âm (Web Audio API) để tạo ra:
- **Hết giờ làm:** 3 tiếng bíp sắc gọn (Sóng Sine) để đánh thức sự chú ý.
- **Hết giờ nghỉ:** 2 tiếng chuông ngân nga êm dịu (Sóng Triangle) để gọi người dùng quay lại bàn làm việc.

---

## 📁 Cấu trúc Thư mục Quan trọng

- `src/app/timmer/page.jsx`: Logic chính của Mervyn Timer (Quản lý trạng thái, phát nhạc, Web Audio API, UI).
- `src/app/timmer/timmer.css`: File CSS thiết kế giao diện Minimalist.
- `src/app/api/music/route.js`: API Backend để quyét và gửi danh sách tên file nhạc từ thư mục `public/music`.
- `public/music/porodomo/`: Thư mục thả nhạc nền lúc làm việc.
- `public/music/break-time/`: Thư mục thả nhạc nền lúc nghỉ ngơi.

---

## 🚀 Hướng dẫn Cài đặt & Chạy ứng dụng (Dành cho người mới Clone)

Dự án này sử dụng **Next.js** kết hợp với **PostgreSQL** (qua Docker) và **Prisma ORM**. Hãy làm theo các bước sau để khởi chạy dự án từ con số 0.

### Bước 1: Clone mã nguồn
```bash
git clone https://github.com/quandh-sanshin-vn/MiniThink.git
cd MiniThink
```

### Bước 2: Cài đặt thư viện (Dependencies)
```bash
npm install
```

### Bước 3: Khởi chạy Cơ sở dữ liệu (PostgreSQL)
Dự án có sẵn file `docker-compose.yml`. Bạn cần cài đặt Docker trên máy, sau đó chạy lệnh:
```bash
docker-compose up -d
```
*Lệnh này sẽ tải và chạy một container PostgreSQL ở port `5432` dưới ngầm (background).*

### Bước 4: Thiết lập Biến môi trường (.env)
Tạo file `.env` ở thư mục gốc (nếu chưa có) và copy nội dung sau vào:
```env
# URL kết nối Database (Mặc định theo docker-compose.yml)
DATABASE_URL="postgresql://root:password@localhost:5432/minithink?schema=public"

# OpenAI API Key (Tùy chọn - Dành cho chức năng quét PDF trong Creator)
# OPENAI_API_KEY="your_api_key_here"
```

### Bước 5: Khởi tạo Database (Prisma Migration)
Chạy lệnh sau để Prisma nạp cấu trúc bảng (Schema) vào Database của bạn:
```bash
npx prisma db push
```
*(Nếu muốn quản lý bằng file migration chuẩn, bạn có thể dùng `npx prisma migrate dev`)*

Tiếp theo, tạo Prisma Client để tương tác code:
```bash
npx prisma generate
```

### Bước 6: Nạp dữ liệu mẫu (Seeding - Tùy chọn)
Nếu bạn muốn có sẵn dữ liệu Từ vựng / Ngữ pháp để test app mà không phải nhập tay, hãy chạy script nạp dữ liệu:
```bash
node seed_vocab.js
```

### Bước 7: Chạy ứng dụng (Development Server)
```bash
npm run dev
```

### 🌐 Truy cập các Modules:
- **Hệ thống học Tiếng Nhật (Spaced Repetition):** [http://localhost:3000/learning-japanese/goals](http://localhost:3000/learning-japanese/goals)
- **Mervyn Pomodoro Timer:** [http://localhost:3000/timmer](http://localhost:3000/timmer)

> **Lưu ý trong quá trình phát triển tiếp:** Nếu cần nâng cấp tính năng Music, hãy tương tác với file `route.js` và cập nhật lại mảng dữ liệu trả về cho Frontend. Khi làm việc với Web Audio API trên trình duyệt hiện đại, đảm bảo người dùng đã có tương tác (click play) trước khi gọi hàm `.play()` để tránh bị block autoplay.
