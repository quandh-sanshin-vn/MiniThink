# 🧠 TỔNG HỢP PHƯƠNG PHÁP LUẬN & THUẬT TOÁN CỐT LÕI (MASTER LEARNING METHODOLOGY)

Tài liệu này là sự hợp nhất của toàn bộ triết lý thiết kế (Mervyn Style), Phương pháp lập kế hoạch (Goal Breakdown), và Thuật toán Ôn tập (Spaced Repetition System - SRS) dành cho hệ thống Japanese Learner.

---

## PHẦN 1: TRIẾT LÝ THIẾT KẾ & 4 TRỤ CỘT HỌC TẬP

Hệ thống được thiết kế theo triết lý **Harry Mervyn**: Tối giản, thanh lịch, không gamification màu mè, tập trung vào sự tập trung và tính thực chiến.

### 4 Trụ Cột Chức Năng:
1. **Học Từ Vựng (Word Map & Phản xạ 10s):** Không chỉ nhớ mặt chữ, phải phản xạ dịch câu trong `< 10s`. Hệ thống Word Map phát triển từ 1 từ vựng gốc thành nhiều câu ghép, câu phức.
2. **Học Ngữ Pháp (Grammar):** Không lý thuyết dài dòng. Học qua ví dụ (Mervyn Tooltip) với cấu trúc lắp ghép cực ngắn.
3. **Hội Thoại Thực Chiến (Daily Conversation):** Luyện nghe - nói qua kịch bản hội thoại thực tế (Nhà ga, Mua sắm, Phỏng vấn).
4. **Quản Lý Kế Hoạch (Goals & Auto-Breakdown):** Bảng điều khiển (Terminal V2) bắt buộc học đan xen (Interleaving), đập tan việc "học lệch".

---

## PHẦN 2: PHƯƠNG PHÁP LUẬN LẬP KẾ HOẠCH (PLANNING & BREAKDOWN)

Để phá bỏ thói quen học ngẫu hứng, ứng dụng ép người dùng vào kỷ luật thông qua các phương pháp giáo dục kinh điển:

### 1. Phân Tích Mục Tiêu (SMART)
*   Mục tiêu phải là các con số định lượng (Ví dụ: 1000 từ vựng N3, 150 mẫu ngữ pháp) thay vì cảm tính "muốn giao tiếp tốt".
*   Có Start Date và End Date (Time-bound).

### 2. Thuật Toán Thác Nước Năng Động (Dynamic Waterfall) & Trần Tải Trọng
Thay vì chia đều tăm tắp Khối lượng MỚI mỗi ngày (Average Distribution) gây ra hiện tượng bùng nổ ôn tập (Anki Hell), hệ thống chia kế hoạch làm 2 luồng:
*   **Static Plan (Ghi sẵn):** Chỉ rải Khối lượng học MỚI theo Chu kỳ sinh học 4 ngày.
*   **Dynamic Plan (Tính toán mỗi sáng):** Quét các từ vựng CŨ đến hạn ôn tập (Dọn nợ).

> [!IMPORTANT]
> **Quy tắc Trần Tải Trọng (Capacity Cap) & Ưu Tiên Dọn Nợ:**  
> Bộ não chỉ chịu tải tối đa `100 Items/Ngày`. Hệ thống luôn ưu tiên **Dọn nợ cũ trước**. Nếu tổng Review Tasks > 100, hệ thống tự động đóng băng Static Plan (New Tasks = 0) của ngày hôm đó cho đến khi giải quyết xong đống nợ.

### 3. Chu Kỳ Sinh Học 4 Ngày (4-Day Micro-cycle)
Khối lượng học MỚI được phân bổ nhịp nhàng như sau:
*   **Day 1 (Nạp mạnh):** Nhồi 60% chỉ tiêu Từ vựng/Ngữ pháp của cả chu kỳ.
*   **Day 2 (Nạp nhẹ):** Nhồi 40% chỉ tiêu Từ vựng/Ngữ pháp còn lại. Chuyển dần sang Test Phản xạ.
*   **Day 3 (Thực hành Scaffolding):** Đóng băng Từ/Ngữ pháp mới (0%). Dồn 50% chỉ tiêu vào Test Phản xạ & Mô phỏng Hội thoại.
*   **Day 4 (Tiêu Hóa & Phản Xạ Toàn Diện):** **0% KIẾN THỨC MỚI.** Đây là ngày Tổng Ôn (Consolidate) và dọn sạch nợ đọng của 3 ngày trước.

