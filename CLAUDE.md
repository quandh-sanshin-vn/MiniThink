@AGENTS.md

## Personality & Preferences (Harry Mervyn)
- **Tên gợi nhớ:** Harry Mervyn
- **Màu chủ đạo:** Blue, xám, đen
- **Style design:** Minimalism, Terminal V2, dark mode, Neo Brutalism.
- **Tính năng:** Đơn giản, thiết thực   
- **Trải nghiệm người dùng:** Luôn có giải thích bằng chữ nhỏ, dễ hiểu, dễ dùng nhưng không làm nhiễu mắt.
- **Scroll Rules:** Không để phát sinh scroll dọc (thanh cuộn dọc) cho các màn hình chức năng chính (Dashboard, Main View). Chỉ sử dụng scroll dọc bên trong các vùng nhỏ khi nội dung là danh sách (List) hoặc Form điền quá dài. Toàn bộ bố cục tổng thể nên nằm trọn vẹn trong một màn hình (Full height).

## Coding Standards & Conventions

### 1. Xử Lý Thời Gian (Timezone Safety)
- Luôn cẩn trọng với Timezone Offset khi giao tiếp giữa Frontend (Client) và DB.
- Khi chốt ngày ở mức độ Calendar (Không cần giờ phút), luôn xử lý bằng chuỗi `YYYY-MM-DD` và đính kèm thủ công `T00:00:00.000Z` trước khi đẩy xuống DB để tránh việc UTC bị lùi mất một ngày.

### 2. Quản Trị Dữ Liệu (Soft Deletion & Fallback)
- **Soft Delete:** Không Hard-delete các thực thể cha có chứa lịch sử (ví dụ: `Goal`). Chuyển `status` thành `DELETED` để giữ nguyên các Audit Logs bên dưới phục vụ tra cứu.
- **Backward Compatibility:** Khi cập nhật Schema DB (thêm cột mới như `eventType`), phải luôn viết code frontend dự phòng (fallback) để xử lý dữ liệu cũ đã tồn tại trước đó nhằm tránh sập UI hoặc hiển thị sai logic.

### 3. Giao Diện Neo-Terminal (UI Component Replacements)
- Tuyệt đối hạn chế sử dụng các thẻ Native mặc định của trình duyệt mang tính bo tròn (như `<select>`, `window.confirm`, `window.alert`).
- Phải tự thiết kế lại (Custom) bằng thẻ `div`, `button` phối hợp với Tailwind (sử dụng `appearance-none`, viền vuông vức, nền đen, chữ xanh ngọc/đỏ, `uppercase`, `font-mono`) để đồng bộ 100% ngôn ngữ thiết kế Terminal.

### 4. An Toàn Với Tailwind JIT
- Không bao giờ được cộng chuỗi để tạo tên class động (Ví dụ: `text-${color}-500`) vì Tailwind JIT compiler sẽ bỏ qua (Purge) chúng.
- Luôn viết tường minh toàn bộ tên class dưới dạng string literal hoặc sử dụng Dictionary (Ví dụ: `if (err) return 'text-rose-500';`).

### 5. Quản Lý Trạng Thái UI (Smart State Handling)
- Khi thực hiện hành động phá hủy/xóa một mục đang được Active, State bắt buộc phải tự động (Auto-Switch) chuyển con trỏ sang một mục hợp lệ tiếp theo.
- Phải luôn có màn hình Zero-State (Empty State) bắt mắt để đón người dùng nếu danh sách trống.
