# Mervyn MiniThink (Productivity Ecosystem)

Mervyn MiniThink là một hệ sinh thái các ứng dụng năng suất và học tập được thiết kế tối giản, dựa trên tính cách và triết lý thiết kế của **Harry Mervyn** (Tối giản - Thiết thực - Tinh tế). 

Dự án này được xây dựng trên nền tảng Next.js, React, PostgreSQL và Prisma ORM. Thay vì là một ứng dụng đơn lẻ, MiniThink tập hợp nhiều công cụ (Modules) mạnh mẽ nhằm tối ưu hóa sự tập trung và cường độ học tập của người dùng. Hiện tại, hệ thống bao gồm 2 phân hệ chính:

1. **Japanese Learning System (SRS):** Hệ thống học thuật Tiếng Nhật khắc nghiệt, ứng dụng thuật toán lặp lại ngắt quãng (Spaced Repetition - SM2) kết hợp với thiết kế giao diện Terminal Brutalist siêu ngầu.
2. **Mervyn Pomodoro Timer:** Ứng dụng quản lý thời gian làm việc tối giản với hệ thống Web Audio tự tạo tiếng ồn trắng (White/Brown noise) giúp tăng cường sự tập trung tuyệt đối.
3. **Mervyn Dev Task Terminal:** Hệ thống Todo-List dạng Kanban Brutalist dành riêng cho lập trình viên quản lý dự án nội bộ, vận hành 100% trên LocalStorage.

---

---

## 📚 Hệ thống Tài liệu Thiết kế (Specifications)

Toàn bộ triết lý thiết kế và luồng thuật toán của các ứng dụng được tách riêng để đảm bảo tính module:
- [MASTER_LEARNING_METHODOLOGY.md](./MASTER_LEARNING_METHODOLOGY.md): Triết lý học tập, hệ thống luân chuyển thẻ bài (Flashcard) và thuật toán Spaced Repetition của ứng dụng Tiếng Nhật.
- [MERVYN_TIMER_SPECIFICATIONS.md](./MERVYN_TIMER_SPECIFICATIONS.md): Triết lý thiết kế Brutalism và cấu trúc xử lý Web Audio của ứng dụng Pomodoro.
- [MERVYN_TODO_SPECIFICATIONS.md](./MERVYN_TODO_SPECIFICATIONS.md): Hướng dẫn kiến trúc Kanban ưu tiên và LocalStorage Sandbox của ứng dụng Quản lý dự án.

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
- **Mervyn Dev Task Terminal (Todo-List):** [http://localhost:3000/todo-list](http://localhost:3000/todo-list)

> **Lưu ý trong quá trình phát triển tiếp:** Nếu cần nâng cấp tính năng Music, hãy tương tác với file `route.js` và cập nhật lại mảng dữ liệu trả về cho Frontend. Khi làm việc với Web Audio API trên trình duyệt hiện đại, đảm bảo người dùng đã có tương tác (click play) trước khi gọi hàm `.play()` để tránh bị block autoplay.
