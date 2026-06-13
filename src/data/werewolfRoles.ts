export type WerewolfRoleType = "VILLAGER" | "WEREWOLF" | "SEER" | "BODYGUARD" | "WITCH" | "HUNTER" | "CUPID";

export interface WerewolfRole {
  type: WerewolfRoleType;
  name: string;
  emoji: string;
  side: "VILLAGER" | "WEREWOLF" | "NEUTRAL";
  description: string;
  nightInstruction: string;
}

export const WEREWOLF_ROLES: Record<WerewolfRoleType, WerewolfRole> = {
  VILLAGER: {
    type: "VILLAGER",
    name: "Dân Làng",
    emoji: "🧑‍🌾",
    side: "VILLAGER",
    description: "Không có chức năng đặc biệt. Tìm kiếm và treo cổ ma sói vào ban ngày.",
    nightInstruction: "Dân làng ngủ ngon lành..."
  },
  WEREWOLF: {
    type: "WEREWOLF",
    name: "Ma Sói",
    emoji: "🐺",
    side: "WEREWOLF",
    description: "Thức giấc mỗi đêm để cắn chết 1 người dân.",
    nightInstruction: "Ma sói thức giấc! Thảo luận chọn nạn nhân muốn tiêu diệt."
  },
  SEER: {
    type: "SEER",
    name: "Tiên Tri",
    emoji: "🔮",
    side: "VILLAGER",
    description: "Mỗi đêm có thể soi vai trò của 1 người chơi (Ma sói hay Dân thường).",
    nightInstruction: "Tiên tri thức giấc! Chọn 1 người chơi để soi xem có phải là Ma sói hay không."
  },
  BODYGUARD: {
    type: "BODYGUARD",
    name: "Bảo Vệ",
    emoji: "🛡️",
    side: "VILLAGER",
    description: "Mỗi đêm có thể bảo vệ 1 người chơi khỏi ma sói (không được bảo vệ trùng 1 người 2 lượt liên tiếp).",
    nightInstruction: "Bảo vệ thức giấc! Chọn 1 người chơi bạn muốn bảo vệ đêm nay."
  },
  WITCH: {
    type: "WITCH",
    name: "Phù Thủy",
    emoji: "🧪",
    side: "VILLAGER",
    description: "Có 2 bình thuốc: 1 bình cứu mạng (hồi sinh người bị cắn) và 1 bình độc (tiêu diệt 1 người). Mỗi bình chỉ dùng 1 lần/game.",
    nightInstruction: "Phù thủy thức giấc! Xem ai đã bị cắn và chọn cứu họ hoặc dùng độc tiêu diệt người khác."
  },
  HUNTER: {
    type: "HUNTER",
    name: "Thợ Săn",
    emoji: "🏹",
    side: "VILLAGER",
    description: "Nếu bị chết (bất kể đêm hay ngày), có quyền bắn chết ngay lập tức 1 người khác theo ý muốn.",
    nightInstruction: "Thợ săn ngủ yên..."
  },
  CUPID: {
    type: "CUPID",
    name: "Thần Tình Yêu",
    emoji: "💘",
    side: "VILLAGER",
    description: "Đêm đầu tiên sẽ ghép đôi 2 người yêu nhau. Nếu 1 người chết, người kia sẽ chết theo vì đau lòng.",
    nightInstruction: "Thần tình yêu thức giấc! Chọn 2 người chơi để kết duyên đôi lứa (chỉ diễn ra đêm đầu tiên)."
  }
};
