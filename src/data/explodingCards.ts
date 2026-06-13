export type ExplodingCardType =
  | "KITTEN"
  | "DEFUSE"
  | "ATTACK"
  | "SKIP"
  | "FAVOR"
  | "SHUFFLE"
  | "SEE_FUTURE"
  | "NOPE"
  | "CAT_TACO"
  | "CAT_POTATO"
  | "CAT_BEARD"
  | "CAT_RAINBOW";

export interface ExplodingCard {
  id: string;
  type: ExplodingCardType;
  name: string;
  description: string;
  illustration: string; // Funny comic caption similar to official cards
  color: string; // Hex or CSS color variable for rendering card headers
  icon: string; // Emoji character or lucide icon reference
}

export const EXPLODING_CARDS: Record<ExplodingCardType, Omit<ExplodingCard, "id">> = {
  KITTEN: {
    type: "KITTEN",
    name: "Mèo Nổ 💣",
    description: "Bùm! Bạn bị loại trừ ngay lập tức nếu không có Tháo Gỡ.",
    illustration: "Vô tình giẫm chân lên nút kích hoạt bom nguyên tử.",
    color: "#f43f5e", // Rose 500
    icon: "💣",
  },
  DEFUSE: {
    type: "DEFUSE",
    name: "Tháo Gỡ 🛠️",
    description: "Tháo ngòi Mèo Nổ. Đặt lại Mèo Nổ vào vị trí bất kỳ trong bộ bài.",
    illustration: "Chiếu tia đèn Laser đỏ đánh lạc hướng mèo khỏi ngòi nổ.",
    color: "#10b981", // Emerald 500
    icon: "🛠️",
  },
  ATTACK: {
    type: "ATTACK",
    name: "Tấn Công ⚔️",
    description: "Kết thúc lượt không cần rút bài, buộc người tiếp theo chơi 2 lượt.",
    illustration: "Bắn tên lửa bầy mèo phóng gai lưng tẩm ớt siêu cay.",
    color: "#f97316", // Orange 500
    icon: "⚔️",
  },
  SKIP: {
    type: "SKIP",
    name: "Qua Lượt 🏃‍♂️",
    description: "Kết thúc lượt chơi của bạn mà không cần rút bài.",
    illustration: "Mặc đồ cải trang chú thỏ nhảy khinh khí cầu chạy trốn.",
    color: "#3b82f6", // Blue 500
    icon: "🏃‍♂️",
  },
  FAVOR: {
    type: "FAVOR",
    name: "Ủng Hộ 🤝",
    description: "Chọn một người chơi khác, buộc họ phải đưa cho bạn 1 lá bài tùy ý.",
    illustration: "Dâng tặng đối thủ búi lông mèo ẩm ướt và đờ đẫn để xin bài.",
    color: "#8b5cf6", // Purple 500
    icon: "🤝",
  },
  SHUFFLE: {
    type: "SHUFFLE",
    name: "Xáo Bài 🌀",
    description: "Xáo trộn ngẫu nhiên chồng bài rút.",
    illustration: "Xoay tít mù trên robot hút bụi Roomba làm đảo lộn thời không.",
    color: "#06b6d4", // Cyan 500
    icon: "🌀",
  },
  SEE_FUTURE: {
    type: "SEE_FUTURE",
    name: "Xem Trước 👁️",
    description: "Xem bí mật 3 lá bài trên cùng của chồng bài rút.",
    illustration: "Nhòm trộm tương lai qua lỗ tai của chú mèo tiên tri cổ đại.",
    color: "#eab308", // Yellow 500
    icon: "👁️",
  },
  NOPE: {
    type: "NOPE",
    name: "Nope! 🛑",
    description: "Chặn hành động người khác. Đánh bất cứ lúc nào (kể cả ngoài lượt).",
    illustration: "Mèo Ninja cự tuyệt đòn đánh bằng chiếc đĩa ăn trống trơn.",
    color: "#ef4444", // Red 500
    icon: "🛑",
  },
  CAT_TACO: {
    type: "CAT_TACO",
    name: "Mèo Taco 🌮",
    description: "Đánh cặp (2 lá giống nhau) để cướp ngẫu nhiên 1 lá của người khác.",
    illustration: "Bánh kẹp Taco mèo giòn tan trôi lơ lửng ngoài vũ trụ.",
    color: "#71717a", // Zinc 500
    icon: "🌮",
  },
  CAT_POTATO: {
    type: "CAT_POTATO",
    name: "Mèo Khoai Tây 🥔",
    description: "Đánh cặp (2 lá giống nhau) để cướp ngẫu nhiên 1 lá của người khác.",
    illustration: "Mèo khoai tây ú nu mọc lông tơ nhiều đến mức ngứa ngáy.",
    color: "#71717a",
    icon: "🥔",
  },
  CAT_BEARD: {
    type: "CAT_BEARD",
    name: "Mèo Râu Rậm 🧔",
    description: "Đánh cặp (2 lá giống nhau) để cướp ngẫu nhiên 1 lá của người khác.",
    illustration: "Mèo hải tặc mang bộ râu quai nón rậm rạp trông rất giang hồ.",
    color: "#71717a",
    icon: "🧔",
  },
  CAT_RAINBOW: {
    type: "CAT_RAINBOW",
    name: "Mèo Cầu Vồng 🌈",
    description: "Đánh cặp (2 lá giống nhau) để cướp ngẫu nhiên 1 lá của người khác.",
    illustration: "Mèo cầu vồng bay lượn nôn ra dải màu ma thuật lấp lánh.",
    color: "#71717a",
    icon: "🌈",
  },
};

