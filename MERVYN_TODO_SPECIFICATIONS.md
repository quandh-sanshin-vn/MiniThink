# Mervyn Todo Specifications (Dev Task Terminal)

Mervyn Todo List (hay còn gọi là Dev_Task_Terminal) là một công cụ quản lý dự án nội bộ dành cho hệ sinh thái MiniThink, được thiết kế theo chuẩn ngôn ngữ Brutalism của **Harry Mervyn**.

Thay vì chỉ quản lý dữ liệu cục bộ như trước đây, phiên bản mới nhất của Todo List đã được **nâng cấp thành một cổng tích hợp (Gateway)**, đồng bộ trực tiếp hai chiều với hệ thống **Backlog API**, lưu trữ dữ liệu thông qua cơ sở dữ liệu (Prisma/PostgreSQL) nhằm tăng cường hiệu suất quản lý dự án cho cá nhân.

---

## 🎨 Ngôn ngữ Thiết kế (Brutalist UX)
- **Phong cách:** Terminal Emulator (Giao diện dòng lệnh ảo) và Compact List.
- **Màu sắc:** Nền tối tĩnh (`#09090b`), viền mỏng (`border-neutral-800`), kết hợp với các mã màu Cảnh báo kỹ thuật để đánh dấu trạng thái và mức độ ưu tiên.
- **Hỗ trợ Theme:** Giao diện hỗ trợ chuẩn Dark / Light theme. Trong đó, Task Cha mang màu sắc trung tính, còn các Sub-task sẽ được đánh dấu bằng background và viền phân biệt rõ rệt.

---

## 🛠 Tính năng Cốt lõi & Giải thích chức năng

### 1. Đồng bộ đám mây (System Integration Config)
- **Chức năng:** Cấu hình thông tin tích hợp nền tảng (hiện tại hỗ trợ Backlog).
- **Hoạt động:** Người dùng nhập `Domain` và `API Key` của Backlog. Hệ thống sẽ kết nối, tải về toàn bộ Project (Workspace) và Task (Issues), sau đó lưu vào Database (`SyncProject`, `SyncTask`) để duyệt nội bộ cực nhanh mà không bị trễ do mạng. Hệ thống tự động fetch và bảo toàn cấu trúc Task Cha - Task Con (Parent-Sibling fetch).

### 2. Giao diện Cây (Parent-Child Task Tree)
- **Chức năng:** Hiển thị các task có quan hệ Cha-Con theo cấu trúc phân cấp (đệ quy).
- **Hoạt động:** Các sub-task sẽ được thụt lề dưới task cha.
  - Bộ lọc thông minh: Nếu một sub-task thỏa mãn điều kiện lọc (ví dụ: đang In Progress), thì Task Cha của nó cũng sẽ tự động được hiển thị để giữ nguyên bối cảnh (Context), ngay cả khi Task Cha đó không thỏa mãn bộ lọc.
  - **MY SUBTASKS Toggle:** Task cha có một nút bấm đặc biệt cho phép "ẩn/hiện các sub-task của người khác", giúp bạn ngay lập tức chỉ tập trung vào các sub-task được gán cho chính mình.

### 3. Tạo nhanh QA Sub-task (Quick QA Shell)
- **Chức năng:** Tạo nhanh một sub-task kiểm thử hoặc đặt câu hỏi (QA) cho tính năng tương ứng.
- **Hoạt động:** Bấm nút `[+ QA]` trên một task cha. Điền Tên Feature, Mô tả tóm tắt và Người phụ trách. Hệ thống sẽ gọi Backlog API để tạo sub-task với format tên chuẩn: `Q&A - [Feature] - [Mô tả]`. Hệ thống sẽ tự động gán Task Type là QA (Confirm/Question) và mở ngay URL của task mới trên trình duyệt để người dùng đính kèm ảnh nếu cần.

### 4. Sao chép định dạng Rich Text (Smart Clipboard)
- **Chức năng:** Bấm nút `[ COPY ]` tại mỗi task để sao chép.
- **Hoạt động:** Nội dung sao chép sẽ mang định dạng HTML (`Rich Text`). Khi bạn dán (Paste) vào Slack, Teams, Chatwork,... nó sẽ tự động dán dưới dạng một Hyperlink chứa mã Task dẫn thẳng tới Backlog, kèm theo Tiêu đề task trên cùng 1 dòng. (VD: `[XAI_SHINKO-164] Lỗi hiển thị`).

### 5. Phân loại Mức độ Ưu tiên (Priority Labels)
Các task được map tự động từ độ ưu tiên của Backlog sang chuẩn nhãn hệ thống:
- **[HIGH] (Cam - Amber):** Độ ưu tiên cao.
- **[NORMAL] (Xanh - Blue):** Mức độ bình thường.
- **[LOW] (Xám - Neutral):** Mức độ thấp.

### 6. Đa ngôn ngữ (i18n)
Toàn bộ giao diện, từ thanh điều hướng, nút bấm, cho đến cửa sổ Config, QA Shell đều hỗ trợ hiển thị 3 ngôn ngữ: Tiếng Việt, Tiếng Anh, Tiếng Nhật dựa vào Global Context.

---

## 📖 Hướng dẫn sử dụng (User Guide)

1. **Khởi tạo kết nối:**
   - Tại màn hình Todo, bấm nút `[ SYS_CONFIG ]` góc trên cùng.
   - Nhập Backlog Domain (VD: `sanshinbts.backlog.com`) và API Key của bạn.
   - Bấm `SAVE & FULL SYNC`. Hệ thống sẽ lưu cấu hình và kéo dữ liệu về.

2. **Duyệt và Lọc Task:**
   - Chọn Workspace ở thanh Header nếu có nhiều dự án.
   - Sử dụng thanh Tìm kiếm, Dropdown lọc Project, hoặc Dropdown lọc Trạng thái (TODO, IN_PROGRESS, DONE) để thu hẹp phạm vi công việc.
   - Để biết phần việc cụ thể của mình trong một tính năng lớn, bấm nút `MY SUBTASKS` ở task cha tương ứng.

3. **Tạo Task QA:**
   - Khi có lỗi phát sinh cần tạo QA cho một task, tìm task đó trên hệ thống và bấm `+ QA`.
   - Cửa sổ Quick QA Shell hiện lên -> Nhập các thông tin vắn tắt -> Bấm `[ INITIATE QA ]`.
   - Một tab mới mở ra trỏ tới hệ thống Backlog để bạn tiếp tục đính kèm hình ảnh/log.

4. **Báo cáo tiến độ (Báo cáo chéo):**
   - Bấm nút `[ COPY ]` ở task bạn vừa hoàn thành hoặc cần hỏi đáp.
   - `Cmd + V` (hoặc `Ctrl + V`) vào cửa sổ chat với team, hệ thống sẽ tự động in ra đường link có tên đẹp đẽ không cần thao tác thêm.

---

## 📁 Kiến trúc Cơ sở dữ liệu & API
- **Prisma Schema:** `IntegrationConfig` (Lưu thông tin API Key), `SyncProject` (Lưu danh sách dự án), `SyncTask` (Lưu cục bộ Backlog Issues).
- **API `/api/tasks/sync`:** Đảm nhiệm việc fetch dữ liệu đồng bộ, tự động dò tìm cấu trúc Parent-Sibling.
- **API `/api/tasks/qa`:** Nhận payload từ client và gọi POST sang Backlog API để tạo sub-task mới.
- **API `/api/config`:** Mở rộng lấy thông tin User hiện tại (myself) để nhận diện `isMyTask` trên giao diện.