### 4. Phân Mảnh (Chunking) & Giàn Giáo (Scaffolding)
*   **Chunking / Interleaving:** Bài tập mỗi ngày luôn được trộn lẫn (Từ vựng + Ngữ pháp + Map) để não không mệt mỏi.
*   **Scaffolding:** Tháo dỡ sự trợ giúp dần dần:
    *   *Mức 1:* Flashcard (đầy đủ Furigana, Tiếng Việt, Romaji).
    *   *Mức 2:* Word Map (Chỉ có Kanji).
    *   *Mức 3:* Reflex Test (Chỉ có Tiếng Việt, tự bật ra Tiếng Nhật trong 10s).

---

## PHẦN 3: THUẬT TOÁN ÔN TẬP GIÁN ĐOẠN (SPACED REPETITION - SRS)

Kiến thức mới (Daily Quota) sẽ nhanh chóng rụng đi theo *Đường cong quên lãng Ebbinghaus*. Thuật toán SM-2 được sử dụng để tính toán ngày ôn tập tối ưu.

### 1. Cơ Chế Chấm Điểm Tự Động (Ma trận 10s)
Hệ thống không bắt User tự đánh giá độ khó (từ 0-5 như Anki) mà tự động tính điểm Quality (Q) dựa vào thời gian phản xạ:
*   `Q = 5`: Hoàn hảo (Phản xạ `< 5s`).
*   `Q = 4`: Tốt (`< 10s`).
*   `Q = 3`: Học vẹt (`> 10s`, nhớ nhưng quá chậm để giao tiếp).
*   `Q = 2`: Sai một chút (nhầm trợ từ, phát âm sai).
*   `Q = 0`: Báo động (Hoàn toàn không nhớ / Bỏ qua).

### 2. Thuật Toán Tính Ngày Ôn Tiếp Theo (Next Review Date)
Hệ thống lưu 3 biến: `Interval (I)` (Khoảng cách), `Repetition (R)` (Chuỗi đúng), `Ease Factor (EF)` (Hệ số dễ, mặc định 2.5).

*   **Nếu trả lời đúng (Q >= 3):**
    *   R = 0 ➡️ I = 1 ngày.
    *   R = 1 ➡️ I = 6 ngày.
    *   R > 1 ➡️ I = I_cũ * EF_cũ.
    *   EF mới = EF_cũ + (0.1 - (5 - Q) * (0.08 + (5 - Q) * 0.02)).
*   **Nếu trả lời sai (Q < 3):**
    *   R reset về 0.
    *   I reset về 1 ngày.

### 3. Nguyên Tắc Nạp Daily Tasks (Truy Vấn DB)
Mỗi ngày, kịch bản tạo Task chuẩn sẽ là:
1.  **Dọn nợ (Review Tasks):** Lấy tất cả các từ vựng/ngữ pháp có `next_review_date <= TODAY`.
2.  **Học mới (New Tasks):** Đắp thêm bài học mới theo Daily Quota đã tính ở Bước 2.

---

## PHẦN 4: VÒNG LẶP PHẢN HỒI (DYNAMIC FEEDBACK LOOP)

Một kế hoạch hoàn hảo là một kế hoạch biết tự điều chỉnh (Dynamic), không phải kế hoạch chết (Static).