// Shuffles an array of strings in place
export const shuffleDeck = (deck: string[]): string[] => {
  const res = [...deck];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
};

// Generate initial deck and deal cards to players
export const initializeGameDeck = (playerIds: string[]): {
  playerHands: Record<string, string[]>;
  drawPile: string[];
} => {
  const numPlayers = playerIds.length;

  // 1. Create standard card pool (excluding Kitten and Defuse)
  const actionPool: string[] = [];
  
  // Add action cards to the pool
  for (let i = 0; i < 4; i++) actionPool.push("ATTACK");
  for (let i = 0; i < 4; i++) actionPool.push("SKIP");
  for (let i = 0; i < 4; i++) actionPool.push("FAVOR");
  for (let i = 0; i < 4; i++) actionPool.push("SHUFFLE");
  for (let i = 0; i < 5; i++) actionPool.push("SEE_FUTURE");
  for (let i = 0; i < 5; i++) actionPool.push("NOPE");

  // Add cat cards
  for (let i = 0; i < 4; i++) actionPool.push("CAT_TACO");
  for (let i = 0; i < 4; i++) actionPool.push("CAT_POTATO");
  for (let i = 0; i < 4; i++) actionPool.push("CAT_BEARD");
  for (let i = 0; i < 4; i++) actionPool.push("CAT_RAINBOW");

  // Shuffle action cards
  let shuffledActions = shuffleDeck(actionPool);

  const playerHands: Record<string, string[]> = {};
  
  // Deal 4 random action cards + 1 Defuse to each player
  playerIds.forEach((id) => {
    const hand: string[] = ["DEFUSE"];
    for (let i = 0; i < 4; i++) {
      if (shuffledActions.length > 0) {
        hand.push(shuffledActions.pop()!);
      }
    }
    playerHands[id] = hand;
  });

  // Remaining actions
  const remainingActions = [...shuffledActions];

  // Defuses: 6 total in the game. N distributed to players. The rest go back to the deck.
  // Except for high player counts, usually we have 2 remaining Defuse cards or so.
  // Let's put remaining Defuses back. The standard rules: (6 - N) Defuses go back.
  const defuseCount = Math.max(0, 6 - numPlayers);
  for (let i = 0; i < defuseCount; i++) {
    remainingActions.push("DEFUSE");
  }

  // Shuffle draw pile first
  let drawPile = shuffleDeck(remainingActions);

  // Insert N-1 Exploding Kittens
  const kittensCount = numPlayers - 1;
  for (let i = 0; i < kittensCount; i++) {
    drawPile.push("KITTEN");
  }

  // Final shuffle of the draw pile containing Kittens
  drawPile = shuffleDeck(drawPile);

  return {
    playerHands,
    drawPile,
  };
};
