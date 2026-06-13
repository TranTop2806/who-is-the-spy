export interface DrinkingCard {
  id: string;
  type: "DARE" | "TRUTH" | "RULE" | "VOTE" | "INTERACTIVE" | "VIRAL";
  content: string;
  penalty: number;
}

// ==========================================
// 1. NHÓM (GROUP) PARTY PACK (250 UNIQUE CARDS)
// ==========================================

const GROUP_BASE_CARDS: Omit<DrinkingCard, "id">[] = [
  // DARE (50)
  { type: "DARE", content: "Uống liên tiếp 2 hớp mà không nuốt nước bọt giữa chừng.", penalty: 2 },
  { type: "DARE", content: "Nêu tên 3 người bạn từng ghét trong quá khứ hoặc uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Đọc ngược bảng chữ cái tiếng Việt từ Z về A trong 20 giây, thất bại uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Cho cả nhóm xem ảnh dìm gần nhất trong điện thoại của bạn hoặc uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Đứng một chân trong suốt vòng chơi này, hạ chân xuống trước lượt sau uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Múa cột giả định với một chiếc ghế trong 15 giây hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Ăn một lát chanh/ớt trực tiếp hoặc phạt uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Hát một bài hát thiếu nhi bằng giọng điệu của một người đang say rượu hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Cho cả nhóm xem lịch sử tìm kiếm Google gần nhất của bạn hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Sủa tiếng chó sủa vang nhà trong 10 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Ăn một thìa tương ớt trực tiếp hoặc uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Đứng dậy và nhảy theo điệu nhảy hot trend Tiktok gần đây nhất bạn nhớ hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Uống cạn ly nước hiện tại của bạn.", penalty: 3 },
  { type: "DARE", content: "Nằm sấp xuống đất hít đất 15 cái liên tục, không làm nổi uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Chạy ra ngoài cửa hét lớn 'Tôi bị điên' hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Làm biểu cảm quyến rũ nhất có thể trong 10 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Bắn rap một đoạn ngắn (bất kỳ bài nào) hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Nhại lại giọng của một nhân vật meme nổi tiếng trên mạng xã hội hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Giả làm streamer bán kem trộn trong 30 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Dùng giọng điệu 'dẹo' nhất để nói chuyện trong 1 vòng chơi hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Uống nước bằng tai hoặc mũi (nếu không làm được uống 2 hớp phạt).", penalty: 2 },
  { type: "DARE", content: "Đóng vai người mẫu catwalk một vòng quanh phòng hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Để người khác nhột bạn trong 10 giây mà không được phát ra tiếng động nào.", penalty: 2 },
  { type: "DARE", content: "Giả tiếng mèo kêu nũng nịu với người bên phải trong 15 giây hoặc uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Nêu tên 3 bộ phim người lớn bạn từng xem gần đây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Cười lớn như một ác nhân trong phim điện ảnh trong 15 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Thực hiện tư thế yoga khó nhất bạn biết trong 20 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Nhắm mắt và đoán món đồ vật người khác đặt vào tay, đoán sai uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Đọc to tin nhắn SMS/Zalo gần nhất bạn nhận được hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Nói giọng địa phương khác (miền Trung/miền Nam/miền Bắc) trong 2 vòng chơi.", penalty: 2 },
  { type: "DARE", content: "Vẽ một hình ngộ nghĩnh lên trán bằng son hoặc bút viết hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Để cả nhóm kiểm tra danh mục ứng dụng cài đặt trên điện thoại của bạn.", penalty: 2 },
  { type: "DARE", content: "Thực hiện điệu nhảy robot trong 20 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Kể lại một giấc mơ kỳ lạ nhất bạn từng mơ gần đây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Giả làm một con khỉ trong 15 giây (khua tay múa chân kêu éc éc) hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Đứng nghiêm chào cờ và hát quốc ca một đoạn nhỏ hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Nêu 3 điều bạn không thích ở bản thân hoặc phạt uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Tự véo má mình thật mạnh trong 10 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Giả giọng trẻ con khóc đòi sữa trong 15 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Uống nước bằng thìa/muỗng liên tục 15 thìa hoặc uống 2 hớp phạt.", penalty: 2 },
  { type: "DARE", content: "Thực hiện động tác squat 20 cái liên tục hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Để người bên trái viết chữ lên lưng bạn và bạn phải đoán đúng chữ đó.", penalty: 2 },
  { type: "DARE", content: "Tháo tất (vớ) ra đeo vào tay cho đến lượt sau của bạn hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Nói một câu tự luyến bản thân đẹp trai/đẹp gái nhất phòng 5 lần liên tiếp.", penalty: 2 },
  { type: "DARE", content: "Giữ im lặng hoàn toàn không nói một lời nào cho đến lượt sau, vi phạm uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Nhấp nháy một mắt liên tục trong 15 giây hoặc phạt uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Kể tên 3 người nổi tiếng bạn muốn hẹn hò nhất hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Chạy tại chỗ thật nhanh trong 30 giây hoặc phạt uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Vẽ một khuôn mặt cười lên lòng bàn tay và giơ lên chào mỗi khi có ai nói.", penalty: 2 },
  { type: "DARE", content: "Hãy uống chéo chén với người ngồi đối diện bạn.", penalty: 1 },

  // TRUTH (30)
  { type: "TRUTH", content: "Kỷ niệm xấu hổ nhất của bạn lúc đi học là gì? Không nói uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn có đang thầm thương trộm nhớ ai trong căn phòng này không? Trả lời thật hoặc uống 3 hớp.", penalty: 3 },
  { type: "TRUTH", content: "Lời nói dối tệ hại nhất bạn từng nói với bố mẹ là gì? Không kể uống 2 chén.", penalty: 2 },
  { type: "TRUTH", content: "Lần gần nhất bạn khóc là khi nào và vì lý do gì? Trả lời thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn đã từng ngoại tình hoặc bắt cá hai tay chưa? Trả lời thật hoặc uống 3 chén.", penalty: 3 },
  { type: "TRUTH", content: "Ai là người bạn cảm thấy phiền phức nhất trong phòng này? Trả lời thật hoặc uống 2 chén.", penalty: 2 },
  { type: "TRUTH", content: "Mối tình ngắn nhất của bạn kéo dài bao lâu? Trả lời thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn từng bí mật lục lọi điện thoại của người yêu chưa? Trả lời thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Mẫu người yêu lý tưởng của bạn là gì? Nói thật hoặc uống 1 hớp.", penalty: 1 },
  { type: "TRUTH", content: "Nếu được chọn quay lại với 1 người yêu cũ, bạn có chọn không? Nói thật hoặc uống 3 hớp.", penalty: 3 },
  { type: "TRUTH", content: "Bạn từng có mối quan hệ mập mờ (situationship) bao giờ chưa? Kể thật hoặc uống 2 chén.", penalty: 2 },
  { type: "TRUTH", content: "Bạn có bao giờ lập nick clone để đi stalk người yêu cũ/crush chưa? Nói thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Số tiền nhiều nhất bạn từng chi cho một buổi hẹn hò là bao nhiêu? Nói thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn đã từng 'cắm sừng' ai hoặc bị ai 'cắm sừng' chưa? Trả lời thật hoặc uống 3 chén.", penalty: 3 },
  { type: "TRUTH", content: "Ấn tượng xấu nhất của bạn về một người trong phòng này lúc mới gặp là gì? Nói thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn từng nói dối mình đang bận để trốn một cuộc hẹn chưa? Nói thật hoặc uống 1 hớp.", penalty: 1 },
  { type: "TRUTH", content: "Có bao giờ bạn 'quên' trả tiền nợ vặt cho bạn bè chưa? Khai thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn từng khóc thầm trong nhà vệ sinh của công ty/trường học chưa? Kể lại hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Điều điên rồ nhất bạn từng làm khi say rượu là gì? Nói thật hoặc uống 3 hớp.", penalty: 3 },
  { type: "TRUTH", content: "Bạn đã từng quẹt Tinder và gặp người quen bao giờ chưa? Kể lại hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Nỗi sợ lớn nhất của bạn trong cuộc sống hiện tại là gì? Trả lời thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn có hay nói xấu đồng nghiệp hay bạn bè sau lưng không? Trả lời thật hoặc uống 2 chén.", penalty: 2 },
  { type: "TRUTH", content: "Bạn từng đi vệ sinh mà quên mang giấy chưa và đã xử lý thế nào? Kể thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bộ đồ đắt nhất bạn từng mua có giá trị bao nhiêu và có hối hận không?", penalty: 2 },
  { type: "TRUTH", content: "Bạn từng giả vờ thích một món quà người khác tặng chưa? Nói thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn có thói quen kỳ lạ nào khi ở một mình không? Kể thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Đã bao giờ bạn tự tìm kiếm tên mình trên Google chưa? Nói thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn có tin vào tình yêu sét đánh không? Nói thật lòng hoặc uống 1 hớp.", penalty: 1 },
  { type: "TRUTH", content: "Ai trong căn phòng này là người bạn tin tưởng nhất khi có bí mật? Nói thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Món ăn kinh khủng nhất bạn từng ăn trong đời là gì? Kể lại hoặc phạt uống 2 hớp.", penalty: 2 },

  // RULE (20)
  { type: "RULE", content: "LUẬT MỚI: Ai nói từ 'uống' hoặc 'nhậu' từ giờ đến hết trận phải uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Mỗi khi uống, bạn phải nói 'Cảm ơn cả nhà' trước, quên nói uống thêm 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Không ai được chạm vào điện thoại di động. Ai chạm vào phạt uống 2 hớp.", penalty: 2 },
  { type: "RULE", content: "LUẬT MỚI: Mọi người phải nói thầm từ giờ đến lượt chơi tiếp theo của bạn. Ai nói to uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Khi bạn uống, người bên phải bạn cũng phải uống theo một lượng tương đương.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Ai sử dụng tiếng nước ngoài từ giờ đến hết vòng chơi này phải uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Tất cả mọi người không được chỉ tay vào người khác. Ai vi phạm uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Không được gọi tên thật của nhau, phải dùng biệt danh hoặc uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Ai khoanh tay trước ngực phạt uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Tất cả phải ngồi thẳng lưng. Ai gù lưng phạt uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Ai cười hở răng phạt uống 1 hớp (cho đến lượt chơi tiếp theo).", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Không được chạm tay vào cằm hoặc má của mình. Ai vi phạm uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Mỗi khi nói chuyện phải chắp tay trước ngực như đang cầu nguyện hoặc uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Ai bắt chéo chân phải uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Không được nói từ 'Tôi' hay 'Tao' từ giờ đến hết vòng. Vi phạm uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Phải xưng hô là 'Huynh - Đệ' hoặc 'Tỉ - Muội' với người bên cạnh, sai phạt uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Ai vuốt tóc phạt uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Mọi người chỉ được dùng tay trái để cầm ly nước uống, dùng tay phải phạt 2 hớp.", penalty: 2 },
  { type: "RULE", content: "LUẬT MỚI: Ai gác chân lên ghế phạt uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Không được gật đầu hay lắc đầu để trả lời từ giờ đến hết vòng. Vi phạm phạt 1 hớp.", penalty: 1 },

  // VOTE (20)
  { type: "VOTE", content: "Cả nhóm biểu quyết xem ai là người lăng nhăng nhất phòng. Người bị vote nhiều nhất uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Cả nhóm biểu quyết xem ai là người keo kiệt nhất. Người bị vote nhiều nhất uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người có khả năng đi tù cao nhất? Biểu quyết và người thắng cuộc uống 3 hớp.", penalty: 3 },
  { type: "VOTE", content: "Ai là người có gu ăn mặc tệ nhất hôm nay? Biểu quyết và người bị chọn uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người hay trễ hẹn nhất nhóm? Biểu quyết và người bị chọn uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người dại gái/dại trai nhất nhóm? Biểu quyết và người thắng uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người có nhiều bí mật thầm kín nhất? Biểu quyết và người bị vote nhiều nhất uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người dễ khóc nhất phòng? Biểu quyết và người bị chọn uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người có khả năng làm sếp lớn nhất sau này? Người được vote nhiều nhất uống 1 hớp ăn mừng.", penalty: 1 },
  { type: "VOTE", content: "Ai hay quên mang ví nhất mỗi khi đi nhậu? Vote và người đó uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người có tửu lượng kém nhất phòng này? Vote và người đó tự giác uống 2 hớp khai vị.", penalty: 2 },
  { type: "VOTE", content: "Ai là người có nhiều người yêu cũ nhất? Vote và người bị vote nhiều nhất uống 3 hớp.", penalty: 3 },
  { type: "VOTE", content: "Ai là người nghiện MXH (Tiktok/Facebook) nhất phòng? Vote và người thắng uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người hướng ngoại, hay khuấy động đám đông nhất phòng? Người thắng uống 1 hớp.", penalty: 1 },
  { type: "VOTE", content: "Ai hay than nghèo kể khổ nhất nhóm? Vote và người thắng uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai có khả năng kết hôn sớm nhất nhóm? Vote và người thắng uống 1 hớp chúc mừng.", penalty: 1 },
  { type: "VOTE", content: "Ai hay nhắn tin thả thính dạo nhất? Vote và người thắng uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người có giấc ngủ nướng lâu nhất? Vote và người thắng uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người khó tính nhất nhóm? Vote và người thắng uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người tiêu tiền hoang phí nhất tháng này? Vote và người thắng uống 2 hớp.", penalty: 2 },

  // VIRAL (30)
  { type: "VIRAL", content: "Tất cả những ai đang độc thân (F.A) hãy uống 1 hớp để chia buồn.", penalty: 1 },
  { type: "VIRAL", content: "Tất cả những ai đang có người yêu hãy uống 1 hớp để ăn mừng.", penalty: 1 },
  { type: "VIRAL", content: "Ai thấp nhất phòng này hãy tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai cao nhất phòng này hãy tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai có đôi mắt cận nặng nhất phòng uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Tất cả những người mặc áo màu đen hãy uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai đang sử dụng iPhone dòng Pro/Pro Max tự giác uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Ai đi làm muộn nhiều nhất tháng này tự giác uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Tất cả mọi người oẳn tù tì với người bên phải, ai thua uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Trò chơi đếm số: Mọi người lần lượt đếm từ 1 đến 20, ai đếm trùng số hoặc đếm chậm phải uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Ai nhuộm tóc tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai chưa tắm hôm nay tự giác uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Ai đang đi tất (vớ) uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai sinh vào tháng chẵn tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai sinh vào tháng lẻ tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai có hình xăm trên người tự giác uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Ai đang đeo đồng hồ/vòng tay tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai có số đuôi điện thoại là số chẵn uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai có số đuôi điện thoại là số lẻ uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai đi xe máy đến đây tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai dậy trước 7 giờ sáng hôm nay uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai thức khuya sau 1 giờ đêm hôm qua uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Tất cả mọi người giơ ngón tay trỏ lên trời, ai giơ chậm nhất uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Ai trong ví hiện tại có tiền mặt tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai trong ví hiện tại không có tiền mặt uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai cao trên 1m70 tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai dưới 1m60 tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai đang đeo kính cận tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai uống rượu bia say xỉn nhiều nhất tuần trước phạt 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Tất cả chạm tay vào mũi ngay lập tức, ai làm chậm nhất uống 2 hớp.", penalty: 2 }
];

// GROUP TEMPLATE CARDS (90 UNIQUE TEMPLATES)
const GROUP_TEMPLATES: Omit<DrinkingCard, "id">[] = [
  // DARE
  { type: "INTERACTIVE", content: "{P1} hãy thơm má {P2} hoặc cả hai cùng uống {N} chén.", penalty: 2 },
  { type: "INTERACTIVE", content: "{P1} hãy oẳn tù tì với {P2}, ai thua uống {N} hớp.", penalty: 2 },
  { type: "INTERACTIVE", content: "{P1} vật tay với {P2}, ai thắng được miễn uống, ai thua uống {N} chén.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy cõng {P2} đi một vòng quanh phòng hoặc uống {N} chén.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy mát xa vai cho {P2} trong 30 giây hoặc uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} phải làm tóc cho {P2} theo kiểu kỳ dị nhất hoặc uống {N} hớp.", penalty: 2 },
  { type: "INTERACTIVE", content: "{P1} hãy nhìn thẳng vào mắt {P2} trong 15 giây mà không được cười, ai cười trước uống {N} hớp.", penalty: 2 },
  { type: "INTERACTIVE", content: "{P1} hãy nhảy đôi cùng {P2} trong 20 giây hoặc cả hai cùng uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy hát tặng {P2} một câu hát có từ 'yêu' hoặc cả hai cùng uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy nhắn tin nói 'Tôi nhớ bạn' cho người đầu tiên trong danh bạ hiển thị dưới sự giám sát của {P2}, từ chối uống {N} chén.", penalty: 3 },
  { type: "DARE", content: "{P1} hãy đưa điện thoại cho {P2} chọn một bức ảnh bất kỳ trong album và đăng lên mạng xã hội hoặc {P1} uống {N} chén.", penalty: 3 },
  { type: "DARE", content: "{P1} phải để {P2} vẽ một hình xăm bằng bút lên tay/cổ hoặc uống {N} chén.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy gọi điện cho mẹ/bố nói 'Con xin lỗi' rồi tắt máy dưới sự chứng kiến của {P2} hoặc uống {N} chén.", penalty: 3 },
  { type: "INTERACTIVE", content: "{P1} hãy nhắm mắt lại và đoán xem {P2} đang chạm vào bộ phận nào trên mặt bạn, đoán sai uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy tự chọn một người phạt uống {N} hớp, người đó chọn {P2} uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy dùng chân viết tên {P2} lên không trung hoặc uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} phải để {P2} kiểm tra lịch sử cuộc gọi gần nhất hoặc uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy làm động tác nũng nịu đòi {P2} mua kẹo cho mình hoặc phạt uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy bế công chúa {P2} trong 10 giây, từ chối hoặc bế không nổi uống {N} chén.", penalty: 3 },
  { type: "DARE", content: "{P1} hát một bài hát rap ngắn dành riêng để dìm hàng {P2} hoặc uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} và {P2} cùng nhảy lò cò 1 vòng quanh phòng hoặc uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} phải rót nước cho {P2} uống, nếu làm đổ ra ngoài {P1} phạt {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy thì thầm một điều hài hước vào tai {P2} làm họ bật cười, nếu {P2} không cười {P1} uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy nhéo tai {P2} một cái thật nhẹ nhàng hoặc cả hai cùng uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy vẽ lại chân dung {P2} trong 30 giây lên giấy/điện thoại, từ chối uống {N} hớp.", penalty: 2 },

  // TRUTH
  { type: "TRUTH", content: "{P1} kể ra 3 tật xấu của {P2} mà bạn biết hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy thì thầm vào tai {P2} một bí mật thầm kín nhất hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} kể ra điều bạn thấy ghét nhất ở {P2} hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy kể lại ấn tượng đầu tiên của mình về {P2} một cách thật thà hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy trả lời thật: Bạn đã từng có ý định tán tỉnh {P2} chưa? Không trả lời uống {N} chén.", penalty: 3 },
  { type: "TRUTH", content: "{P1} hãy tiết lộ một bí mật mà bạn từng giấu {P2}. Không nói uống {N} chén.", penalty: 3 },
  { type: "TRUTH", content: "{P1} nếu phải chọn kết hôn với {P2} hoặc {P3}, bạn sẽ chọn ai? Không chọn uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy cho biết ai là người bạn tin tưởng nhất giữa {P2} và {P3}. Người còn lại phạt uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy cho điểm ngoại hình của {P2} trên thang điểm 10 một cách thật lòng trước mặt họ hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} nếu {P2} bị bắt cóc và đòi tiền chuộc, bạn có sẵn sàng bỏ tiền ra cứu không? Nói thật hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy kể một kỷ niệm đáng nhớ nhất của bạn với {P2} hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy tiết lộ một thói quen xấu xí của {P2} mà bạn tình cờ phát hiện ra hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy thú nhận điều lãng mạn nhất bạn từng tưởng tượng về {P2} hoặc phạt uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy cho biết nếu được đi du lịch cùng {P2} hoặc {P3}, bạn sẽ chọn đi với ai?", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy kể lại lỗi lầm lớn nhất bạn từng làm với {P2} mà họ chưa biết hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} thấy {P2} và {P3} ai có khả năng có người yêu mới sớm hơn? Giải thích lý do hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy tiết lộ biệt danh thầm kín nhất bạn tự đặt cho {P2} là gì hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy trả lời thật lòng: Bạn có từng thấy tức giận vì hành động của {P2} chưa? Không trả lời uống {N} chén.", penalty: 3 },
  { type: "TRUTH", content: "{P1} hãy trả lời: Nếu {P2} mượn bạn 10 triệu đồng, bạn có cho mượn không? Trả lời thật lòng hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy thú thật: Ai trong hai người {P2} và {P3} nói nhiều khiến bạn mệt mỏi hơn?", penalty: 2 },

  // RULE
  { type: "RULE", content: "{P1} và {P2} phải uống chéo chén rượu với nhau ngay lập tức!", penalty: 1 },
  { type: "RULE", content: "{P1} hãy đổi chỗ ngồi với {P2} ngay lập tức, người di chuyển chậm hơn uống {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} hãy nắm tay {P2} cho đến lượt tiếp theo của bạn, buông tay ra trước phạt {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} và {P2} từ giờ không được dùng điện thoại, ai chạm vào trước uống {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} và {P2} từ giờ trở thành 'bạn cùng tiến', mỗi khi {P1} uống thì {P2} phải uống theo và ngược lại.", penalty: 1 },
  { type: "RULE", content: "Quy tắc nhóm: Mỗi khi {P1} nói, {P2} phải vỗ tay. Quên vỗ tay {P2} uống {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} hãy chọn một từ cấm dành cho {P2}. Mỗi khi {P2} nói từ đó phải uống {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} và {P2} phải đổi đồ uống cho nhau cho đến hết vòng chơi này.", penalty: 2 },
  { type: "RULE", content: "{P1} phải lặp lại mọi lời nói của {P2} trong vòng 1 phút, vi phạm uống {N} hớp.", penalty: 2 },
  { type: "RULE", content: "Mỗi khi {P1} uống, {P2} phải làm biểu cảm khóc lóc tiếc nuối, quên làm phạt {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} phải đấm lưng cho {P2} mỗi khi {P2} đến lượt chơi của họ, quên phạt {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} chỉ được thì thầm nói chuyện với {P2} từ giờ đến hết trận nhậu, quên phạt {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} và {P2} không được nhìn trực diện vào nhau. Ai lỡ nhìn trước phạt uống {N} hớp.", penalty: 2 },
  { type: "RULE", content: "Khi {P1} nói chuyện, {P2} phải khoanh tay cúi đầu chào dạ thưa, quên làm {P2} phạt {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} làm động tác gì, {P2} phải làm theo y hệt trong vòng chơi này. Quên làm theo phạt {N} hớp.", penalty: 2 },

  // VOTE
  { type: "VOTE", content: "{P1} và {P2} ai lười biếng hơn? Cả nhóm biểu quyết, ai nhiều phiếu hơn uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} và {P2} ai có nguy cơ ế lâu nhất? Cả nhóm biểu quyết, ai nhiều phiếu hơn uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} và {P2} ai chi tiêu hoang phí hơn? Cả nhóm biểu quyết, người thắng uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} hãy quyết định giữa {P2} và {P3} ai phải uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P2} và {P3} oẳn tù tì, {P1} đoán xem ai thắng. Nếu {P1} đoán sai uống {N} hớp, đoán đúng cả hai người kia uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} và {P2} ai có gu âm nhạc tốt hơn? Cả nhóm biểu quyết, người thua uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} và {P2} ai hay cáu gắt, dỗi hờn hơn? Nhóm vote và người thắng cuộc uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} và {P2} ai hay thả thính linh tinh hơn? Vote và người thắng uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} hãy chọn xem {P2} hay {P3} có nụ cười đẹp hơn. Người thua phạt uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} và {P2} ai có khả năng làm giàu nhanh hơn? Cả nhóm vote, người thắng uống {N} hớp chúc mừng.", penalty: 2 },
  { type: "VOTE", content: "{P1} và {P2} ai có tửu lượng uống bền bỉ hơn? Vote và người bị đánh giá thấp hơn uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} hãy vote xem giữa {P2} và {P3} ai nấu ăn ngon hơn. Người thua phạt {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} và {P2} ai hiền lành dễ bị bắt nạt hơn? Vote và người thắng cuộc uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Biểu quyết xem giữa {P1} và {P2} ai ngủ nướng dậy muộn hơn. Người thắng cuộc uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} hãy bình chọn ai là người điềm tĩnh nhất phòng giữa {P2} và {P3}. Người còn lại phạt {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} và {P2} ai nói nhiều nhất phòng? Vote và người thắng cuộc tự giác uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người khéo ăn khéo nói nhất giữa {P1}, {P2} và {P3}? Cả nhóm biểu quyết, người thắng uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Cả nhóm bình chọn xem giữa {P1} và {P2} ai là người nhát gan hơn. Người thắng cuộc phạt {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "{P1} hãy quyết định xem {P2} hay {P3} phải đứng lên hát 1 bài hoặc phạt {N} chén.", penalty: 3 },
  { type: "VOTE", content: "{P1} và {P2} ai có gu thời trang cá tính hơn? Vote và người thua phạt uống {N} hớp.", penalty: 2 }
];


// ==========================================
// 2. CẶP ĐÔI (COUPLES) PACK (250 UNIQUE CARDS)
// ==========================================

const COUPLES_BASE_CARDS: Omit<DrinkingCard, "id">[] = [
  // DARE (50)
  { type: "DARE", content: "Hôn nhẹ lên trán của đối phương và nói 'Cảm ơn vì đã ở bên anh/em'.", penalty: 2 },
  { type: "DARE", content: "Hôn kiểu Pháp thật say đắm với đối phương trong vòng 10 giây hoặc phạt uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Cõng đối phương đi một vòng quanh phòng và thì thầm lời ngọt ngào.", penalty: 2 },
  { type: "DARE", content: "Mát-xa vai hoặc cổ cho đối phương trong 1 phút.", penalty: 2 },
  { type: "DARE", content: "Mát-xa bàn tay hoặc bàn chân đối phương một cách nhẹ nhàng trong 1 phút.", penalty: 2 },
  { type: "DARE", content: "Nhìn thẳng vào mắt đối phương trong 30 giây không chớp mắt, ai cười trước uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Để đối phương vẽ một hình trái tim nhỏ lên má của bạn bằng son môi hoặc bút dạ.", penalty: 2 },
  { type: "DARE", content: "Thì thầm vào tai đối phương một câu nói quyến rũ/đường mật nhất bạn có thể nghĩ ra.", penalty: 2 },
  { type: "DARE", content: "Ôm đối phương thật chặt từ phía sau trong vòng 30 giây.", penalty: 2 },
  { type: "DARE", content: "Chụp một bức ảnh selfie nhí nhố cùng nhau và cài làm hình nền điện thoại của bạn ngay.", penalty: 2 },
  { type: "DARE", content: "Đút đồ ăn hoặc thức uống cho đối phương bằng miệng hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Hát tặng đối phương 1 đoạn ngắn trong bài hát đối phương thích nhất hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Đóng vai một người lạ đi tán tỉnh đối phương tại quán bar/cà phê trong 30 giây.", penalty: 2 },
  { type: "DARE", content: "Nhấc bổng đối phương lên trong 5 giây, từ chối hoặc không làm được phạt uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Lấy son môi của đối phương và tự đánh son lên môi mình một cách hài hước.", penalty: 2 },
  { type: "DARE", content: "Dùng miệng của bạn lấy một viên đá lạnh từ ly nước và thả vào ly đối phương.", penalty: 2 },
  { type: "DARE", content: "Bịt mắt bạn lại, dùng tay chạm để đoán xem đối phương đang mặc quần áo chất liệu gì.", penalty: 2 },
  { type: "DARE", content: "Để đối phương kiểm tra 3 tin nhắn chat gần nhất trên điện thoại của bạn.", penalty: 2 },
  { type: "DARE", content: "Hôn nhẹ lên mi mắt đối phương và nói lời khen ngợi chân thành nhất.", penalty: 2 },
  { type: "DARE", content: "Ngồi lọt thỏm vào lòng đối phương (hoặc gác chân lên đùi đối phương) cho đến lượt sau.", penalty: 2 },
  { type: "DARE", content: "Dùng mũi chạm vào mũi đối phương (cọ mũi kiểu Eskimo) liên tục trong 15 giây.", penalty: 2 },
  { type: "DARE", content: "Hãy viết 3 chữ cái đại diện cho tên bạn lên lòng bàn tay của đối phương.", penalty: 2 },
  { type: "DARE", content: "Để đối phương cù nách bạn trong 10 giây mà bạn không được cười, cười phạt 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Tạo một biệt danh đáng yêu/hài hước mới cho đối phương và dùng biệt danh đó suốt buổi tối.", penalty: 2 },
  { type: "DARE", content: "Kể lại một lỗi lầm ngốc nghếch bạn từng giấu đối phương và xin lỗi chân thành.", penalty: 2 },
  { type: "DARE", content: "Để đối phương làm kiểu tóc mới cho bạn (cột tóc, tết tóc...) hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Dùng son môi viết từ 'YÊU' lên trán bạn hoặc phạt uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Uống cạn chén rượu của bạn, và đối phương cũng phải uống một nửa lượng đó.", penalty: 2 },
  { type: "DARE", content: "Để đối phương tự tay cởi một món đồ phụ kiện trên người bạn (đồng hồ, kính, nhẫn...).", penalty: 2 },
  { type: "DARE", content: "Thực hiện điệu nhảy chậm lãng mạn cùng đối phương trong 30 giây không cần nhạc.", penalty: 2 },
  { type: "DARE", content: "Bóp má đối phương thật nựng và khen họ dễ thương 3 lần liên tiếp.", penalty: 2 },
  { type: "DARE", content: "Đổi vai: Bạn đóng vai đối phương và đối phương đóng vai bạn trong 1 vòng chơi tiếp theo.", penalty: 2 },
  { type: "DARE", content: "Vuốt tóc đối phương nhẹ nhàng và nói lời thì thầm ngọt ngào nhất.", penalty: 2 },
  { type: "DARE", content: "Bịt mắt đối phương lại và hôn lên 3 điểm bất kỳ trên mặt họ để họ đoán vị trí.", penalty: 2 },
  { type: "DARE", content: "Viết một tin nhắn ngọt ngào đăng công khai lên story cá nhân của bạn hướng về đối phương.", penalty: 3 },
  { type: "DARE", content: "Nói lời tỏ tình với đối phương bằng 3 ngôn ngữ khác nhau hoặc phạt uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Dùng răng để ngậm ly nước uống mà không dùng tay, nhờ đối phương giữ ly giúp.", penalty: 2 },
  { type: "DARE", content: "Thơm nhẹ vào gáy đối phương một cách bất ngờ hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Kể ra một thói quen ngủ của đối phương mà bạn thấy đáng yêu nhất hoặc phạt uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Đặt tay lên tim đối phương và nói lời hứa sẽ luôn lắng nghe họ.", penalty: 2 },
  { type: "DARE", content: "Chải tóc cho đối phương một cách nhẹ nhàng trong 1 phút hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Để đối phương chọn 1 app trên điện thoại của bạn để mở kiểm tra bất kỳ thông tin nào.", penalty: 3 },
  { type: "DARE", content: "Hôn nhẹ lên từng ngón tay của đối phương một cách lãng mạn.", penalty: 2 },
  { type: "DARE", content: "Tự tay pha cho đối phương một cốc nước lọc ấm và đút cho họ uống.", penalty: 2 },
  { type: "DARE", content: "Nhìn sâu vào mắt đối phương và nói 'Cảm ơn vì đã kiên nhẫn với anh/em'.", penalty: 2 },
  { type: "DARE", content: "Đóng vai người hầu hạ, bóc vỏ trái cây/rót nước phục vụ đối phương trong 2 lượt.", penalty: 2 },
  { type: "DARE", content: "Hãy kể lại chi tiết khoảnh khắc bạn cảm thấy đối phương cuốn hút nhất.", penalty: 2 },
  { type: "DARE", content: "Nhắm mắt lại chạm vào mặt đối phương và đoán xem họ đang cười, khóc hay biểu cảm gì.", penalty: 2 },
  { type: "DARE", content: "Thơm lên cằm hoặc cổ của đối phương một cái thật ấm áp.", penalty: 2 },
  { type: "DARE", content: "Hãy cạn ly với đối phương và chúc họ một lời chúc tương lai tốt đẹp nhất.", penalty: 2 },

  // TRUTH (30)
  { type: "TRUTH", content: "Kỷ niệm lần đầu tiên hai người hôn nhau ở đâu và diễn ra như thế nào?", penalty: 2 },
  { type: "TRUTH", content: "Điều đầu tiên thu hút bạn ở đối phương khi mới gặp mặt là gì?", penalty: 2 },
  { type: "TRUTH", content: "Bạn thích nụ hôn ở vị trí nào trên khuôn mặt/cơ thể nhất?", penalty: 2 },
  { type: "TRUTH", content: "Kể lại khoảnh khắc chính xác bạn nhận ra mình đã thực sự yêu đối phương.", penalty: 2 },
  { type: "TRUTH", content: "Bạn từng có bí mật nào chưa dám nói với đối phương không? Khai thật hoặc uống 3 hớp.", penalty: 3 },
  { type: "TRUTH", content: "Đã bao giờ bạn cảm thấy ghen tuông dữ dội nhưng lại giả vờ lạnh lùng chưa?", penalty: 2 },
  { type: "TRUTH", content: "Điều gì ở đối phương khiến bạn cảm thấy yên tâm và an toàn nhất?", penalty: 2 },
  { type: "TRUTH", content: "Thói quen xấu nào của đối phương khiến bạn đôi khi khó chịu nhưng vẫn chấp nhận?", penalty: 2 },
  { type: "TRUTH", content: "Đã bao giờ bạn mơ thấy một giấc mơ kỳ lạ hay lãng mạn về đối phương chưa? Kể lại.", penalty: 2 },
  { type: "TRUTH", content: "Món quà nào đối phương tặng khiến bạn trân trọng và giữ gìn cẩn thận nhất?", penalty: 2 },
  { type: "TRUTH", content: "Điểm gì trên cơ thể của đối phương khiến bạn thích chạm vào nhất?", penalty: 2 },
  { type: "TRUTH", content: "Bạn nghĩ đối phương đã hiểu được bao nhiêu % con người thật của bạn?", penalty: 2 },
  { type: "TRUTH", content: "Nếu được thay đổi một thói quen nhỏ của đối phương, bạn muốn thay đổi điều gì?", penalty: 2 },
  { type: "TRUTH", content: "Khoảnh khắc lãng mạn nhất mà đối phương từng làm cho bạn là gì?", penalty: 2 },
  { type: "TRUTH", content: "Bạn muốn cùng đối phương đi du lịch ở địa điểm nào tiếp theo nhất?", penalty: 2 },
  { type: "TRUTH", content: "Bật mí biệt danh thầm kín bạn tự đặt cho đối phương trong lòng mà chưa từng nói ra.", penalty: 2 },
  { type: "TRUTH", content: "Khi cả hai giận nhau, bạn muốn đối phương dỗ dành bạn bằng cách nào nhất?", penalty: 2 },
  { type: "TRUTH", content: "Bạn có từng lén kiểm tra thông tin mạng xã hội của đối phương trước khi yêu không?", penalty: 2 },
  { type: "TRUTH", content: "Điều gì ở đối phương khiến bạn tự hào nhất khi giới thiệu họ với gia đình?", penalty: 2 },
  { type: "TRUTH", content: "Bạn thích đối phương mặc trang phục phong cách nào hoặc màu sắc nào nhất?", penalty: 2 },
  { type: "TRUTH", content: "Có bài hát hay bộ phim nào luôn khiến bạn nghĩ về đối phương mỗi khi nghe/xem không?", penalty: 2 },
  { type: "TRUTH", content: "Bạn thích cái ôm ấm áp từ phía sau hay một cái ôm chặt đối diện hơn?", penalty: 2 },
  { type: "TRUTH", content: "Điều điên rồ nhất bạn từng nghĩ sẽ làm cùng đối phương trong tương lai là gì?", penalty: 2 },
  { type: "TRUTH", content: "Mùi hương nào trên cơ thể/nước hoa của đối phương làm bạn mê mẩn nhất?", penalty: 2 },
  { type: "TRUTH", content: "Bạn có hay nhớ đối phương vào những lúc bận rộn nhất trong ngày không?", penalty: 2 },
  { type: "TRUTH", content: "Bạn thấy mình và đối phương giống nhau nhất ở điểm nào?", penalty: 2 },
  { type: "TRUTH", content: "Nếu được mô tả tình yêu của bạn bằng 3 từ, đó sẽ là 3 từ gì?", penalty: 1 },
  { type: "TRUTH", content: "Có hành động nhỏ nhặt nào của đối phương làm bạn cảm thấy cực kỳ ấm lòng không?", penalty: 2 },
  { type: "TRUTH", content: "Bạn có tin cả hai là định mệnh dành cho nhau không? Nói thật lòng.", penalty: 1 },
  { type: "TRUTH", content: "Bạn thích nắm tay đi dạo phố hay ngồi cạnh nhau trong quán cà phê yên tĩnh hơn?", penalty: 2 },

  // RULE (20)
  { type: "RULE", content: "LUẬT MỚI: Mỗi khi đối phương uống, bạn cũng phải uống một nửa lượng phạt tương đương.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Hai người phải nắm tay nhau không buông cho đến hết trò chơi. Buông tay phạt 2 hớp.", penalty: 2 },
  { type: "RULE", content: "LUẬT MỚI: Không được gọi tên thật của đối phương, phải gọi là 'Anh yêu/Em yêu' hoặc biệt danh ngọt ngào.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Khi nói chuyện với đối phương, bạn phải nhìn thẳng vào mắt họ. Nhìn đi chỗ khác uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Mỗi khi uống nước, bạn phải xin phép đối phương trước. Quên xin phép phạt uống thêm 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Không được dùng điện thoại di động trừ khi có việc cực kỳ khẩn cấp. Ai dùng phạt 2 hớp.", penalty: 2 },
  { type: "RULE", content: "LUẬT MỚI: Mỗi khi đối phương nói từ cấm (do bạn chọn), đối phương phải phạt 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Bạn phải ngồi sát vào đối phương đến mức không có khoảng trống giữa hai người.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Mỗi khi bạn cười, bạn phải thơm nhẹ lên má đối phương một cái. Quên làm phạt 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Đối phương uống rượu bằng tay nào, bạn phải dùng tay ngược lại để uống theo.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Cả hai chỉ được nói thầm bên tai nhau khi trò chuyện. Ai nói to phạt 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Không được bắt chéo chân khi ngồi cạnh đối phương. Vi phạm phạt 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Mọi đồ uống của bạn đều phải nhờ đối phương rót/chuẩn bị giúp. Tự ý rót phạt 2 hớp.", penalty: 2 },
  { type: "RULE", content: "LUẬT MỚI: Mỗi khi đối phương vuốt tóc hoặc chạm vào mặt bạn, bạn phải nói 'Anh/Em yêu em/anh nhiều'.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Cả hai phải tựa đầu vào vai nhau khi đối phương đang bốc bài.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Không được dùng tay để chạm vào ly nước khi uống, phải nhờ đối phương nâng ly hộ.", penalty: 2 },
  { type: "RULE", content: "LUẬT MỚI: Mỗi khi nói chuyện phải mở đầu bằng từ 'Cục cưng à...' hoặc phạt uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Ai ngắt lời đối phương khi họ đang nói phạt uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Phải khoác vai đối phương trong suốt lượt bốc bài tiếp theo. Bỏ tay ra phạt 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Khi uống phạt, cả hai phải thực hiện cạn ly giao bôi (éo tay nhau) lãng mạn.", penalty: 1 }
];

// COUPLES TEMPLATE CARDS (90 UNIQUE TEMPLATES)
const COUPLES_TEMPLATES: Omit<DrinkingCard, "id">[] = [
  // DARE
  { type: "INTERACTIVE", content: "{P1} hãy thơm nhẹ lên mí mắt của {P2} hoặc phạt uống {N} hớp.", penalty: 2 },
  { type: "INTERACTIVE", content: "{P1} hãy nhìn sâu vào mắt {P2} và nói 3 từ 'Anh yêu em' / 'Em yêu anh' thật chân thành.", penalty: 1 },
  { type: "DARE", content: "{P1} hãy cõng {P2} đi một vòng xung quanh phòng hoặc phạt uống {N} chén.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy bóp vai và mát-xa cổ cho {P2} trong vòng 1 phút.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy dùng son môi của {P2} để vẽ một bông hoa nhỏ lên má mình hoặc uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy dùng bút vẽ một hình trái tim lên lòng bàn tay của {P2} và ký tên mình lên đó.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy ôm chặt {P2} từ phía sau trong vòng 30 giây hoặc uống {N} hớp phạt.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy nắm tay {P2} nâng lên và hôn nhẹ lên mu bàn tay họ một cách quý phái.", penalty: 1 },
  { type: "DARE", content: "{P1} hãy bóc vỏ trái cây hoặc chuẩn bị đồ ăn đút tận miệng cho {P2}.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy chụp ảnh dìm đáng yêu của {P2} ngay lúc này và lưu lại làm hình đại diện danh bạ.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy nhắm mắt lại và đoán xem {P2} đang dùng ngón tay vẽ chữ gì lên lòng bàn tay bạn.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy thì thầm vào tai {P2} một bí mật nhỏ khiến họ phải đỏ mặt hoặc phạt uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy nhấc bổng {P2} lên trong vòng 5 giây, không làm được phạt {N} chén.", penalty: 3 },
  { type: "DARE", content: "{P1} hãy vuốt ve mái tóc của {P2} và khen ngợi kiểu tóc của họ một cách ngọt ngào.", penalty: 1 },
  { type: "DARE", content: "{P1} hãy để {P2} tự tay đổi hình nền điện thoại của bạn thành bức ảnh chụp chung của hai người.", penalty: 3 },
  { type: "DARE", content: "{P1} hãy hát một đoạn điệp khúc ngọt ngào dành tặng riêng cho {P2} hoặc uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy bế công chúa {P2} trong vòng 10 giây hoặc phạt uống {N} chén.", penalty: 3 },
  { type: "DARE", content: "{P1} và {P2} cùng uống chéo chén giao bôi ngay lập tức!", penalty: 1 },
  { type: "DARE", content: "{P1} hãy dùng răng lấy một viên đá lạnh từ cốc và bỏ vào miệng {P2} một cách tinh nghịch.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy đeo kính/đồng hồ/vòng tay của {P2} lên người mình cho đến khi kết thúc trò chơi.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy cù nách {P2} trong 10 giây, nếu {P2} không cười {P1} phạt uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy mát-xa bắp chân hoặc bàn chân cho {P2} trong vòng 1 phút để giúp họ thư giãn.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy bóp nhẹ má của {P2} và nói giọng trẻ con dễ thương cưng nựng họ.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy chải tóc hoặc tạo một kiểu tóc hài hước cho {P2} hoặc phạt uống {N} hớp.", penalty: 2 },
  { type: "DARE", content: "{P1} hãy thơm nhẹ lên gáy của {P2} một cái thật lãng mạn hoặc phạt uống {N} hớp.", penalty: 2 },

  // TRUTH
  { type: "TRUTH", content: "{P1} hãy cho biết ấn tượng đầu tiên khi bạn gặp {P2} là gì? Nói thật hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy trả lời thật lòng: Thói quen đáng yêu nhất của {P2} khiến bạn mỉm cười là gì?", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy cho biết món quà nào {P2} từng tặng làm bạn cảm động nhất?", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy trả lời: Điểm quyến rũ nhất trên cơ thể {P2} mà bạn thích nhất là gì?", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy kể lại lần hẹn hò đầu tiên đáng nhớ nhất giữa bạn và {P2}.", penalty: 2 },
  { type: "TRUTH", content: "{P1} có từng giận dỗi {P2} vì một lý do vô cớ nào chưa? Khai thật hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy trả lời: Khoảnh khắc nào {P2} làm bạn cảm thấy được yêu thương chăm sóc nhiều nhất?", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy kể một thói quen xấu của {P2} mà bạn thấy buồn cười hoặc đáng yêu hơn là đáng ghét.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy thú thật điều lãng mạn nhất bạn muốn cùng {P2} thực hiện trong năm nay.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy trả lời thật lòng: Bạn có từng ghen khi {P2} trò chuyện thân thiết với người khác giới?", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy bật mí một địa điểm bạn muốn cùng {P2} đi du lịch riêng tư nhất.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy kể lại giấc mơ ngọt ngào nhất của bạn liên quan đến {P2}.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy nói ra điều bạn trân trọng nhất ở tính cách của {P2} hoặc uống {N} hớp.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy thú thật: Đã từng có giây phút nào bạn sợ mất {P2} chưa? Không trả lời uống {N} chén.", penalty: 3 },
  { type: "TRUTH", content: "{P1} hãy cho biết hành động nhỏ nhặt nào của {P2} thường làm bạn rung động nhất?", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy thú thật điều bạn lo lắng nhất về mối quan hệ của bạn và {P2} hiện tại.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy nói thật: Mùi hương tự nhiên nào của {P2} làm bạn thích ôm họ nhất?", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy kể lại một lời hứa của {P2} khiến bạn tin tưởng và xúc động nhất.", penalty: 2 },
  { type: "TRUTH", content: "{P1} hãy trả lời: Bạn thích ôm {P2} từ phía sau hay ôm chặt trực diện hơn?", penalty: 2 },
  { type: "TRUTH", content: "{P1} có giữ bức ảnh nào của {P2} làm bảo bối thầm kín trong album điện thoại không?", penalty: 2 },

  // RULE
  { type: "RULE", content: "Mỗi khi {P2} uống phạt, {P1} cũng phải uống theo 1 hớp để chia sẻ hình phạt.", penalty: 1 },
  { type: "RULE", content: "{P1} và {P2} không được dùng tay chạm vào điện thoại di động của mình cho đến hết game.", penalty: 2 },
  { type: "RULE", content: "{P1} phải gọi {P2} là 'Cục cưng' hoặc 'Nhà em' mỗi khi nói chuyện, quên xưng hô phạt {N} hớp.", penalty: 1 },
  { type: "RULE", content: "{P1} phải tựa đầu vào vai {P2} mỗi khi đến lượt {P2} bốc bài. Quên tựa phạt 1 hớp.", penalty: 1 },
  { type: "RULE", content: "{P1} phải đút từng ngụm nước cho {P2} uống khi {P2} khát hoặc bị phạt, không được để {P2} tự cầm ly.", penalty: 2 },
  { type: "RULE", content: "{P1} phải ngồi thật sát và khoác vai {P2} cho đến lượt sau của bạn, bỏ tay ra phạt 1 hớp.", penalty: 1 },
  { type: "RULE", content: "{P1} phải bắt chước điệu bộ hoặc lặp lại câu cuối cùng {P2} nói trong vòng 1 phút.", penalty: 2 },
  { type: "RULE", content: "{P1} và {P2} từ giờ phải nắm tay nhau đan ngón tay vào nhau liên tục. Ai buông ra trước phạt {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} không được nhìn trực diện vào {P2} khi nói chuyện. Lỡ nhìn phạt uống {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} phải làm biểu cảm đáng yêu nũng nịu mỗi khi {P2} uống phạt. Quên làm phạt 1 hớp.", penalty: 1 },
  { type: "RULE", content: "{P1} chỉ được nói chuyện bằng giọng thì thầm ngọt ngào vào tai {P2} từ giờ đến hết trận.", penalty: 2 },
  { type: "RULE", content: "Mỗi khi {P2} cười hở răng, {P1} có quyền phạt {P2} uống 1 hớp nước.", penalty: 1 },
  { type: "RULE", content: "{P1} phải cầm ly nước bằng cả hai tay lễ phép mời {P2} mỗi khi {P2} muốn uống nước.", penalty: 2 },
  { type: "RULE", content: "{P1} không được chạm tay vào cằm hay má của {P2}. Vi phạm phạt uống {N} hớp.", penalty: 2 },
  { type: "RULE", content: "{P1} phải đấm bóp nhẹ nhàng cho {P2} mỗi khi {P2} đang suy nghĩ thử thách. Quên phạt 1 hớp.", penalty: 1 },

  // VOTE (15 intmately focused interactive prompts)
  { type: "VOTE", content: "Ai hay giận dỗi vô cớ hơn giữa {P1} và {P2}? Cả hai cùng biểu quyết chỉ tay, ai nhiều phiếu hơn uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người chi tiêu hoang phí mua quà cáp nhiều hơn giữa {P1} và {P2}? Biểu quyết chỉ tay, người thua uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người hay ngủ nướng dậy muộn hơn giữa {P1} và {P2}? Cùng chỉ tay, người bị chỉ uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai nói lời tỏ tình/làm quen trước trong mối quan hệ này? Cả hai cùng chỉ tay xác nhận, ai thua uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người khéo tay nấu ăn ngon hơn giữa {P1} và {P2}? Cùng biểu quyết, người thua phạt uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai hay ghen tuông linh tinh hơn giữa {P1} và {P2}? Cùng chỉ tay biểu quyết, người thắng uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai hay quên chìa khóa/ví tiền hơn giữa {P1} và {P2}? Cùng chỉ tay biểu quyết, người thắng uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người chủ động dỗ dành làm hòa trước mỗi khi giận nhau giữa {P1} và {P2}? Người thắng uống 1 hớp.", penalty: 1 },
  { type: "VOTE", content: "Ai là người ngủ ngáy hoặc có thói quen xấu khi ngủ đáng yêu hơn giữa {P1} và {P2}? Cùng chỉ tay chọn.", penalty: 2 },
  { type: "VOTE", content: "Ai hay nhắn tin chúc ngủ ngon lãng mạn hơn giữa {P1} và {P2}? Người thắng uống 1 hớp để ăn mừng.", penalty: 1 },
  { type: "VOTE", content: "Ai hay xem phim lãng mạn hơn giữa {P1} và {P2}? Cùng biểu quyết chỉ tay, người thắng uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai có nhiều người theo đuổi hơn trước khi hai người yêu nhau giữa {P1} và {P2}? Người đó uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người dễ khóc nhè khi xem phim buồn hơn giữa {P1} and {P2}? Chỉ tay biểu quyết, người đó uống {N} hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người nhớ kỷ niệm ngày yêu nhau/ngày cưới kỹ càng hơn giữa {P1} và {P2}? Ai quên phạt {N} chén.", penalty: 3 },
  { type: "VOTE", content: "Ai có gu âm nhạc sến sẩm hơn giữa {P1} và {P2}? Nhóm biểu quyết (hoặc hai người tự chỉ tay), người thua uống {N} hớp.", penalty: 2 }
];


// ==========================================
// 3. DECK GENERATION LOGIC
// ==========================================

export const generateDeck = (
  pack: "GROUP" | "COUPLES" | "MIXED"
): DrinkingCard[] => {
  let baseCards: Omit<DrinkingCard, "id">[] = [];
  let templateCards: Omit<DrinkingCard, "id">[] = [];

  if (pack === "GROUP") {
    baseCards = GROUP_BASE_CARDS;
    templateCards = GROUP_TEMPLATES;
  } else if (pack === "COUPLES") {
    baseCards = COUPLES_BASE_CARDS;
    templateCards = COUPLES_TEMPLATES;
  } else {
    // MIXED pack - combine both pools
    baseCards = [...GROUP_BASE_CARDS, ...COUPLES_BASE_CARDS];
    templateCards = [...GROUP_TEMPLATES, ...COUPLES_TEMPLATES];
  }

  const generatedDeck: DrinkingCard[] = [];

  // 1. Add base cards with unique IDs
  baseCards.forEach((card, idx) => {
    generatedDeck.push({
      id: `base-${pack}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...card
    });
  });

  // 2. Add template cards (exactly once) with unique IDs.
  // We keep placeholders in the deck; substitution will happen dynamically on draw time!
  templateCards.forEach((card, idx) => {
    generatedDeck.push({
      id: `template-${pack}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...card
    });
  });

  // 3. Shuffle the deck using Fisher-Yates algorithm
  for (let i = generatedDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [generatedDeck[i], generatedDeck[j]] = [generatedDeck[j], generatedDeck[i]];
  }

  return generatedDeck;
};