*   **Tỷ lệ Báo Động cao:** Nếu user lười học, nợ SRS tồn đọng quá nhiều ➡️ Hệ thống kích hoạt trạng thái **Đóng Băng Kiến Thức Mới**, buộc user giải quyết xong Review Tasks rồi mới được học thẻ mới.
*   **Tỷ lệ Học Vẹt cao:** Ghi nhận User có thể vượt qua Flashcard rất nhanh, nhưng vào 10s Reflex Test lại tịt ngòi ➡️ Tăng tần suất rải các bài tập dạng Reflex / Word Map lên cao hơn dạng Flashcard thông thường.
*   **Chẩn Đoán Quality_Diagnostics:** Báo cáo ngay trên màn hình Terminal V2 tỷ lệ phần trăm các từ vựng đang ở mức độ nào (Perfect, Good, Memorized, Bad, Alarming) để User thấy được toàn cảnh chất lượng nạp kiến thức của mình.

---

## PHẦN 5: TỔNG HỢP CÁC CHỨC NĂNG ĐÃ TRIỂN KHAI (FEATURE LOGS)

Mục này được dùng để lưu trữ danh sách các tính năng (Features) đã được phát triển hoàn thiện trong ứng dụng, phục vụ việc tra cứu và phát triển tiếp nối.

### 1. Quản lý Mục tiêu & Thuật toán Chia Kế hoạch (Goal & Auto-breakdown)
*   **Init Target (Tạo Goal):** Khởi tạo một mục tiêu học tập (Target) với các thông số khối lượng (Vocab, Grammar, Sentences, Conversations), ngày bắt đầu, ngày kết thúc và tuỳ chọn nghỉ cuối tuần (`skipWeekends`).
*   **Dynamic Waterfall Algorithm:** Thuật toán tính toán `Quota` (định mức) hàng ngày và tự động rải (breakdown) khối lượng bài học thành các `DailyTask` trải dài theo chu kỳ vi mô 4 ngày (4-Day Micro-cycle): 2 ngày nạp 100% kiến thức mới, 1 ngày luyện phản xạ Reflex, và 1 ngày trống hoàn toàn để Consolidation (Dọn nợ).

### 2. Giao diện Theo dõi (Master Schedule View)
*   **Brutalist / Terminal UI:** Giao diện tối giản, sử dụng tông màu đen - xanh ngọc bích (Emerald) - chữ đơn sắc (Monospace) mang phong cách màn hình lệnh.
*   **Calendar Progress:** Hiển thị lịch học theo chiều dọc. Tích hợp thanh tiến độ cộng dồn (`ASCII Cumulative Progress Bar`) để người dùng dễ dàng theo dõi xem vào một ngày cụ thể ở tương lai, họ đã đi được bao nhiêu phần trăm (%) của cả chặng đường.

### 3. Đồng bộ Kế hoạch Động (Dynamic Plan Sync & SRS)
*   **Quét Nợ Hàng Ngày:** Chức năng giả lập/API `POST /api/sync/dynamic-plan` tự động quét bảng `learning_progress` (Trạng thái trí nhớ người dùng) vào mỗi sáng.
*   **Tạo Task Ôn Tập:** Lọc ra các từ vựng/ngữ pháp có `next_review_date <= TODAY` để gộp thành các `DailyTask` mang nhãn `[REVIEW]`, ghim thẳng vào lịch trình ngày hôm nay.

### 4. Nhật ký Hệ thống (System Modification Logs & Audit)
*   **Cơ chế Ghi Log:** Mọi sự thay đổi về kế hoạch học tập, tạo mục tiêu, hoàn thành bài tập, hay phát sinh Task nợ đều được lưu vết chi tiết vào bảng `PlanModificationLog`.
*   **Hiển thị Phân loại Màu sắc (Color-coded Terminal):**
    *   🔴 **Rose (Bad/Warning Logs):** Các sự kiện trễ nải, điểm kém, nợ bài, hoặc hệ thống phải nhồi thêm bài dọn nợ (`DYNAMIC_PLAN_GENERATED`).
    *   🟡 **Amber (Modification Logs):** Các sự kiện thay đổi kế hoạch, lùi lịch (`SCHEDULE_OVERRIDDEN`, `GOAL_MODIFIED`).
    *   🟢 **Emerald (Good Logs):** Tạo mới mục tiêu thành công (`INIT_GOAL`) hoặc hoàn thành Task.
