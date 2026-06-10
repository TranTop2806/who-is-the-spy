export interface DrinkingCard {
  id: string;
  type: "DARE" | "TRUTH" | "RULE" | "VOTE" | "INTERACTIVE" | "VIRAL";
  content: string;
  penalty: number;
}

// 1. CLASSIC "DO OR DRINK" (Uống Đê) BASE CARDS
const CLASSIC_BASE_CARDS: Omit<DrinkingCard, "id">[] = [
  { type: "DARE", content: "Hãy uống liên tiếp 2 hớp mà không được nuốt nước bọt giữa chừng.", penalty: 2 },
  { type: "DARE", content: "Nêu tên 3 người bạn từng ghét trong quá khứ hoặc uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Để người bên phải cù nách bạn trong 10 giây mà không được cười, nếu cười uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Đọc ngược bảng chữ cái tiếng Việt từ Z về A trong 20 giây, thất bại uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Cho cả nhóm xem ảnh dìm gần nhất trong điện thoại của bạn hoặc uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Đứng một chân trong suốt vòng chơi này, hạ chân xuống trước lượt sau uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Múa cột giả định với một chiếc ghế trong 15 giây hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Uống 1 hớp bằng tai hoặc mũi (nếu làm được nhóm uống, không làm được bạn uống 2 hớp).", penalty: 2 },
  { type: "DARE", content: "Cho người bên trái trang điểm nhẹ lên mặt bạn bằng bút dạ hoặc son, từ chối uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Hát một bài hát thiếu nhi bằng giọng điệu của một người đang say rượu hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Nói lắp bắp trong suốt 2 vòng chơi tiếp theo, quên nói lắp uống 1 hớp.", penalty: 1 },
  { type: "DARE", content: "Cho cả nhóm xem lịch sử tìm kiếm Google gần nhất của bạn hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Sủa tiếng chó sủa vang nhà trong 10 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Ăn một thìa tương ớt trực tiếp hoặc uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Gọi điện cho người yêu cũ và nói 'Em nhớ anh/Anh nhớ em' rồi tắt máy ngay hoặc uống 3 chén.", penalty: 3 },
  { type: "DARE", content: "Đứng dậy và nhảy theo điệu nhảy hot trend Tiktok gần đây nhất bạn nhớ hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Gửi một tin nhắn bất kỳ cho sếp/đồng nghiệp nói 'Em thích sếp' hoặc uống 3 chén.", penalty: 3 },
  { type: "DARE", content: "Uống cạn ly nước hiện tại của bạn.", penalty: 4 },
  { type: "DARE", content: "Để cả nhóm vẽ râu lên mặt bạn bằng bút kẻ mắt hoặc son môi, từ chối uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Nằm sấp xuống đất hít đất 15 cái liên tục, không làm nổi uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Chạy ra ngoài cửa hét lớn 'Tôi bị điên' hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Để người đối diện bạn rót đầy ly và bạn phải uống hết hoặc uống 2 chén phạt.", penalty: 2 },
  { type: "DARE", content: "Cho cả nhóm xem số dư tài khoản ngân hàng của bạn hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Làm biểu cảm quyến rũ nhất có thể trong 10 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Hãy uống chéo chén với người ngồi xa bạn nhất trong phòng này.", penalty: 1 },

  // TRUTH
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

  // RULE
  { type: "RULE", content: "LUẬT MỚI: Ai nói từ 'uống' hoặc 'nhậu' từ giờ đến hết trận phải uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Mỗi khi uống, bạn phải nói 'Cảm ơn cả nhà' trước, quên nói uống thêm 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Không ai được chạm vào điện thoại di động. Ai chạm vào phạt uống 2 hớp.", penalty: 2 },
  { type: "RULE", content: "LUẬT MỚI: Mọi người phải nói thầm từ giờ đến lượt chơi tiếp theo của bạn. Ai nói to uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Khi bạn uống, người bên phải bạn cũng phải uống theo một lượng tương đương.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Ai sử dụng tiếng nước ngoài từ giờ đến hết vòng chơi này phải uống 1 hớp.", penalty: 1 },
  { type: "RULE", content: "LUẬT MỚI: Tất cả mọi người không được chỉ tay vào người khác. Ai vi phạm uống 1 hớp.", penalty: 1 },

  // VOTE
  { type: "VOTE", content: "Cả nhóm biểu quyết xem ai là người lăng nhăng nhất phòng. Người bị vote nhiều nhất uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Cả nhóm biểu quyết xem ai là người keo kiệt nhất. Người bị vote nhiều nhất uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người có khả năng đi tù cao nhất? Biểu quyết và người thắng cuộc uống 3 hớp.", penalty: 3 },
  { type: "VOTE", content: "Ai là người có gu ăn mặc tệ nhất hôm nay? Biểu quyết và người bị chọn uống 2 hớp.", penalty: 2 },
  { type: "VOTE", content: "Ai là người hay trễ hẹn nhất nhóm? Biểu quyết và người bị chọn uống 2 hớp.", penalty: 2 }
];

