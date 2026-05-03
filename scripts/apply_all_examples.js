const fs = require('fs');

const examplesMap = {
  "だんせい": [
    { ja: "彼は素敵な男性ですね。", vi: "Anh ấy là một người đàn ông tuyệt vời nhỉ." },
    { ja: "この服は男性用です。", vi: "Quần áo này dành cho nam giới." },
    { ja: "理想の男性と結婚したい。", vi: "Tôi muốn kết hôn với người đàn ông lý tưởng." }
  ],
  "じょせい": [
    { ja: "女性の働き方が変わってきた。", vi: "Cách làm việc của phụ nữ đã thay đổi." },
    { ja: "彼女は美しい女性です。", vi: "Cô ấy là một người phụ nữ xinh đẹp." },
    { ja: "女性専用の車両に乗る。", vi: "Lên toa xe dành riêng cho phụ nữ." }
  ],
  "こうれい": [
    { ja: "祖母は高齢ですが元気です。", vi: "Bà tôi tuổi đã cao nhưng vẫn khỏe mạnh." },
    { ja: "高齢者のための施設。", vi: "Cơ sở dành cho người cao tuổi." },
    { ja: "日本は高齢化が進んでいる。", vi: "Nhật Bản đang già hóa dân số." }
  ],
  "としうえ": [
    { ja: "彼の方が私より三つ年上です。", vi: "Anh ấy lớn hơn tôi ba tuổi." },
    { ja: "年上の人を敬うべきだ。", vi: "Nên tôn trọng người lớn tuổi hơn." },
    { ja: "年上の彼女がいます。", vi: "Tôi có bạn gái lớn tuổi hơn." }
  ],
  "めうえ": [
    { ja: "目上の人には敬語を使う。", vi: "Dùng kính ngữ với người bề trên." },
    { ja: "目上の意見を聞く。", vi: "Lắng nghe ý kiến của người trên." },
    { ja: "目上に対して失礼な態度はよくない。", vi: "Thái độ vô lễ với người bề trên là không tốt." }
  ],
  "せんぱい": [
    { ja: "大学の先輩に会いました。", vi: "Tôi đã gặp tiền bối ở trường đại học." },
    { ja: "先輩に仕事を教えてもらう。", vi: "Được tiền bối chỉ việc cho." },
    { ja: "彼は私の高校の先輩です。", vi: "Anh ấy là đàn anh học cùng trường cấp 3 với tôi." }
  ],
  "こうはい": [
    { ja: "後輩にご飯をおごる。", vi: "Đãi hậu bối ăn cơm." },
    { ja: "今年、新しい後輩が入社した。", vi: "Năm nay có hậu bối mới vào công ty." },
    { ja: "後輩の面倒を見る。", vi: "Chăm sóc, giúp đỡ người đi sau." }
  ],
  "じょうし": [
    { ja: "上司に相談してから決めます。", vi: "Tôi sẽ quyết định sau khi bàn bạc với cấp trên." },
    { ja: "優しい上司でよかった。", vi: "Thật tốt vì có một người sếp hiền lành." },
    { ja: "上司の指示に従う。", vi: "Tuân theo chỉ thị của sếp." }
  ],
  "あいて": [
    { ja: "結婚の相手を探している。", vi: "Tôi đang tìm đối tượng để kết hôn." },
    { ja: "相手の目を見て話す。", vi: "Nhìn vào mắt đối phương khi nói chuyện." },
    { ja: "試合の相手はとても強い。", vi: "Đối thủ trong trận đấu rất mạnh." }
  ],
  "しりあい": [
    { ja: "パーティーで知り合いに会った。", vi: "Tôi đã gặp người quen ở bữa tiệc." },
    { ja: "知り合いを通して仕事を見つけた。", vi: "Tôi tìm được công việc thông qua người quen." },
    { ja: "彼はただの知り合いです。", vi: "Anh ta chỉ là người quen thôi." }
  ],
  "ゆうじん": [
    { ja: "休日は友人と遊びます。", vi: "Ngày nghỉ tôi đi chơi với bạn bè." },
    { ja: "彼は古くからの友人です。", vi: "Anh ấy là một người bạn từ rất lâu rồi." },
    { ja: "友人の結婚式に出席する。", vi: "Tham dự lễ cưới của bạn." }
  ],
  "かんけい": [
    { ja: "二人の関係はどうですか？", vi: "Mối quan hệ của hai người thế nào?" },
    { ja: "この事件は私に関係ありません。", vi: "Vụ án này không liên quan đến tôi." },
    { ja: "人間関係に悩んでいる。", vi: "Tôi đang phiền não về các mối quan hệ con người." }
  ],
  "なか": [
    { ja: "私たちはとても仲がいいです。", vi: "Chúng tôi có mối quan hệ rất tốt (rất thân)." },
    { ja: "兄弟の仲が悪い。", vi: "Mối quan hệ của anh em rất tệ." },
    { ja: "仲直りしましょう。", vi: "Chúng ta hãy làm hòa nhé." }
  ],
  "せいねんがっぴ": [
    { ja: "生年月日を書いてください。", vi: "Xin hãy viết ngày tháng năm sinh." },
    { ja: "書類に生年月日を記入する。", vi: "Điền ngày sinh vào tài liệu." },
    { ja: "生年月日で年齢を確認する。", vi: "Xác nhận tuổi bằng ngày tháng năm sinh." }
  ],
  "たんじょうび": [
    { ja: "お誕生日おめでとう！", vi: "Chúc mừng sinh nhật!" },
    { ja: "誕生日プレゼントをもらった。", vi: "Tôi đã nhận được quà sinh nhật." },
    { ja: "来月は私の誕生日です。", vi: "Tháng sau là sinh nhật tôi." }
  ],
  "とし": [
    { ja: "年を取るのは早いです。", vi: "Có tuổi (già đi) thật nhanh." },
    { ja: "良いお年を！", vi: "Chúc mừng năm mới (nói trước Tết)!" },
    { ja: "年が明ける。", vi: "Năm mới bắt đầu." }
  ],
  "しゅっしん": [
    { ja: "ご出身はどちらですか？", vi: "Quê của bạn ở đâu?" },
    { ja: "私は東京の出身です。", vi: "Tôi xuất thân từ Tokyo." },
    { ja: "出身大学はどこですか。", vi: "Bạn tốt nghiệp đại học nào?" }
  ],
  "ふるさと": [
    { ja: "ふるさとの母から手紙が届いた。", vi: "Có thư từ người mẹ ở quê gửi đến." },
    { ja: "ふるさとが恋しい。", vi: "Tôi nhớ quê hương." },
    { ja: "年に一度ふるさとに帰る。", vi: "Mỗi năm về quê một lần." }
  ],
  "せいちょうする": [
    { ja: "子供の成長は早い。", vi: "Sự trưởng thành của trẻ con rất nhanh." },
    { ja: "会社が大きく成長した。", vi: "Công ty đã phát triển lớn mạnh." },
    { ja: "経験を通して成長する。", vi: "Trưởng thành thông qua những kinh nghiệm." }
  ],
  "せいじん": [
    { ja: "日本では20歳で成人になる。", vi: "Ở Nhật, 20 tuổi là trở thành người trưởng thành." },
    { ja: "成人式に参加する。", vi: "Tham dự lễ trưởng thành." },
    { ja: "成人の日でお休みです。", vi: "Hôm nay nghỉ lễ Ngày Trưởng thành." }
  ],
  "ごうかくする": [
    { ja: "大学に合格しました！", vi: "Tôi đã đậu đại học rồi!" },
    { ja: "N3の試験に合格する。", vi: "Đậu kỳ thi N3." },
    { ja: "合格発表を見に行く。", vi: "Đi xem thông báo kết quả thi đỗ." }
  ],
  "しんがくする": [
    { ja: "大学院へ進学する予定です。", vi: "Tôi dự định sẽ học lên cao học." },
    { ja: "進学のために勉強する。", vi: "Học để thi lên cấp cao hơn." },
    { ja: "進学をあきらめる。", vi: "Từ bỏ việc học lên." }
  ],
  "たいがくする": [
    { ja: "病気で学校を退学した。", vi: "Vì bệnh nên tôi đã thôi học." },
    { ja: "退学届けを出す。", vi: "Nộp đơn xin thôi học." },
    { ja: "理由があって退学する。", vi: "Vì có lý do nên tôi bỏ học." }
  ],
  "しゅうしょくする": [
    { ja: "IT企業に就職しました。", vi: "Tôi đã xin được việc vào công ty IT." },
    { ja: "就職活動は大変です。", vi: "Hoạt động tìm việc làm rất vất vả." },
    { ja: "日本で就職したい。", vi: "Tôi muốn làm việc tại Nhật Bản." }
  ],
  "たいしょくする": [
    { ja: "来月、会社を退職します。", vi: "Tháng sau tôi sẽ nghỉ việc ở công ty." },
    { ja: "定年で退職する。", vi: "Nghỉ hưu vì đến tuổi." },
    { ja: "退職金をもらう。", vi: "Nhận tiền trợ cấp thôi việc." }
  ],
  "しつぎょう": [
    { ja: "会社が倒産して失業した。", vi: "Công ty phá sản nên tôi đã thất nghiệp." },
    { ja: "失業率が上がっている。", vi: "Tỷ lệ thất nghiệp đang tăng lên." },
    { ja: "失業保険を受け取る。", vi: "Nhận bảo hiểm thất nghiệp." }
  ],
  "ざんぎょう": [
    { ja: "今日は残業があります。", vi: "Hôm nay có làm thêm giờ." },
    { ja: "残業代が支払われる。", vi: "Được trả tiền làm thêm." },
    { ja: "毎日残業して疲れた。", vi: "Ngày nào cũng làm thêm nên tôi mệt rồi." }
  ],
  "せいかつ": [
    { ja: "日本の生活に慣れましたか。", vi: "Bạn đã quen với cuộc sống ở Nhật chưa?" },
    { ja: "生活費が高い。", vi: "Chi phí sinh hoạt cao." },
    { ja: "健康的な生活を送る。", vi: "Sống một cuộc sống lành mạnh." }
  ],
  "つうきん": [
    { ja: "通勤に１時間かかります。", vi: "Mất 1 tiếng để đi làm." },
    { ja: "電車で通勤する。", vi: "Đi làm bằng tàu điện." },
    { ja: "通勤ラッシュは疲れる。", vi: "Giờ cao điểm đi làm rất mệt mỏi." }
  ],
  "がくれき": [
    { ja: "学歴より能力が大切だ。", vi: "Năng lực quan trọng hơn bằng cấp." },
    { ja: "高学歴の人が多い。", vi: "Có nhiều người học vấn cao." },
    { ja: "学歴社会は終わった。", vi: "Xã hội trọng bằng cấp đã kết thúc." }
  ],
  "きゅうりょう": [
    { ja: "給料が上がって嬉しい。", vi: "Tôi rất vui vì lương tăng." },
    { ja: "給料日は毎月25日です。", vi: "Ngày nhận lương là ngày 25 hàng tháng." },
    { ja: "給料が少ない。", vi: "Tiền lương ít." }
  ],
  "めんせつ": [
    { ja: "明日、アルバイトの面接がある。", vi: "Ngày mai tôi có buổi phỏng vấn làm thêm." },
    { ja: "面接官の質問に答える。", vi: "Trả lời câu hỏi của người phỏng vấn." },
    { ja: "面接で緊張した。", vi: "Tôi đã lo lắng trong buổi phỏng vấn." }
  ],
  "きゅうけい": [
    { ja: "10分間、休憩しましょう。", vi: "Hãy nghỉ giải lao 10 phút nhé." },
    { ja: "休憩室でお茶を飲む。", vi: "Uống trà trong phòng nghỉ." },
    { ja: "休憩時間が短い。", vi: "Thời gian nghỉ ngơi quá ngắn." }
  ],
  "かんこう": [
    { ja: "京都を観光する。", vi: "Đi tham quan Kyoto." },
    { ja: "外国の観光客が多い。", vi: "Có nhiều khách du lịch người nước ngoài." },
    { ja: "観光地に行く。", vi: "Đến khu du lịch." }
  ],
  "きこく": [
    { ja: "来月、ベトナムへ帰国します。", vi: "Tháng sau tôi sẽ về nước (Việt Nam)." },
    { ja: "帰国の準備をする。", vi: "Chuẩn bị về nước." },
    { ja: "無事に帰国した。", vi: "Đã về nước bình an." }
  ],
  "きせい": [
    { ja: "お盆休みに帰省する。", vi: "Về quê vào kỳ nghỉ Obon." },
    { ja: "帰省ラッシュで道が混む。", vi: "Đường tắc vì dòng người ồ ạt về quê." },
    { ja: "久しぶりに帰省した。", vi: "Lâu lắm rồi mới về quê." }
  ],
  "きたく": [
    { ja: "夜10時に帰宅した。", vi: "Tôi đã về nhà lúc 10 giờ tối." },
    { ja: "帰宅時間が遅い。", vi: "Giờ về nhà muộn." },
    { ja: "帰宅ラッシュの時間だ。", vi: "Đang là giờ cao điểm đi làm về." }
  ],
  "さんか": [
    { ja: "ボランティア活動に参加する。", vi: "Tham gia hoạt động tình nguyện." },
    { ja: "参加費は無料です。", vi: "Phí tham gia là miễn phí." },
    { ja: "コンテストに参加する。", vi: "Tham gia vào cuộc thi." }
  ],
  "しゅっせき": [
    { ja: "今日の会議に出席します。", vi: "Tôi sẽ tham dự cuộc họp hôm nay." },
    { ja: "出席をとります。", vi: "Tôi sẽ điểm danh nhé." },
    { ja: "授業の出席率が悪い。", vi: "Tỉ lệ tham gia lớp học kém." }
  ],
  "けっせき": [
    { ja: "熱があるので、授業を欠席します。", vi: "Vì bị sốt nên tôi vắng mặt buổi học." },
    { ja: "欠席者が多い。", vi: "Có nhiều người vắng mặt." },
    { ja: "無断欠席はよくない。", vi: "Vắng mặt không phép là không tốt." }
  ],
  "ちこく": [
    { ja: "寝坊して学校に遅刻した。", vi: "Ngủ quên nên tôi đã đến trường muộn." },
    { ja: "遅刻しないでください。", vi: "Xin đừng đến muộn." },
    { ja: "バスが遅れて遅刻した。", vi: "Vì xe buýt trễ nên tôi đã đến muộn." }
  ],
  "けしょう": [
    { ja: "彼女は化粧が濃い。", vi: "Cô ấy trang điểm đậm." },
    { ja: "化粧品を買う。", vi: "Mua mỹ phẩm." },
    { ja: "化粧室はどこですか。", vi: "Phòng trang điểm (nhà vệ sinh) ở đâu vậy?" }
  ],
  "けいさん": [
    { ja: "お金を計算する。", vi: "Tính toán tiền bạc." },
    { ja: "計算が合わない。", vi: "Tính toán không khớp." },
    { ja: "彼は計算が早い。", vi: "Anh ấy tính toán rất nhanh." }
  ],
  "けいかく": [
    { ja: "旅行の計画を立てる。", vi: "Lập kế hoạch đi du lịch." },
    { ja: "計画通りに進む。", vi: "Tiến triển đúng theo kế hoạch." },
    { ja: "新しい計画を発表する。", vi: "Công bố kế hoạch mới." }
  ],
  "せいこう": [
    { ja: "実験は成功した。", vi: "Cuộc thử nghiệm đã thành công." },
    { ja: "大成功でした。", vi: "Đó là một thành công lớn." },
    { ja: "成功を祈ります。", vi: "Cầu chúc cho sự thành công." }
  ],
  "しっぱい": [
    { ja: "失敗は成功の母。", vi: "Thất bại là mẹ thành công." },
    { ja: "テストで失敗した。", vi: "Tôi đã làm hỏng bài kiểm tra." },
    { ja: "同じ失敗を繰り返さない。", vi: "Không lặp lại thất bại cũ." }
  ],
  "じゅんび": [
    { ja: "出発の準備ができました。", vi: "Đã chuẩn bị xong để xuất phát." },
    { ja: "パーティーの準備をする。", vi: "Chuẩn bị cho bữa tiệc." },
    { ja: "準備運動をする。", vi: "Tập thể dục khởi động." }
  ],
  "せいり": [
    { ja: "机の上を整理する。", vi: "Sắp xếp lại mặt bàn." },
    { ja: "心の整理がつかない。", vi: "Chưa thể sắp xếp lại cảm xúc." },
    { ja: "書類を整理して捨てる。", vi: "Sắp xếp tài liệu và vứt đi." }
  ],
  "ちゅうもん": [
    { ja: "コーヒーを注文する。", vi: "Gọi một ly cà phê." },
    { ja: "注文した品が届く。", vi: "Món đồ đã đặt đã giao đến." },
    { ja: "ネットで本を注文した。", vi: "Tôi đã đặt mua sách trên mạng." }
  ],
  "ちょきん": [
    { ja: "車を買うために貯金している。", vi: "Tôi đang tiết kiệm tiền để mua xe." },
    { ja: "貯金がなくなった。", vi: "Hết tiền tiết kiệm rồi." },
    { ja: "銀行に貯金する。", vi: "Gửi tiền tiết kiệm vào ngân hàng." }
  ],
  "てつや": [
    { ja: "昨日は徹夜で勉強した。", vi: "Hôm qua tôi đã thức trắng đêm để học." },
    { ja: "徹夜仕事で眠い。", vi: "Làm việc thâu đêm nên tôi rất buồn ngủ." },
    { ja: "徹夜は体に悪い。", vi: "Thức thâu đêm thì không tốt cho cơ thể." }
  ],
  "しんちょう": [
    { ja: "兄は身長が高い。", vi: "Anh trai tôi có chiều cao nổi bật." },
    { ja: "身長を測る。", vi: "Đo chiều cao." },
    { ja: "身長が伸びた。", vi: "Đã cao lên rồi." }
  ],
  "たいじゅう": [
    { ja: "最近、体重が増えた。", vi: "Gần đây, cân nặng của tôi đã tăng." },
    { ja: "体重を減らす。", vi: "Giảm cân." },
    { ja: "体重計に乗る。", vi: "Bước lên cân." }
  ],
  "けが": [
    { ja: "転んで足にけがをした。", vi: "Bị ngã nên chân bị thương." },
    { ja: "大けがをして入院した。", vi: "Bị thương nặng nên đã nhập viện." },
    { ja: "けがは治りましたか。", vi: "Vết thương của bạn đã lành chưa?" }
  ],
  "かい": [
    { ja: "歓迎会を開く。", vi: "Tổ chức tiệc chào mừng." },
    { ja: "女子会をする。", vi: "Tổ chức tiệc chỉ dành cho con gái." },
    { ja: "忘年会のお知らせ。", vi: "Thông báo về tiệc tất niên." }
  ],
  "しゅみ": [
    { ja: "私の趣味は読書です。", vi: "Sở thích của tôi là đọc sách." },
    { ja: "趣味が合わない。", vi: "Sở thích không hợp nhau." },
    { ja: "趣味に時間を使う。", vi: "Dành thời gian cho sở thích." }
  ],
  "きょうみ": [
    { ja: "日本の文化に興味があります。", vi: "Tôi có hứng thú với văn hóa Nhật Bản." },
    { ja: "歴史に興味を持つ。", vi: "Quan tâm đến lịch sử." },
    { ja: "興味深い話ですね。", vi: "Câu chuyện thú vị thật đấy." }
  ],
  "おもいで": [
    { ja: "子どもの頃の思い出。", vi: "Kỷ niệm thời thơ ấu." },
    { ja: "良い思い出ができた。", vi: "Đã có được một kỷ niệm đẹp." },
    { ja: "思い出の写真を残す。", vi: "Giữ lại bức ảnh kỷ niệm." }
  ],
  "じょうだん": [
    { ja: "冗談を言って笑わせる。", vi: "Nói đùa để làm mọi người cười." },
    { ja: "それは冗談でしょう？", vi: "Đó là đùa đúng không?" },
    { ja: "冗談が通じない人。", vi: "Người không hiểu được chuyện đùa." }
  ],
  "もくてき": [
    { ja: "日本へ来た目的は何ですか。", vi: "Mục đích bạn đến Nhật Bản là gì?" },
    { ja: "目的を達成する。", vi: "Đạt được mục đích." },
    { ja: "旅行の目的はリラックスです。", vi: "Mục đích của chuyến du lịch là thư giãn." }
  ],
  "やくそく": [
    { ja: "友達と遊ぶ約束がある。", vi: "Tôi có hẹn đi chơi với bạn." },
    { ja: "約束を守る。", vi: "Giữ lời hứa." },
    { ja: "約束を破る。", vi: "Thất hứa." }
  ],
  "おしゃべり": [
    { ja: "彼女はおしゃべりだ。", vi: "Cô ấy là người nói nhiều (nhiều chuyện)." },
    { ja: "授業中におしゃべりするな。", vi: "Không nói chuyện riêng trong giờ học." },
    { ja: "友達とおしゃべりを楽しむ。", vi: "Tận hưởng cuộc trò chuyện với bạn bè." }
  ],
  "しゃべる": [
    { ja: "日本語をしゃべる。", vi: "Nói tiếng Nhật." },
    { ja: "ずっとしゃべっている。", vi: "Đang nói chuyện suốt nãy giờ." },
    { ja: "秘密をしゃべってしまった。", vi: "Đã lỡ nói ra bí mật rồi." }
  ],
  "えんりょ": [
    { ja: "どうぞ遠慮しないで食べてください。", vi: "Xin đừng ngại ngần, hãy ăn đi." },
    { ja: "遠慮なく言及する。", vi: "Nói ra không ngần ngại." },
    { ja: "遠慮がちにする。", vi: "Có phần e dè." }
  ],
  "遠慮する": [
    { ja: "タバコはご遠慮ください。", vi: "Xin hãy hạn chế hút thuốc." },
    { ja: "ここでの通話は遠慮して。", vi: "Xin hạn chế gọi điện ở đây." },
    { ja: "参加を遠慮する。", vi: "Xin phép không tham gia." }
  ],
  "がまん": [
    { ja: "痛みを我慢する。", vi: "Chịu đựng cơn đau." },
    { ja: "もう我慢できない！", vi: "Không thể chịu đựng thêm nữa!" },
    { ja: "我慢強い性格。", vi: "Tính cách kiên nhẫn." }
  ],
  "我慢する": [
    { ja: "お菓子を食べるのを我慢する。", vi: "Nhẫn nhịn việc ăn bánh kẹo." },
    { ja: "トイレを我慢する。", vi: "Nhịn đi vệ sinh." },
    { ja: "少し我慢してください。", vi: "Xin hãy chịu đựng thêm một chút." }
  ],
  "めいわく": [
    { ja: "人に迷惑をかけてはいけない。", vi: "Không được gây phiền phức cho người khác." },
    { ja: "ご迷惑をおかけしました。", vi: "Đã làm phiền bạn rồi." },
    { ja: "迷惑な客。", vi: "Vị khách phiền phức." }
  ],
  "迷惑する": [
    { ja: "夜中に電話されて迷惑する。", vi: "Bị gọi điện giữa đêm nên thấy phiền phức." },
    { ja: "隣の騒音に迷惑している。", vi: "Bị phiền phức bởi tiếng ồn của nhà hàng xóm." },
    { ja: "迷惑している人が多い。", vi: "Có rất nhiều người đang thấy phiền." }
  ],
  "きぼう": [
    { ja: "将来の希望を持つ。", vi: "Có hi vọng về tương lai." },
    { ja: "希望が叶う。", vi: "Hi vọng trở thành hiện thực." },
    { ja: "あなたの希望を聞かせて。", vi: "Hãy cho tôi nghe mong muốn của bạn." }
  ],
  "希望する": [
    { ja: "参加を希望する人は手を挙げて。", vi: "Những người hi vọng tham gia hãy giơ tay." },
    { ja: "新しいパソコンを希望する。", vi: "Tôi mong có một cái máy tính mới." },
    { ja: "就職を希望する。", vi: "Hi vọng xin được việc làm." }
  ],
  "ゆめ": [
    { ja: "怖い夢を見た。", vi: "Tôi đã thấy một giấc mơ đáng sợ." },
    { ja: "私の夢は医者になることです。", vi: "Ước mơ của tôi là trở thành bác sĩ." },
    { ja: "夢を叶えるために頑張る。", vi: "Cố gắng để biến ước mơ thành hiện thực." }
  ],
  "さんせい": [
    { ja: "あなたの意見に賛成です。", vi: "Tôi đồng ý với ý kiến của bạn." },
    { ja: "賛成多数で決まる。", vi: "Được quyết định bằng đa số tán thành." },
    { ja: "彼らはこの計画に賛成している。", vi: "Họ đang ủng hộ kế hoạch này." }
  ],
  "はんたい": [
    { ja: "親に反対された。", vi: "Bị bố mẹ phản đối." },
    { ja: "反対の意見を言う。", vi: "Nói ý kiến phản đối." },
    { ja: "逆の方向は反対です。", vi: "Hướng ngược lại." }
  ],
  "そうぞう": [
    { ja: "未来の生活を想像する。", vi: "Tưởng tượng về cuộc sống tương lai." },
    { ja: "想像力が豊かだ。", vi: "Trí tưởng tượng phong phú." },
    { ja: "想像以上の結果が出た。", vi: "Ra kết quả hơn cả sức tưởng tượng." }
  ],
  "どりょく": [
    { ja: "努力すれば成功する。", vi: "Nếu nỗ lực thì sẽ thành công." },
    { ja: "努力が実を結ぶ。", vi: "Sự nỗ lực đơm hoa kết trái." },
    { ja: "目標に向けて努力する。", vi: "Nỗ lực hướng đến mục tiêu." }
  ],
  "わたし": [
    { ja: "私は学生です。", vi: "Tôi là học sinh." },
    { ja: "私の名前は田中です。", vi: "Tên của tôi là Tanaka." },
    { ja: "私の趣味は旅行です。", vi: "Sở thích của tôi là đi du lịch." }
  ],
  "かぞく": [
    { ja: "私の家族は４人です。", vi: "Gia đình tôi có 4 người." },
    { ja: "家族と旅行に行く。", vi: "Đi du lịch cùng gia đình." },
    { ja: "家族を大切にする。", vi: "Trân trọng gia đình." }
  ],
  "ちち": [
    { ja: "父は会社員です。", vi: "Bố tôi là nhân viên văn phòng." },
    { ja: "父とキャッチボールをする。", vi: "Chơi ném bóng với bố." },
    { ja: "父の日にプレゼントをあげる。", vi: "Tặng quà nhân Ngày Của Cha." }
  ],
  "はは": [
    { ja: "母の料理は美味しい。", vi: "Đồ ăn mẹ nấu rất ngon." },
    { ja: "母と一緒に買い物に行く。", vi: "Đi mua sắm cùng mẹ." },
    { ja: "母はいつも忙しい。", vi: "Mẹ lúc nào cũng bận rộn." }
  ],
  "あに": [
    { ja: "兄は大学生です。", vi: "Anh trai tôi là sinh viên đại học." },
    { ja: "兄に勉強を教えてもらう。", vi: "Được anh trai dạy học cho." },
    { ja: "兄とケンカした。", vi: "Tôi đã cãi nhau với anh trai." }
  ],
  "おとうと": [
    { ja: "弟はサッカーが好きです。", vi: "Em trai tôi thích bóng đá." },
    { ja: "弟と一緒にゲームをする。", vi: "Chơi game cùng em trai." },
    { ja: "弟が生まれた。", vi: "Em trai đã ra đời." }
  ],
  "あね": [
    { ja: "姉は結婚しています。", vi: "Chị gái tôi đã kết hôn." },
    { ja: "姉の服を借りる。", vi: "Mượn quần áo của chị gái." },
    { ja: "姉は髪が長い。", vi: "Chị gái có mái tóc dài." }
  ],
  "いもうと": [
    { ja: "妹は泣き虫だ。", vi: "Em gái tôi hay khóc nhè." },
    { ja: "妹とケーキを分ける。", vi: "Chia bánh kem với em gái." },
    { ja: "妹が可愛くて仕方ない。", vi: "Em gái đáng yêu không chịu nổi." }
  ],
  "そふ": [
    { ja: "祖父は庭いじりが好きです。", vi: "Ông tôi thích làm vườn." },
    { ja: "祖父の家を訪ねる。", vi: "Đến thăm nhà ông." },
    { ja: "祖父は今年80歳になる。", vi: "Ông tôi năm nay 80 tuổi." }
  ],
  "そぼ": [
    { ja: "祖母は料理が上手です。", vi: "Bà tôi nấu ăn rất giỏi." },
    { ja: "祖母から昔の話を聞く。", vi: "Nghe câu chuyện ngày xưa từ bà." },
    { ja: "祖母に手紙を書く。", vi: "Viết thư cho bà." }
  ],
  "おじ": [
    { ja: "夏休みにおじの家へ行った。", vi: "Kỳ nghỉ hè tôi đã đến nhà chú." },
    { ja: "おじは医者をしています。", vi: "Chú tôi đang làm bác sĩ." },
    { ja: "おじからお年玉をもらう。", vi: "Nhận tiền mừng tuổi từ chú." }
  ],
  "おば": [
    { ja: "おばはとても親切です。", vi: "Cô tôi rất tốt bụng." },
    { ja: "おばの作ったクッキーを食べる。", vi: "Ăn bánh quy do cô làm." },
    { ja: "おばは東京に住んでいる。", vi: "Cô tôi sống ở Tokyo." }
  ],
  "いとこ": [
    { ja: "いとことよく遊んだ。", vi: "Tôi thường hay chơi với anh em họ." },
    { ja: "いとこの結婚式に行く。", vi: "Đến dự lễ cưới của anh họ." },
    { ja: "いとこは私と同い年だ。", vi: "Anh/em họ cùng tuổi với tôi." }
  ],
  "いえ": [
    { ja: "新しい家を建てる。", vi: "Xây một căn nhà mới." },
    { ja: "家でゆっくり休む。", vi: "Nghỉ ngơi thư giãn ở nhà." },
    { ja: "家に帰る。", vi: "Trở về nhà." }
  ],
  "おんがく": [
    { ja: "音楽を聴くのが好きです。", vi: "Tôi thích nghe nhạc." },
    { ja: "クラシック音楽を聴く。", vi: "Nghe nhạc cổ điển." },
    { ja: "音楽の授業は楽しい。", vi: "Giờ học âm nhạc rất vui." }
  ],
  "きおく": [
    { ja: "その時の記憶がありません。", vi: "Tôi không có ký ức về lúc đó." },
    { ja: "記憶力が良い。", vi: "Trí nhớ tốt." },
    { ja: "記憶に残る言葉。", vi: "Những lời nói đọng lại trong trí nhớ." }
  ],
  "うんどう": [
    { ja: "毎日運動するようにしている。", vi: "Tôi đang cố gắng vận động mỗi ngày." },
    { ja: "運動不足を解消する。", vi: "Giải quyết việc thiếu vận động." },
    { ja: "公園で運動する。", vi: "Tập thể dục trong công viên." }
  ],
  "たいせつ": [
    { ja: "時間を大切にする。", vi: "Trân trọng thời gian." },
    { ja: "大切な友達。", vi: "Người bạn quan trọng." },
    { ja: "健康は一番大切です。", vi: "Sức khỏe là quan trọng nhất." }
  ],
  "すぽーつ": [
    { ja: "スポーツをするのは体に良い。", vi: "Chơi thể thao rất tốt cho cơ thể." },
    { ja: "冬のスポーツといえばスキーだ。", vi: "Nói đến thể thao mùa đông là nhắc đến trượt tuyết." },
    { ja: "スポーツニュースを見る。", vi: "Xem tin tức thể thao." }
  ],
  "がくせい": [
    { ja: "私は大学の学生です。", vi: "Tôi là sinh viên đại học." },
    { ja: "学生時代が懐かしい。", vi: "Nhớ nhung thời học sinh." },
    { ja: "真面目な学生が多い。", vi: "Có rất nhiều học sinh chăm chỉ." }
  ],
  "ただしい": [
    { ja: "正しい答えを選ぶ。", vi: "Chọn câu trả lời đúng." },
    { ja: "正しい日本語を使う。", vi: "Sử dụng tiếng Nhật chuẩn." },
    { ja: "彼の言っていることは正しい。", vi: "Những gì anh ấy nói là đúng." }
  ],
  "ことば": [
    { ja: "外国の言葉を学ぶ。", vi: "Học ngôn ngữ nước ngoài." },
    { ja: "優しい言葉をかける。", vi: "Dành cho những lời nói dịu dàng." },
    { ja: "言葉の意味を調べる。", vi: "Tra nghĩa của từ vựng." }
  ],
  "はなす": [
    { ja: "日本語を話すことができます。", vi: "Tôi có thể nói tiếng Nhật." },
    { ja: "友達と電話で話す。", vi: "Nói chuyện điện thoại với bạn." },
    { ja: "ゆっくり話してください。", vi: "Xin hãy nói chậm lại." }
  ],
  "かく": [
    { ja: "名前をノートに書く。", vi: "Viết tên vào vở." },
    { ja: "漢字を書く練習をする。", vi: "Luyện tập viết Kanji." },
    { ja: "友達に手紙を書く。", vi: "Viết thư cho bạn bè." }
  ],
  "みる": [
    { ja: "テレビを見るのが好きです。", vi: "Tôi thích xem ti vi." },
    { ja: "美しい景色を見る。", vi: "Ngắm cảnh đẹp." },
    { ja: "映画を見るために映画館へ行く。", vi: "Đến rạp để xem phim." }
  ],
  "たべる": [
    { ja: "朝ご飯を食べる。", vi: "Ăn bữa sáng." },
    { ja: "寿司を食べるのが好きです。", vi: "Tôi thích ăn Sushi." },
    { ja: "たくさん食べてください。", vi: "Hãy ăn nhiều vào nhé." }
  ],
  "あそぶ": [
    { ja: "子供が公園で遊ぶ。", vi: "Trẻ con chơi trong công viên." },
    { ja: "友達と遊ぶ約束をした。", vi: "Đã hẹn đi chơi với bạn." },
    { ja: "ゲームをして遊ぶ。", vi: "Chơi game." }
  ],
  "しゅみ": [
    { ja: "休日は趣味の時間に使う。", vi: "Dành thời gian ngày nghỉ cho sở thích." },
    { ja: "共通の趣味を持つ。", vi: "Có sở thích chung." },
    { ja: "趣味は写真撮影です。", vi: "Sở thích của tôi là chụp ảnh." }
  ],
  "しんねんかい": [
    { ja: "会社の新年会に参加する。", vi: "Tham gia tiệc tân niên của công ty." },
    { ja: "新年会で乾杯する。", vi: "Cạn ly tại bữa tiệc năm mới." },
    { ja: "新年会の幹事を任された。", vi: "Được giao nhiệm vụ quản trò cho bữa tiệc năm mới." }
  ],
  "いう": [
    { ja: "彼は「ありがとう」と言った。", vi: "Anh ấy đã nói 'Cảm ơn'." },
    { ja: "嘘を言うのは良くない。", vi: "Nói dối là không tốt." },
    { ja: "自分の意見をはっきり言う。", vi: "Nói rõ ràng ý kiến của bản thân." }
  ],
  "ねん": [
    { ja: "今年は2026年です。", vi: "Năm nay là năm 2026." },
    { ja: "来年、日本へ行きます。", vi: "Năm sau tôi sẽ đi Nhật." },
    { ja: "数年前に彼に会った。", vi: "Tôi đã gặp anh ấy vài năm trước." }
  ],
  "ひ": [
    { ja: "今日は天気がいい日ですね。", vi: "Hôm nay là một ngày thời tiết đẹp nhỉ." },
    { ja: "記念日をお祝いする。", vi: "Ăn mừng ngày kỷ niệm." },
    { ja: "次の休みの日には何をするの？", vi: "Ngày nghỉ tiếp theo bạn sẽ làm gì?" }
  ],
  "うえ": [
    { ja: "机の上に本がある。", vi: "Có quyển sách ở trên bàn." },
    { ja: "山の上の空気はきれいだ。", vi: "Không khí trên núi rất trong lành." },
    { ja: "上を向いて歩く。", vi: "Ngẩng mặt lên trên và bước đi." }
  ],
  "たのしい": [
    { ja: "パーティーはとても楽しい。", vi: "Bữa tiệc rất vui." },
    { ja: "楽しい時間を過ごした。", vi: "Đã trải qua một khoảng thời gian vui vẻ." },
    { ja: "旅行は楽しい思い出になった。", vi: "Chuyến du lịch đã trở thành kỷ niệm vui vẻ." }
  ],
  "じかん": [
    { ja: "もうこんな時間だ。", vi: "Đã đến giờ này rồi sao." },
    { ja: "時間に遅れないようにしてください。", vi: "Xin đừng đến trễ giờ." },
    { ja: "勉強する時間を作る。", vi: "Tạo thời gian để học tập." }
  ],
  "ばしょ": [
    { ja: "集合場所を決める。", vi: "Quyết định địa điểm tập trung." },
    { ja: "静かな場所で本を読む。", vi: "Đọc sách ở một nơi yên tĩnh." },
    { ja: "ここは安全な場所です。", vi: "Nơi này là địa điểm an toàn." }
  ],
  "もの": [
    { ja: "美味しいものを食べたい。", vi: "Tôi muốn ăn đồ ngon." },
    { ja: "忘れ物に注意する。", vi: "Chú ý để không quên đồ." },
    { ja: "古いものを捨てる。", vi: "Vứt bỏ đồ cũ." }
  ],
  "かた": [
    { ja: "あの方はどなたですか？", vi: "Vị kia là ai vậy?" },
    { ja: "漢字の読み方を調べる。", vi: "Tra cứu cách đọc chữ Kanji." },
    { ja: "作り方を教えてください。", vi: "Xin hãy chỉ cho tôi cách làm." }
  ],
  "しんこう": [
    { ja: "工事が進行している。", vi: "Công trình đang được tiến hành." },
    { ja: "プログラムを進行する。", vi: "Tiến hành chương trình." },
    { ja: "ゲームの進行を保存する。", vi: "Lưu tiến trình của trò chơi." }
  ],
  "ひつよう": [
    { ja: "パスポートが必要です。", vi: "Cần phải có hộ chiếu." },
    { ja: "彼には休息が必要だ。", vi: "Anh ấy cần được nghỉ ngơi." },
    { ja: "必要なものをリストにする。", vi: "Lập danh sách những thứ cần thiết." }
  ],
  "ねんび": [
    { ja: "年日を記録する。", vi: "Ghi chép lại ngày tháng năm." },
    { ja: "書類に年日を記入する。", vi: "Điền ngày tháng năm vào tài liệu." },
    { ja: "正確な年日を確認する。", vi: "Xác nhận ngày tháng năm chính xác." }
  ],
  "だいじ": [
    { ja: "大事な会議がある。", vi: "Có một cuộc họp quan trọng." },
    { ja: "体を大事にしてください。", vi: "Xin hãy giữ gìn cơ thể cẩn thận." },
    { ja: "大事な用事を思い出した。", vi: "Đã nhớ ra việc quan trọng." }
  ],
  "にほん": [
    { ja: "日本へようこそ。", vi: "Chào mừng đến với Nhật Bản." },
    { ja: "日本の文化に興味がある。", vi: "Tôi quan tâm đến văn hóa Nhật Bản." },
    { ja: "日本語を勉強しています。", vi: "Tôi đang học tiếng Nhật." }
  ],
  "ひき": [
    { ja: "ドアを引き開ける。", vi: "Kéo mở cửa." },
    { ja: "犬の引きひもを持つ。", vi: "Cầm dây dắt chó." },
    { ja: "強い引きに驚いた。", vi: "Tôi bất ngờ vì sức kéo mạnh." }
  ],
  "とおい": [
    { ja: "駅からは遠いです。", vi: "Nó ở xa nhà ga." },
    { ja: "遠い国へ旅行したい。", vi: "Tôi muốn đi du lịch đến một đất nước xa xôi." },
    { ja: "遠くまで歩いた。", vi: "Đã đi bộ đến một nơi rất xa." }
  ],
  "まだ": [
    { ja: "宿題はまだ終わっていません。", vi: "Bài tập về nhà thì vẫn chưa xong." },
    { ja: "まだ時間があります。", vi: "Vẫn còn thời gian." },
    { ja: "彼はまだ寝ている。", vi: "Anh ấy vẫn còn đang ngủ." }
  ],
  "しる": [
    { ja: "そのニュースを知っていますか？", vi: "Bạn có biết tin tức đó không?" },
    { ja: "彼を知る人は少ない。", vi: "Có ít người biết anh ấy." },
    { ja: "真実を知りたい。", vi: "Tôi muốn biết sự thật." }
  ],
  "あたらしい": [
    { ja: "新しい靴を買った。", vi: "Tôi đã mua đôi giày mới." },
    { ja: "新しい技術を学ぶ。", vi: "Học hỏi công nghệ mới." },
    { ja: "新しい年が始まる。", vi: "Một năm mới bắt đầu." }
  ],
  "りょこう": [
    { ja: "来月、旅行に行きます。", vi: "Tháng sau tôi sẽ đi du lịch." },
    { ja: "家族旅行は楽しかった。", vi: "Chuyến du lịch gia đình đã rất vui." },
    { ja: "海外旅行を計画する。", vi: "Lập kế hoạch đi du lịch nước ngoài." }
  ],
  "こども": [
    { ja: "子供が公園で遊んでいる。", vi: "Bọn trẻ đang chơi trong công viên." },
    { ja: "子供のために本を買う。", vi: "Mua sách cho bọn trẻ." },
    { ja: "子供の成長は早い。", vi: "Sự trưởng thành của trẻ con rất nhanh." }
  ],
  "さっかー": [
    { ja: "サッカーを見るのが好きです。", vi: "Tôi thích xem bóng đá." },
    { ja: "彼はサッカーの試合に出た。", vi: "Anh ấy đã ra sân trong trận đấu bóng đá." },
    { ja: "公園でサッカーをする。", vi: "Chơi bóng đá trong công viên." }
  ],
  "せんしゅ": [
    { ja: "彼は有名なサッカー選手です。", vi: "Anh ấy là một cầu thủ bóng đá nổi tiếng." },
    { ja: "オリンピックの選手を応援する。", vi: "Cổ vũ cho vận động viên Olympic." },
    { ja: "プロの選手になる。", vi: "Trở thành vận động viên chuyên nghiệp." }
  ],
  "おもう": [
    { ja: "これがいいと思います。", vi: "Tôi nghĩ cái này tốt đấy." },
    { ja: "あなたのことをいつも思っている。", vi: "Lúc nào tôi cũng nghĩ về bạn." },
    { ja: "どう思うか教えてください。", vi: "Xin hãy cho tôi biết bạn nghĩ gì." }
  ]
};

const filePath = './public/data/japanese/vocabulary.json';
let vocabData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

vocabData.forEach(item => {
  const h = item.hiragana;
  if (examplesMap[h]) {
    item.examples = examplesMap[h];
  }
});

fs.writeFileSync(filePath, JSON.stringify(vocabData, null, 2));
console.log("Đã cập nhật toàn bộ ví dụ thành công!");