*   **Cô lập Log theo Target:** Giao diện chỉ hiển thị Log của Target đang được Active trên Dropdown.

### 5. Quản trị Trạng thái (Soft Delete & Dropdown)
*   **Soft Delete (Destroy Target):** Chức năng xóa Target sẽ xóa triệt để toàn bộ `DailyTask` tương lai nhưng **giữ lại** bản ghi Target (với trạng thái `DELETED`) và toàn bộ nhật ký Log để phục vụ Audit.
*   **Smart Active Auto-Switch:**
    *   Hệ thống không hiển thị các Target đã bị xóa (`DELETED`) vào menu Dropdown chọn Target.
    *   Khi người dùng hủy diệt (Destroy) một Target, hệ thống tự động dò tìm và nhảy sang một Target đang hoạt động khác.
    *   Nếu toàn bộ Target bị hủy, giao diện ngay lập tức ẩn Dropdown và hiển thị Màn hình trống (Zero-State) yêu cầu `Init New Target`.

### 6. Động Cơ Học Từ Vựng (Vocabulary Engine & Task Attachment)
*   **Gán Dữ Liệu Học Theo Task (Task Attachment):** 
    *   Khác với việc gán cứng (hardcode) dữ liệu vào Task ngay từ lúc lập kế hoạch, hệ thống áp dụng cơ chế **Lazy Loading**. 
    *   Chỉ khi người dùng **bấm vào Task lần đầu tiên**, API mới tìm kiếm các từ vựng chưa học trong hệ thống (`Vocabulary` model) có số lượng bằng với định mức (ví dụ: 40 từ) và gán danh sách `itemIds` (Mảng ID từ vựng) vào thẳng bản ghi của `DailyTask` đó.
    *   Việc này giúp dữ liệu linh hoạt, tránh bị kẹt nếu người dùng thay đổi giáo trình (Source Database) giữa chừng.
*   **Truy Xuất Dữ Liệu Đồng Nhất (Deterministic Fetching):**
    *   Khi lấy từ vựng mới ra để học, hệ thống bắt buộc sắp xếp ưu tiên theo trình tự bài học trong sách gốc (`orderBy: { sourcePage: 'asc' }`). 
    *   Chỉ sau khi chọn đủ danh sách từ cố định (Fixed Set), hệ thống mới thực hiện **đảo trộn ngẫu nhiên thứ tự hiển thị** lúc học (`Math.random() - 0.5`).
    *   Mục đích: Đảm bảo học viên trong cùng một lớp học sẽ được tiếp cận cùng một danh sách từ vựng trong ngày (để tiện trao đổi bài), nhưng thứ tự xuất hiện khi flashcard lật sẽ khác nhau để rèn luyện phản xạ, tránh việc học vẹt theo thứ tự cố định.
*   **Hoàn Tác Kế Hoạch & Hệ Thống Audit Log (Task Revert / Refresh):**
    *   Cho phép người dùng Reset (Làm lại) một Task đã hoàn thành. 
    *   Hệ thống sẽ **xóa sạch tiến độ học (LearningProgress)** của danh sách từ vựng đó để người dùng học lại từ đầu (đưa bộ nhớ Interval và Ease Factor về điểm xuất phát).
    *   **Audit Logging (Bắt buộc):** Hành động Revert là hành động Destructive (Phá hủy dữ liệu tiến độ). Do đó, người dùng bắt buộc phải nhập **Lý do (Reason)** tối thiểu 10 ký tự. Hệ thống lưu lại lịch sử thay đổi vào bảng `PlanModificationLog` với eventType `TASK_REVERTED` và cảnh báo màu 🟡 Amber trên bảng Terminal Log kèm theo ID của Task bị sửa đổi.