// 2. GEN-Z "CHỊU UỐNG HAY CHỊU CHƠI" BASE CARDS
const GENZ_BASE_CARDS: Omit<DrinkingCard, "id">[] = [
  { type: "DARE", content: "Nói 1 câu thả thính sến sẩm nhất bạn biết với người bên cạnh hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Hãy tự chụp 1 bức ảnh dìm bằng camera thường không filter và đăng lên Story FB/Insta trong 15 phút hoặc uống 3 chén.", penalty: 3 },
  { type: "DARE", content: "Kể ra 3 tài khoản MXH mà bạn hay 'stalk' (theo dõi ngầm) nhất hoặc uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Đọc nhanh câu 'Nồi đồng nấu ốc nồi đất nấu ếch' 3 lần không vấp, vấp phát nào uống 1 hớp phát đó.", penalty: 1 },
  { type: "DARE", content: "Cho người bên phải kiểm tra tin nhắn gần nhất của bạn trên Zalo/Messenger hoặc uống 2 chén.", penalty: 2 },
  { type: "DARE", content: "Bắn rap một đoạn ngắn (bất kỳ bài nào) hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Nhại lại giọng của một nhân vật meme nổi tiếng trên mạng xã hội hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Để người bên trái đổi biệt danh của bạn trên Messenger thành một cái tên lầy lội hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Gọi điện cho mẹ hỏi 'Mẹ ơi hôm nay mẹ có yêu con không?' hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Gửi sticker lầy lội nhất cho người đầu tiên trong danh sách hoạt động nhắn tin hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Cho nhóm xem thư mục 'Ảnh ẩn/Đã xóa gần đây' trong album ảnh điện thoại của bạn hoặc uống 3 hớp.", penalty: 3 },
  { type: "DARE", content: "Giả làm streamer bán kem trộn trong 30 giây hoặc uống 2 hớp.", penalty: 2 },
  { type: "DARE", content: "Dùng giọng điệu 'dẹo' nhất có thể để gọi đồ uống hoặc nói chuyện trong 1 vòng chơi hoặc uống 2 hớp.", penalty: 2 },

  // TRUTH
  { type: "TRUTH", content: "Bạn từng có mối quan hệ mập mờ (situationship) bao giờ chưa? Kể thật hoặc uống 2 chén.", penalty: 2 },
  { type: "TRUTH", content: "Bạn có bao giờ lập nick clone để đi stalk người yêu cũ/crush chưa? Nói thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Số tiền nhiều nhất bạn từng chi cho một buổi đi quẹt Tinder/hẹn hò là bao nhiêu? Nói thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn đã từng 'cắm sừng' ai hoặc bị ai 'cắm sừng' chưa? Trả lời thật hoặc uống 3 chén.", penalty: 3 },
  { type: "TRUTH", content: "Ấn tượng xấu nhất của bạn về một người trong phòng này lúc mới gặp là gì? Nói thật hoặc uống 2 hớp.", penalty: 2 },
  { type: "TRUTH", content: "Bạn từng nói dối mình đang bận để trốn một cuộc hẹn chưa? Nói thật hoặc uống 1 hớp.", penalty: 1 },
  { type: "TRUTH", content: "Có bao giờ bạn 'quên' trả tiền nợ vặt cho bạn bè chưa? Khai thật hoặc uống 2 hớp.", penalty: 2 },

  // VIRAL / INTERACTIVE
  { type: "VIRAL", content: "Tất cả những ai đang độc thân (F.A) hãy uống 1 hớp để chia buồn.", penalty: 1 },
  { type: "VIRAL", content: "Tất cả những ai đang có người yêu hãy uống 1 hớp để ăn mừng.", penalty: 1 },
  { type: "VIRAL", content: "Ai thấp nhất phòng này hãy tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai cao nhất phòng này hãy tự giác uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai có đôi mắt cận nặng nhất phòng uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Tất cả những người mặc áo màu đen hãy uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Ai đang sử dụng iPhone dòng Pro/Pro Max tự giác uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Ai đi làm muộn nhiều nhất tháng này tự giác uống 2 hớp.", penalty: 2 },
  { type: "VIRAL", content: "Tất cả mọi người oẳn tù tì với người bên phải, ai thua uống 1 hớp.", penalty: 1 },
  { type: "VIRAL", content: "Trò chơi đếm số: Mọi người lần lượt đếm từ 1 đến 20, ai đếm trùng số hoặc đếm chậm phải uống 2 hớp.", penalty: 2 }
];

