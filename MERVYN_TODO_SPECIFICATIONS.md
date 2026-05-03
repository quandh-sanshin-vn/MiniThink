# Mervyn Todo Specifications (Dev Task Terminal)

Mervyn Todo List (hay còn gọi là Dev_Task_Terminal) là một công cụ quản lý dự án nội bộ dành cho hệ sinh thái MiniThink, được thiết kế theo chuẩn ngôn ngữ Brutalism của **Harry Mervyn**.

Thay vì sử dụng các phần mềm quản lý cồng kềnh như Jira hay Trello, MiniThink tích hợp sẵn một Terminal tối giản, hoạt động hoàn toàn ở chế độ LocalStorage Sandbox (không cần Database) để đảm bảo tốc độ và sự riêng tư tuyệt đối cho lập trình viên.

---

## 🎨 Ngôn ngữ Thiết kế (Brutalist UX)
- **Phong cách:** Terminal Emulator (Giao diện dòng lệnh ảo).
- **Màu sắc:** Nền đen nhám (`#09090b`), viền xám (`#262626`), kết hợp với các mã màu Cảnh báo kỹ thuật.
- **Tương tác:** Lược bỏ toàn bộ các animation màu mè dư thừa, thay vào đó là các button chuyển trạng thái cực kỳ dứt khoát và hiệu ứng Hover viền.

---

## 🛠 Tính năng Cốt lõi

### 1. Phân loại Mức độ Ưu tiên (Priority Matrix)
Mỗi Task được yêu cầu gán nhãn ưu tiên rõ ràng theo chuẩn kỹ thuật phần mềm:
- **[P0] CRITICAL (Đỏ - Rose):** Lỗi hệ thống nghiêm trọng, crash app, cần hotfix ngay lập tức.
- **[P1] HIGH (Cam - Amber):** Tính năng quan trọng, lỗi ảnh hưởng diện rộng, cần ưu tiên làm sớm.
- **[P2] NORMAL (Xanh - Blue):** Mức độ mặc định cho các Task phát triển tính năng thông thường.
- **[P3] LOW (Xám - Neutral):** Các ý tưởng, refactor code, tài liệu (không gấp).

### 2. Phân loại Mô-đun (Module Tagging)
Hỗ trợ gắn thẻ (Tag) để phân định rõ ràng Task thuộc phân hệ nào trong hệ sinh thái MiniThink:
- `CORE`: Cốt lõi hệ thống, UI/UX chung.
- `SRS`: Hệ thống tiếng Nhật (Spaced Repetition).
- `TIMER`: Ứng dụng Pomodoro Timer.
- `TODO`: Chính ứng dụng Todo List này.

### 3. Quy trình làm việc 3 Cột (3-Column Kanban)
Bảng Kanban tối giản chỉ với 3 trạng thái tĩnh:
- **// TODO:** Chờ xử lý.
- **// IN_PROGRESS:** Đang code.
- **// DONE:** Hoàn tất (Task tự động bị gạch ngang và mờ đi).

### 4. Môi trường Hộp cát (LocalStorage Sandbox)
- Không kết nối Prisma Database.
- Dữ liệu được lưu thẳng vào `localStorage` của trình duyệt theo key `minithink_dev_tasks`.
- Thích hợp cho cá nhân phát triển trên thiết bị local, không lo bị rác Database thật.

---

## 📁 Kiến trúc File
- `src/app/todo-list/page.jsx`: Toàn bộ UI, logic lưu trữ LocalStorage, và xử lý mảng (Move, Delete, Add) đều nằm gọn trong file này.