### 7. Động Cơ Học Ngữ Pháp (Grammar Learning Engine)
Khác với Từ vựng (Vocabulary) được nạp hàng loạt từ Database có sẵn, Ngữ pháp có tính đặc thù cao, yêu cầu sự chiêm nghiệm và tự tổng hợp từ người học. Hệ thống giải quyết thông qua cơ chế học 2 Giai đoạn (Two-Step Flow):
*   **Giai đoạn 1: Nạp Dữ Liệu (Input / Parse Phase)**
    *   Khi người dùng click vào một Task Ngữ pháp MỚI, hệ thống không tự động cấp phát bài từ Database. Thay vào đó, nó hiển thị giao diện **Grammar_Parser_Terminal**.
    *   Người dùng phải tự đúc kết kiến thức (từ sách vở/tài liệu) và nhập thủ công `Quota` số lượng cấu trúc ngữ pháp (bao gồm: Cú pháp, Ý nghĩa, Bối cảnh) vào hệ thống. Các bản ghi này được lưu dưới dạng `UserGrammar` (Sở hữu cá nhân).
    *   **Live Preview (Xem trước trực tiếp):** Khi người dùng gõ công thức (sử dụng dấu ngoặc nhọn `{...}` để highlight từ khóa), hệ thống ngay lập tức Render ra một khối UI mô phỏng trực quan theo thời gian thực (Real-time).
    *   **Auto-save Draft (Lưu nháp tự động):** Toàn bộ nội dung đang gõ dở được tự động sao lưu vào `localStorage`. Dù người dùng có lỡ tay F5 hay đóng tab, nội dung vẫn được giữ nguyên để tránh việc phải gõ lại từ đầu.
*   **Giai đoạn 2: Luyện Tập Sinh Tồn (Generative Practice Phase)**
    *   Khi người dùng ôn tập (Review) một Task Ngữ pháp cũ, hệ thống bỏ qua Giai đoạn 1 và đưa thẳng vào **Generative Grammar Room**.
    *   Thay vì trắc nghiệm Flashcard thông thường, màn hình hiển thị Cú pháp ngữ pháp và bắt đầu đếm ngược **30 giây**. 
    *   Người dùng bắt buộc phải "tự nặn" ra một câu Tiếng Nhật hoàn toàn mới ứng dụng cấu trúc đó (Generative) và nhập vào hệ thống, sau đó tự chấm điểm (0-4) chất lượng câu mình vừa tạo ra. Quá trình này giúp nâng cao độ phản xạ (Reflex) và khả năng ứng dụng thực tế.

### 8. Cơ chế Ôn tập Kép (Dynamic Review vs Static Consolidate)
Hệ thống sử dụng hai lớp mạng lưới an toàn để đảm bảo kiến thức không bị rơi rụng, được chia làm 2 loại Task ôn tập khác biệt hoàn toàn về mặt triết lý:

*   **Lớp 1: Bão dưỡng hàng ngày (`[REVIEW] SRS Dọn nợ`)**
    *   **Nguồn gốc:** Sinh ra **ĐỘNG (Dynamic)**. API `/api/sync/dynamic-plan` tự động quét Database mỗi sáng. Nếu hôm qua bạn học và chấm điểm kém (`Q < 3`), ngày hẹn ôn tập của từ đó sẽ rơi vào hôm nay, và hệ thống sẽ tự đẻ thêm một Task `[REVIEW]` ghim vào lịch.
    *   **Bản chất:** Chạy song song với việc nạp kiến thức mới. Tách biệt rạch ròi theo môn học (Từ vựng riêng, Ngữ pháp riêng).
*   **Lớp 2: Trạm gác an toàn (`[CONSOLIDATE] Deep Review & Catch-up`)**
    *   **Nguồn gốc:** Sinh ra **TĨNH (Static)** từ lúc mới tạo Goal. Nó luôn được ghim cứng vào **Ngày thứ 4 (Day 4)** của mỗi chu kỳ sinh học.
    *   **Bản chất:** Đóng vai trò là chốt chặn cuối cùng. Vào ngày này, hệ thống CHẶN ĐỨNG việc nạp kiến thức mới. Task này sẽ xào trộn chung (Unified) TẤT CẢ các thẻ bài (Từ vựng + Ngữ pháp) đang bị nợ đọng thành một bộ Flashcard duy nhất. Nếu trong 3 ngày trước bạn lười học task `[REVIEW]`, thì ngày thứ 4 bạn sẽ phải "thanh toán" toàn bộ khoản nợ đó thông qua Task `[CONSOLIDATE]` này. Mọi khoản nợ phải được dọn sạch trước khi bước sang chu kỳ mới.

