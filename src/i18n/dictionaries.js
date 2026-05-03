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
    'study.complete.desc': '復習が正常に完了しました:',
    'study.complete.items': 'アイテム。',
    'study.complete.return': '[ ターミナルへ戻る ]',
  }
};