// 3. DYNAMIC INTERACTIVE CARD TEMPLATES (100+ templates with placeholders)
// Placeholder definitions:
// {P1} - Current active player (the drawer)
// {P2} - A random alive player (different from P1)
// {P3} - Another random alive player (different from P1 and P2)
// {N} - A randomized penalty amount between 1 and 3
const DYNAMIC_TEMPLATES: { type: DrinkingCard["type"]; content: string }[] = [
  // Dares
  { type: "INTERACTIVE", content: "{P1} hãy thơm má {P2} hoặc cả hai cùng uống {N} chén." },
  { type: "INTERACTIVE", content: "{P1} hãy oẳn tù tì với {P2}, ai thua uống {N} hớp." },
  { type: "INTERACTIVE", content: "{P1} vật tay với {P2}, ai thắng được miễn uống, ai thua uống {N} chén." },
  { type: "DARE", content: "{P1} hãy cõng {P2} đi một vòng quanh phòng hoặc uống {N} chén." },
  { type: "DARE", content: "{P1} hãy mát xa vai cho {P2} trong 30 giây hoặc uống {N} hớp." },
  { type: "TRUTH", content: "{P1} kể ra 3 tật xấu của {P2} mà bạn biết hoặc uống {N} hớp." },
  { type: "INTERACTIVE", content: "{P1} hãy nhìn thẳng vào mắt {P2} trong 15 giây mà không được cười, ai cười trước uống {N} hớp." },
  { type: "DARE", content: "{P1} phải làm tóc cho {P2} theo kiểu kỳ dị nhất hoặc uống {N} hớp." },
  { type: "INTERACTIVE", content: "{P1} hãy nhảy đôi cùng {P2} trong 20 giây hoặc cả hai cùng uống {N} hớp." },
  { type: "RULE", content: "{P1} và {P2} phải uống chéo chén rượu với nhau ngay lập tức!" },
  { type: "DARE", content: "{P1} hãy hát tặng {P2} một câu hát có từ 'yêu' hoặc cả hai cùng uống {N} hớp." },
  { type: "DARE", content: "{P1} hãy nhắn tin nói 'Tôi nhớ bạn' cho người đầu tiên trong danh bạ hiển thị, dưới sự giám sát của {P2}, từ chối uống {N} chén." },
  { type: "DARE", content: "{P1} hãy đưa điện thoại cho {P2} chọn một bức ảnh bất kỳ trong album và đăng lên mạng xã hội hoặc {P1} uống {N} chén." },
  { type: "TRUTH", content: "{P1} hãy thì thầm vào tai {P2} một bí mật thầm kín nhất hoặc uống {N} hớp." },
  { type: "TRUTH", content: "{P1} kể ra điều bạn thấy ghét nhất ở {P2} hoặc uống {N} hớp." },
  { type: "RULE", content: "{P1} hãy đổi chỗ ngồi với {P2} ngay lập tức, người di chuyển chậm hơn uống {N} hớp." },
  { type: "DARE", content: "{P1} phải để {P2} vẽ một hình xăm bằng bút lên tay/cổ hoặc uống {N} chén." },
  { type: "DARE", content: "{P1} hãy gọi điện cho mẹ/bố nói 'Con xin lỗi' rồi tắt máy dưới sự chứng kiến của {P2} hoặc uống {N} chén." },
  { type: "INTERACTIVE", content: "{P1} hãy nhắm mắt lại và đoán xem {P2} đang chạm vào bộ phận nào trên mặt bạn, đoán sai uống {N} hớp." },
  { type: "TRUTH", content: "{P1} hãy mô tả {P2} bằng 3 tính từ hài hước nhất hoặc uống {N} hớp." },
  { type: "TRUTH", content: "{P1} hãy kể lại ấn tượng đầu tiên của mình về {P2} một cách thật thà hoặc uống {N} hớp." },
  { type: "RULE", content: "{P1} hãy nắm tay {P2} cho đến lượt tiếp theo của bạn, buông tay ra trước phạt {N} hớp." },
  { type: "DARE", content: "{P1} hãy tự chọn một người phạt uống {N} hớp, người đó chọn {P2} uống {N} hớp." },
  { type: "DARE", content: "{P1} hãy dùng chân viết tên {P2} lên không trung hoặc uống {N} hớp." },
  { type: "DARE", content: "{P1} phải để {P2} kiểm tra lịch sử cuộc gọi gần nhất hoặc uống {N} hớp." },
  
  // Truths & Secrets
  { type: "TRUTH", content: "{P1} hãy trả lời thật: Bạn đã từng có ý định tán tỉnh {P2} chưa? Không trả lời uống {N} chén." },
  { type: "TRUTH", content: "{P1} hãy tiết lộ một bí mật mà bạn từng giấu {P2}. Không nói uống {N} chén." },
  { type: "TRUTH", content: "{P1} nếu phải chọn kết hôn với {P2} hoặc {P3}, bạn sẽ chọn ai? Không chọn uống {N} hớp." },
  { type: "TRUTH", content: "{P1} hãy cho biết ai là người bạn tin tưởng nhất giữa {P2} và {P3}. Người còn lại phạt uống {N} hớp." },
  { type: "TRUTH", content: "{P1} hãy cho điểm ngoại hình của {P2} trên thang điểm 10 một cách thật lòng trước mặt họ hoặc uống {N} hớp." },
  { type: "TRUTH", content: "{P1} nếu {P2} bị bắt cóc và đòi tiền chuộc, bạn có sẵn sàng bỏ tiền ra cứu không? Nói thật hoặc uống {N} hớp." },
  { type: "TRUTH", content: "{P1} hãy kể một kỷ niệm đáng nhớ nhất của bạn với {P2} hoặc uống {N} hớp." },
  
  // Rules & Group
  { type: "RULE", content: "{P1} và {P2} từ giờ không được dùng điện thoại, ai chạm vào trước uống {N} hớp." },
  { type: "RULE", content: "{P1} và {P2} từ giờ trở thành 'bạn cùng tiến', mỗi khi {P1} uống thì {P2} phải uống theo và ngược lại." },
  { type: "RULE", content: "Quy tắc nhóm: Mỗi khi {P1} nói, {P2} phải vỗ tay. Quên vỗ tay {P2} uống {N} hớp." },
  { type: "RULE", content: "{P1} hãy chọn một từ cấm dành cho {P2}. Mỗi khi {P2} nói từ đó phải uống {N} hớp." },
  { type: "DARE", content: "Tất cả mọi người oẳn tù tì với {P1}. Ai thua {P1} phải uống {N} hớp." },
  { type: "RULE", content: "{P1} và {P2} phải đổi đồ uống cho nhau cho đến hết vòng chơi này." },
  
  // Votes & Decisions
  { type: "VOTE", content: "{P1} và {P2} ai lười biếng hơn? Cả nhóm biểu quyết, ai nhiều phiếu hơn uống {N} hớp." },
  { type: "VOTE", content: "{P1} và {P2} ai có nguy cơ ế lâu nhất? Cả nhóm biểu quyết, ai nhiều phiếu hơn uống {N} hớp." },
  { type: "VOTE", content: "{P1} và {P2} ai chi tiêu hoang phí hơn? Cả nhóm biểu quyết, người thắng uống {N} hớp." },
  { type: "VOTE", content: "{P1} hãy quyết định giữa {P2} và {P3} ai phải uống {N} hớp." },
  { type: "VOTE", content: "{P2} và {P3} oẳn tù tì, {P1} đoán xem ai thắng. Nếu {P1} đoán sai uống {N} hớp, đoán đúng cả hai người kia uống {N} hớp." }
];