### 9. Cơ chế Chẩn đoán Trí nhớ & Màn hình Phiên học (Study Session & Diagnostics)
*   **Tiến độ Động (Dynamic Progress Matrix):**
    *   Thanh tiến độ của Mục tiêu (Vocabulary, Grammar,...) không cộng dồn ngay khi mới lập kế hoạch. Nó chỉ tăng lên khi người dùng thực sự hoàn thành một Task MỚI.
    *   Hệ thống quét tự động các Task có trạng thái `COMPLETED` và loại trừ các task dọn nợ (`isReview` hoặc `consolidate`) để đếm số lượng `itemIds` thực tế đã được nạp vào đầu.
*   **Phân loại Thùng chứa (Diagnostic Buckets):** Biểu đồ Chẩn đoán không đếm số lượng click, mà đếm trạng thái thực sự của bộ não (thông qua `LearningProgress`). Chỉ quét dữ liệu thuộc các Task của Mục tiêu hiện tại (Tránh nhiễu chéo giữa các mục tiêu khác nhau).
    *   **HOÀN HẢO (Perfect):** Những từ đã trả lời đúng liên tiếp 3 lần (`consecutiveCorrect >= 3`), HOẶC những từ mới học lần đầu nhưng được người dùng đánh giá Hoàn hảo ngay lập tức (`easeFactor >= 2.5`).
    *   **ĐÃ THUỘC (Memorized):** Những từ mới chỉ trả lời đúng 1-2 lần (`consecutiveCorrect >= 1`).
    *   **TỆ (Bad):** Những từ vừa trả lời sai gần đây (`consecutiveCorrect === 0`).
    *   **BÁO ĐỘNG (Alarming):** Những từ cực kỳ khó nhớ, trả lời sai liên tục khiến Hệ số dễ (Ease Factor) tụt thảm hại (`< 2.0`).
*   **Khám nghiệm Cuối phiên (Session Complete Drill-down):**
    *   Sau khi lật thẻ cuối cùng của một Task, hệ thống không văng ngay ra ngoài. Nó dừng lại ở màn hình Tổng kết Phiên học.
    *   Giao diện hiển thị 4 Khối thống kê tương ứng với 4 trạng thái trí nhớ (Hoàn hảo, Đã thuộc, Tệ, Báo động).
    *   Người dùng có thể click vào từng khối (Ví dụ: khối TỆ) để mở ra Bảng chi tiết dạng Brutalist (`STT | Kanji | Hiragana | Nghĩa`) để tự rà soát lại những lỗi sai của mình trước khi chính thức kết thúc phiên học.
*   **Môi trường Hộp cát (Practice Mode Sandbox):**
    *   Chế độ Luyện tập (Practice Mode) hoạt động hoàn toàn cô lập khỏi Database. Mọi thao tác chấm điểm (Perfect, Bad...) trong chế độ này sẽ bị chặn lại (Skip API Submission) ngay trước khi gửi lên máy chủ.
    *   **Hệ quả:** Biểu đồ Chẩn Đoán (Diagnostics) ngoài màn hình Terminal sẽ KHÔNG bị ảnh hưởng hay thay đổi sau một phiên Practice. Tuy nhiên, cơ chế Khám nghiệm Cuối phiên (Drill-down) ở cuối bài học vẫn hoạt động bình thường dựa trên dữ liệu tạm thời (Local State) của phiên học đó. Điều này giúp người dùng "test nháp" thoải mái và tự đánh giá lại bản thân mà không làm hỏng dữ liệu của thuật toán Spaced Repetition gốc.
