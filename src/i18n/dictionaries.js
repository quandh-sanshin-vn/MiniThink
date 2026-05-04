export const dictionaries = {
  vi: {
    // Layout
    'nav.terminal': 'Bảng_Điều_Khiển',
    'nav.vocab': 'Từ_Vựng_DB',
    'nav.parser': 'Nhập_Liệu_AI',
    'nav.grammar': 'Ngữ_Pháp_DB',

    // Dashboard
    'dash.title': 'sys.mervyn_os // Phân Hệ Học Tập',
    'dash.subtitle': 'Chọn một phân hệ để kích hoạt quá trình học tập...',
    'dash.btn.initiate': '[ KHỞI_ĐỘNG_TRÌNH_TỰ ]',

    // Modals
    'modal.ack': '[ XÁC_NHẬN ]',
    'modal.abort': '[ HỦY_BỎ ]',
    'modal.execute': '[ THỰC_THI ]',
    'modal.submit': '[ GỬI_DỮ_LIỆU ]',
    'modal.warning': 'CẢNH BÁO HỆ THỐNG',

    // Language Selector
    'lang.vi': 'Tiếng Việt',
    'lang.en': 'English',
    'lang.ja': '日本語',

    // Goals Terminal
    'goals.tracker': 'SYS.THEO_DÕI_MỤC_TIÊU_V2',
    'goals.init_new': 'Khởi_Tạo_Mục_Tiêu',
    'goals.active_target': 'Mục_Tiêu_Đang_Chạy:',
    'goals.select_target': 'CHỌN_MỤC_TIÊU',
    'goals.no_targets_avail': 'Không có mục tiêu nào',
    'goals.no_active_targets': 'Chưa Có Mục Tiêu Nào',
    'goals.no_active_desc': 'Hệ thống yêu cầu một mục tiêu để tính toán khối lượng hàng ngày và lên lịch thực thi.',
    'goals.init_protocol': 'Khởi_Động_Quy_Trình',
    'goals.destroy': 'TỪ_BỎ',
    'goals.start_date': 'NGÀY_BẮT_ĐẦU:',
    'goals.end_date': 'NGÀY_KẾT_THÚC:',
    'goals.skip_weekend': 'NGHỈ_CUỐI_TUẦN:',
    'goals.progress_matrix': 'Ma_Trận_Tiến_Độ',
    'goals.modify_params': 'Chỉnh_Sửa_Tham_Số',

    'goals.daily_execution_plan': 'Kế_Hoạch_Thực_Thi_Trong_Ngày',
    'goals.view_schedule': 'Xem_Lịch_Trình',
    'goals.no_tasks_today': 'Không có lịch học nào cho hôm nay.',

    'goals.quality_diagnostics': 'Chẩn_Đoán_Chất_Lượng_Trí_Nhớ',
    'goals.system_logs': 'Nhật_Ký_Chỉnh_Sửa_Hệ_Thống',
    'goals.log_empty': 'Terminal nhật ký đang trống.',
    'goals.sys_idle': '[SYS_RẢNH_RỖI]',
    'goals.awaiting_input': 'Đang đợi lệnh từ người dùng_',

    // Goals Modals
    'goals.create.title': 'Khởi_Tạo_Mục_Tiêu_Mới',
    'goals.create.name': 'Tên_Mục_Tiêu',
    'goals.create.vocab': 'Số_Lượng_Từ_Vựng',
    'goals.create.grammar': 'Số_Lượng_Ngữ_Pháp',
    'goals.create.sentences': 'Số_Câu_Phản_Xạ',
    'goals.create.conversations': 'Số_Hội_Thoại',
    'goals.create.deadline': 'Ngày_Hoàn_Thành',
    'goals.create.skip_weekends': 'Nghỉ_Cuối_Tuần',
    'goals.create.abort': 'Hủy_Bỏ',
    'goals.create.run_auto': 'Chạy_Auto_Chia_Lịch',

    'goals.edit.title_plan': 'Yêu_Cầu_Sửa_Đổi_Kế_Hoạch',
    'goals.edit.title_schedule': 'Yêu_Cầu_Sửa_Đổi_Lịch_Trình',
    'goals.edit.new_vocab': 'Số_Từ_Vựng_Mới',
    'goals.edit.new_end': 'Ngày_Kết_Thúc_Mới',
    'goals.edit.target_date': 'Ngày_Mục_Tiêu',
    'goals.edit.note': 'Ghi_Chú_Chỉnh_Sửa_Lịch',
    'goals.edit.auth_reason': 'Lý_Do_Ủy_Quyền_Thay_Đổi',
    'goals.edit.auth_placeholder': 'Nhập lý do hợp lệ để hệ thống cấp quyền thay đổi (tối thiểu 10 ký tự)...',
    'goals.edit.commit': 'Xác_Nhận_Thay_Đổi_Vào_Data',

    // Study Room
    'study.back': '[ THOÁT_VỀ_TERMINAL ]',
    'study.practice_mode': '[ CHẾ ĐỘ LUYỆN TẬP - KHÔNG LƯU TIẾN ĐỘ ]',
    'study.stats.progress': 'Tiến_Độ',
    'study.stats.perfect': 'Hoàn_Hảo',
    'study.stats.good': 'Tốt',
    'study.stats.memorized': 'Đã_Thuộc',
    'study.stats.bad': 'Tệ',
    'study.stats.alarming': 'Đáng_Báo_Động',

    'study.card.flip': '[ NHẤN SPACE ĐỂ LẬT THẺ ]',
    'study.btn.perfect': '[1] HOÀN_HẢO',
    'study.btn.good': '[2] TỐT',
    'study.btn.memorized': '[3] ĐÃ_THUỘC',
    'study.btn.bad': '[4] TỆ',

    'study.complete.title': 'Phiên Học Đã Hoàn Tất',
    'study.complete.desc': 'Đã ôn tập thành công',
    'study.complete.items': 'từ vựng.',
    'study.complete.return': '[ TRỞ_VỀ_TERMINAL ]',

    // Home Page
    'home.title': 'Mervyn MiniThink',
    'home.subtitle': 'Hệ sinh thái ứng dụng năng suất & học tập được thiết kế theo ngôn ngữ Brutalism.',
    'home.slogan': 'Tối giản. Thiết thực. Tinh tế.',
    'home.module1': 'Japanese SRS',
    'home.module1_desc': 'Hệ thống học thuật khắc nghiệt dành cho Tiếng Nhật. Ứng dụng thuật toán lặp lại ngắt quãng (SM-2) kết hợp chẩn đoán trí nhớ thời gian thực.',
    'home.boot': '[ Boot System ]',
    'home.module2': 'Pomodoro Timer',
    'home.module2_desc': 'Trạm điều khiển thời gian làm việc tối giản. Hỗ trợ hệ thống âm thanh Web Audio tự tổng hợp sóng nhiễu (White noise) giúp tăng độ tập trung.',
    'home.module3': 'Dev Task Terminal',
    'home.module3_desc': 'Bảng Kanban quản lý công việc và dự án. Vận hành ở chế độ Sandbox 100% bằng LocalStorage, bảo mật dữ liệu trên máy trạm.',

    // Timer
    'timer.title': 'MERVYN_TIMER',
    'timer.cycles': 'Chu_Kỳ_Hoàn_Thành:',
    'timer.audio_interface': 'Giao_Diện_Âm_Thanh',
    'timer.pomodoro_tracks': 'Nhạc_Tập_Trung',
    'timer.break_tracks': 'Nhạc_Thư_Giãn',
    'timer.empty_dir': 'Thư mục trống:',
    'timer.playing': 'ĐANG_PHÁT',
    'timer.settings': 'Tham_Số_Hệ_Thống',
    'timer.work_duration': 'Thời_Gian_Làm_(Phút)',
    'timer.short_break': 'Nghỉ_Ngắn_(Phút)',
    'timer.long_break': 'Nghỉ_Dài_(Phút)',
    'timer.apply': 'Áp_Dụng_Thay_Đổi',
    'timer.quick_profiles': 'Cấu_Hình_Nhanh',

    // Todo
    'todo.title': 'Dev_Task_Terminal',
    'todo.subtitle': 'Chế độ Sandbox • Lưu trữ trên LocalStorage',
    'todo.task_title': 'Tiêu Đề Task',
    'todo.placeholder': 'Nhập mô tả công việc...',
    'todo.priority': 'Mức_Độ',
    'todo.module': 'Phân_Hệ',
    'todo.add_btn': '[ THÊM_TASK ]',
    'todo.empty_status': 'Trống'
  },
  en: {
    // Layout
    'nav.terminal': 'Terminal',
    'nav.vocab': 'Vocab_DB',
    'nav.parser': 'Data_Parser',
    'nav.grammar': 'Grammar_DB',

    // Dashboard
    'dash.title': 'sys.mervyn_os // Modules',
    'dash.subtitle': 'Select an active module to initiate the learning sequence...',
    'dash.btn.initiate': '[ INITIATE_SEQUENCE ]',

    // Modals
    'modal.ack': '[ ACKNOWLEDGE ]',
    'modal.abort': '[ ABORT ]',
    'modal.execute': '[ EXECUTE ]',
    'modal.submit': '[ SUBMIT ]',
    'modal.warning': 'SYSTEM WARNING',

    // Language Selector
    'lang.vi': 'Tiếng Việt',
    'lang.en': 'English',
    'lang.ja': '日本語',

    // Goals Terminal
    'goals.tracker': 'SYS.GOALS_TRACKER_V2',
    'goals.init_new': 'Init_New_Target',
    'goals.active_target': 'Active_Target:',
    'goals.select_target': 'SELECT_TARGET',
    'goals.no_targets_avail': 'No targets available',
    'goals.no_active_targets': 'No Active Targets Found',
    'goals.no_active_desc': 'The system requires a target objective to calculate daily quotas and generate execution plans.',
    'goals.init_protocol': 'Initialize_Protocol',
    'goals.destroy': 'DESTROY',
    'goals.start_date': 'START_DATE:',
    'goals.end_date': 'END_DATE:',
    'goals.skip_weekend': 'SKIP_WEEKEND:',
    'goals.progress_matrix': 'Progress_Matrix',
    'goals.modify_params': 'Modify_Parameters',

    'goals.daily_execution_plan': 'Daily_Execution_Plan',
    'goals.view_schedule': 'View_Schedule',
    'goals.no_tasks_today': 'No tasks scheduled for today.',

    'goals.quality_diagnostics': 'Quality_Diagnostics',
    'goals.system_logs': 'System_Modification_Logs',
    'goals.log_empty': 'Log terminal empty.',
    'goals.sys_idle': '[SYS_IDLE]',
    'goals.awaiting_input': 'Awaiting user input_',

    // Goals Modals
    'goals.create.title': 'Initialize_New_Target',
    'goals.create.name': 'Target_Name',
    'goals.create.vocab': 'Vocab_Count',
    'goals.create.grammar': 'Grammar_Count',
    'goals.create.sentences': 'Map_Sentences',
    'goals.create.conversations': 'Conversations',
    'goals.create.deadline': 'Deadline_Date',
    'goals.create.skip_weekends': 'Skip_Weekends',
    'goals.create.abort': 'Abort',
    'goals.create.run_auto': 'Run_Auto_Breakdown',

    'goals.edit.title_plan': 'Plan_Modification_Req',
    'goals.edit.title_schedule': 'Schedule_Override_Req',
    'goals.edit.new_vocab': 'New_Vocab_Target',
    'goals.edit.new_end': 'New_End_Date',
    'goals.edit.target_date': 'Target_Date',
    'goals.edit.note': 'Schedule_Adjustment_Note',
    'goals.edit.auth_reason': 'Authorization_Reason',
    'goals.edit.auth_placeholder': 'Enter justification for protocol modification (min 10 chars)...',
    'goals.edit.commit': 'Commit_To_Database',

    // Study Room
    'study.back': '[ RETURN_TO_TERMINAL ]',
    'study.practice_mode': '[ PRACTICE MODE - PROGRESS WILL NOT BE SAVED ]',
    'study.stats.progress': 'Progress',
    'study.stats.perfect': 'Perfect',
    'study.stats.good': 'Good',
    'study.stats.memorized': 'Memorized',
    'study.stats.bad': 'Bad',
    'study.stats.alarming': 'Alarming',

    'study.card.flip': '[ PRESS SPACE TO FLIP ]',
    'study.btn.perfect': '[1] PERFECT',
    'study.btn.good': '[2] GOOD',
    'study.btn.memorized': '[3] MEMORIZED',
    'study.btn.bad': '[4] BAD',

    'study.complete.title': 'Session Complete',
    'study.complete.desc': 'Successfully reviewed',
    'study.complete.items': 'items.',
    'study.complete.return': '[ RETURN_TO_TERMINAL ]',

    // Home Page
    'home.title': 'Mervyn MiniThink',
    'home.subtitle': 'Productivity & learning ecosystem designed with Brutalism language.',
    'home.slogan': 'Minimal. Practical. Refined.',
    'home.module1': 'Japanese SRS',
    'home.module1_desc': 'Strict academic system for Japanese. Utilizes Spaced Repetition (SM-2) combined with real-time memory diagnostics.',
    'home.boot': '[ Boot System ]',
    'home.module2': 'Pomodoro Timer',
    'home.module2_desc': 'Minimalist time control station. Features Web Audio synthesized white noise to boost concentration.',
    'home.module3': 'Dev Task Terminal',
    'home.module3_desc': 'Kanban board for task management. Runs 100% in Sandbox mode using LocalStorage for maximum privacy.',

    // Timer
    'timer.title': 'MERVYN_TIMER',
    'timer.cycles': 'Completed_Cycles:',
    'timer.audio_interface': 'Audio_Interface',
    'timer.pomodoro_tracks': 'Pomodoro_Tracks',
    'timer.break_tracks': 'Break_Tracks',
    'timer.empty_dir': 'Directory empty:',
    'timer.playing': 'PLAYING',
    'timer.settings': 'System_Parameters',
    'timer.work_duration': 'Work_Duration_Min',
    'timer.short_break': 'Short_Break_Min',
    'timer.long_break': 'Long_Break_Min',
    'timer.apply': 'Apply_Settings',
    'timer.quick_profiles': 'Quick_Profiles',

    // Todo
    'todo.title': 'Dev_Task_Terminal',
    'todo.subtitle': 'Sandbox Mode • LocalStorage Persistence',
    'todo.task_title': 'Task Title',
    'todo.placeholder': 'Enter task description...',
    'todo.priority': 'Priority',
    'todo.module': 'Module',
    'todo.add_btn': '[ EXECUTE_ADD ]',
    'todo.empty_status': 'Empty'
  },
  ja: {
    // Layout
    'nav.terminal': 'ターミナル',
    'nav.vocab': '単語_DB',
    'nav.parser': 'データ解析',
    'nav.grammar': '文法_DB',

    // Dashboard
    'dash.title': 'sys.mervyn_os // モジュール',
    'dash.subtitle': '学習シーケンスを開始するにはモジュールを選択してください...',
    'dash.btn.initiate': '[ シーケンス_開始 ]',

    // Modals
    'modal.ack': '[ 確認 ]',
    'modal.abort': '[ 中止 ]',
    'modal.execute': '[ 実行 ]',
    'modal.submit': '[ 送信 ]',
    'modal.warning': 'システム警告',

    // Language Selector
    'lang.vi': 'Tiếng Việt',
    'lang.en': 'English',
    'lang.ja': '日本語',

    // Goals Terminal
    'goals.tracker': 'SYS.目標_トラッカー_V2',
    'goals.init_new': '新規_ターゲット_作成',
    'goals.active_target': '実行中のターゲット:',
    'goals.select_target': 'ターゲット選択',
    'goals.no_targets_avail': '利用可能なターゲットなし',
    'goals.no_active_targets': '実行中のターゲットが見つかりません',
    'goals.no_active_desc': '毎日のノルマを計算し、実行計画を生成するには目標ターゲットが必要です。',
    'goals.init_protocol': 'プロトコル_初期化',
    'goals.destroy': '破壊',
    'goals.start_date': '開始日:',
    'goals.end_date': '終了日:',
    'goals.skip_weekend': '週末をスキップ:',
    'goals.progress_matrix': '進行状況マトリックス',
    'goals.modify_params': 'パラメータ_変更',

    'goals.daily_execution_plan': '本日の_実行_計画',
    'goals.view_schedule': 'スケジュール_確認',
    'goals.no_tasks_today': '本日のタスクはありません。',

    'goals.quality_diagnostics': '品質_診断',
    'goals.system_logs': 'システム_変更_ログ',
    'goals.log_empty': 'ターミナルログは空です。',
    'goals.sys_idle': '[SYS_待機中]',
    'goals.awaiting_input': 'ユーザー入力を待機中_',

    // Goals Modals
    'goals.create.title': '新規_ターゲット_初期化',
    'goals.create.name': 'ターゲット名',
    'goals.create.vocab': '単語数',
    'goals.create.grammar': '文法数',
    'goals.create.sentences': 'マップ_文の数',
    'goals.create.conversations': '会話数',
    'goals.create.deadline': '完了期限日',
    'goals.create.skip_weekends': '週末をスキップ',
    'goals.create.abort': '中止',
    'goals.create.run_auto': '自動割り当て_実行',

    'goals.edit.title_plan': '計画_変更_リクエスト',
    'goals.edit.title_schedule': 'スケジュール_上書き_リクエスト',
    'goals.edit.new_vocab': '新しい_単語数',
    'goals.edit.new_end': '新しい_終了日',
    'goals.edit.target_date': '対象日',
    'goals.edit.note': 'スケジュール_変更_メモ',
    'goals.edit.auth_reason': '変更の理由',
    'goals.edit.auth_placeholder': 'プロトコル変更の正当な理由を入力してください（10文字以上）...',
    'goals.edit.commit': 'データベースに_コミット',

    // Study Room
    'study.back': '[ ターミナルへ戻る ]',
    'study.practice_mode': '[ 練習モード - 進捗は保存されません ]',
    'study.stats.progress': '進行状況',
    'study.stats.perfect': '完璧',
    'study.stats.good': '良い',
    'study.stats.memorized': '暗記済',
    'study.stats.bad': '悪い',
    'study.stats.alarming': '警告レベル',

    'study.card.flip': '[ スペースキーでめくる ]',
    'study.btn.perfect': '[1] 完璧',
    'study.btn.good': '[2] 良い',
    'study.btn.memorized': '[3] 暗記済',
    'study.btn.bad': '[4] 悪い',

    'study.complete.title': 'セッション_完了',
    'study.complete.desc': '復習を完了しました',
    'study.complete.items': '項目。',
    'study.complete.return': '[ ターミナルへ戻る ]',

    // Home Page
    'home.title': 'Mervyn MiniThink',
    'home.subtitle': 'ブルータリズム言語で設計された生産性と学習のシステム。',
    'home.slogan': 'ミニマル。実用的。洗練。',
    'home.module1': '日本語 SRS',
    'home.module1_desc': '厳密な日本語学習システム。間隔反復アルゴリズム（SM-2）とリアルタイムの記憶診断を使用します。',
    'home.boot': '[ システム起動 ]',
    'home.module2': 'ポモドーロ タイマー',
    'home.module2_desc': 'ミニマルな時間管理ステーション。Web Audioで合成されたホワイトノイズを使用して集中力を高めます。',
    'home.module3': 'Dev タスク ターミナル',
    'home.module3_desc': 'タスク管理用のカンバンボード。LocalStorageを使用して100%サンドボックスモードで動作します。',

    // Timer
    'timer.title': 'MERVYN_TIMER',
    'timer.cycles': '完了サイクル:',
    'timer.audio_interface': 'オーディオインターフェース',
    'timer.pomodoro_tracks': '集中_トラック',
    'timer.break_tracks': '休憩_トラック',
    'timer.empty_dir': '空のディレクトリ:',
    'timer.playing': '再生中',
    'timer.settings': 'システム_パラメータ',
    'timer.work_duration': '作業時間_(分)',
    'timer.short_break': '短い休憩_(分)',
    'timer.long_break': '長い休憩_(分)',
    'timer.apply': '変更を適用',
    'timer.quick_profiles': 'クイック_プロファイル',

    // Todo
    'todo.title': 'Dev_タスク_ターミナル',
    'todo.subtitle': 'サンドボックスモード • LocalStorage 保存',
    'todo.task_title': 'タスクのタイトル',
    'todo.placeholder': 'タスクの説明を入力...',
    'todo.priority': '優先度',
    'todo.module': 'モジュール',
    'todo.add_btn': '[ 追加を実行 ]',
    'todo.empty_status': '空'
  }
};
