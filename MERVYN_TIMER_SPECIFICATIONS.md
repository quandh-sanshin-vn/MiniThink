# Mervyn Timer Specifications

Mervyn Timer là một ứng dụng Pomodoro được thiết kế tối giản dựa trên tính cách và triết lý thiết kế của **Harry Mervyn** (Tối giản - Thiết thực - Tinh tế). 

Dự án này ưu tiên tập trung vào hiệu năng, giao diện sạch sẽ, và các tính năng âm thanh được tùy biến sâu nhằm tăng cường tối đa sự tập trung cho người dùng.

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

### 5. Kỷ Luật & Cảnh Báo Toàn Cục (Global Lock & Discipline)
- **Cảnh báo liên hệ thống (Global Alert):** Khi hết giờ làm việc, cảnh báo sẽ hiển thị chèn lên toàn bộ ứng dụng (cho dù người dùng đang ở module Todo, Japanese SRS hay Home).
- **Luồng Bỏ qua (Skip):** Nếu người dùng chọn "Skip" để tiếp tục công việc, thời gian Pomodoro mới sẽ bắt đầu đếm ngược ngay lập tức, và bản nhạc đang phát sẽ tiếp tục chạy một cách liền mạch, không bị đứt đoạn.
- **Khóa Màn Hình Nghỉ Ngơi (Screen Lock):** Nếu chọn "Bắt Đầu Nghỉ Ngơi", màn hình sẽ bị khóa (Đen 100%) kèm bộ đếm ngược, buộc người dùng rời mắt khỏi màn hình để bảo vệ sức khỏe.
- **Hình phạt Cố chấp:** Hệ thống theo dõi số lần Skip trong ngày (reset mỗi ngày). Nều cố tình Skip 3 lần liên tiếp, thời gian nghỉ lần tiếp theo sẽ bị nhân đôi và KHÔNG THỂ Skip.
- **Bắt buộc Nghỉ Dài (Mandatory Long Break):** Cứ sau mỗi 5 vòng làm việc (Sessions), người dùng bắt buộc phải vào kỳ Nghỉ Dài, và tuyệt đối không có tùy chọn Skip ở vòng này.

### 6. Trải nghiệm Âm thanh Liền mạch (Audio Persistence)
- **Lưu trữ Vị trí Audio:** Hệ thống tự động theo dõi vị trí mili-giây của bản nhạc đang phát và ghi chú trực tiếp vào Sandbox (LocalStorage). Khi người dùng reload (F5) hoặc tắt trang mở lại, bản nhạc sẽ được phát tiếp ở đúng giây đã dừng lại thay vì phát lại từ đầu.

---

## 📁 Cấu trúc Thư mục Quan trọng

- `src/components/TimerContext.jsx`: Logic chính của Mervyn Timer (Quản lý trạng thái, phát nhạc, Web Audio API, Global Lock overlay, Audio Persistence).
- `src/app/timmer/page.jsx`: File UI thiết kế giao diện Minimalist và bảng điều khiển Timer.
- `src/app/api/music/route.js`: API Backend để quyét và gửi danh sách tên file nhạc từ thư mục `public/music`.
- `public/music/porodomo/`: Thư mục thả nhạc nền lúc làm việc.
- `public/music/break-time/`: Thư mục thả nhạc nền lúc nghỉ ngơi.