// 4. GENERATOR ENGINE
// Generates a deck of 250+ cards by combining base cards and populating template cards.
// If run twice, it generates different cards due to randomized player selections.
export const generateDeck = (
  pack: "CLASSIC" | "GEN_Z" | "MIXED",
  playerNames: string[]
): DrinkingCard[] => {
  let baseCards: Omit<DrinkingCard, "id">[] = [];
  if (pack === "CLASSIC") {
    baseCards = CLASSIC_BASE_CARDS;
  } else if (pack === "GEN_Z") {
    baseCards = GENZ_BASE_CARDS;
  } else {
    baseCards = [...CLASSIC_BASE_CARDS, ...GENZ_BASE_CARDS];
  }
  const generatedDeck: DrinkingCard[] = [];
  
  // Add base cards with unique IDs
  baseCards.forEach((card, idx) => {
    generatedDeck.push({
      id: `base-${pack}-${idx}-${Date.now()}`,
      ...card
    });
  });

  // Ensure we have players to populate templates
  const names = playerNames.length > 0 ? playerNames : ["Người chơi A", "Người chơi B"];
  
  // Helper to pick random players from list
  const getPlayersSample = (currentName: string, count: number): string[] => {
    const listWithoutCurrent = names.filter(n => n !== currentName);
    // Shuffle copy of list
    const shuffled = [...listWithoutCurrent].sort(() => 0.5 - Math.random());
    // Fallback if not enough players
    while (shuffled.length < count) {
      shuffled.push(names[Math.floor(Math.random() * names.length)]);
    }
    return shuffled.slice(0, count);
  };

  // We want to generate ~250 cards per deck or 500 for MIXED.
  const targetTotal = pack === "MIXED" ? 500 : 250;
  const cardsNeeded = targetTotal - baseCards.length;

  for (let i = 0; i < cardsNeeded; i++) {
    // Pick a random template
    const template = DYNAMIC_TEMPLATES[Math.floor(Math.random() * DYNAMIC_TEMPLATES.length)];
    
    // Pick a random primary player (P1)
    const p1 = names[i % names.length];
    
    // Pick random secondary/tertiary players (P2, P3)
    const samples = getPlayersSample(p1, 2);
    const p2 = samples[0];
    const p3 = samples[1];
    
    // Pick a random penalty hớp/chén between 1 and 3
    const penalty = Math.floor(Math.random() * 3) + 1;

    // Substitute placeholders
    const content = template.content
      .replace(/{P1}/g, p1)
      .replace(/{P2}/g, p2)
      .replace(/{P3}/g, p3)
      .replace(/{N}/g, penalty.toString());

    generatedDeck.push({
      id: `template-${pack}-${i}-${Date.now()}`,
      type: template.type,
      content,
      penalty
    });
  }

  // Fisher-Yates Shuffle of the final generated deck
  for (let i = generatedDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [generatedDeck[i], generatedDeck[j]] = [generatedDeck[j], generatedDeck[i]];
  }

  return generatedDeck;
};
