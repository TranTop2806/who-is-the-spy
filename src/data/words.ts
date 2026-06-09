export interface WordPair {
  civilian: string;
  spy: string;
  category: string;
}

export const WORD_DATABASE: WordPair[] = [
  // Ẩm thực
  { civilian: "Phở", spy: "Bún chả", category: "Ẩm thực" },
  { civilian: "Trà sữa", spy: "Trà đào", category: "Ẩm thực" },
  { civilian: "Bánh mì", spy: "Hamburger", category: "Ẩm thực" },
  { civilian: "Lẩu Thái", spy: "Lẩu nướng", category: "Ẩm thực" },
  { civilian: "Coca Cola", spy: "Pepsi", category: "Ẩm thực" },
  { civilian: "Nước mắm", spy: "Xì dầu", category: "Ẩm thực" },
  { civilian: "Bánh chưng", spy: "Bánh giầy", category: "Ẩm thực" },
  { civilian: "Sầu riêng", spy: "Mít", category: "Ẩm thực" },
  { civilian: "Cà phê sữa", spy: "Bạc xỉu", category: "Ẩm thực" },
  { civilian: "Mì tôm", spy: "Phở ăn liền", category: "Ẩm thực" },

  // Công nghệ & MXH
  { civilian: "Zalo", spy: "Viber", category: "Công nghệ & MXH" },
  { civilian: "Facebook", spy: "TikTok", category: "Công nghệ & MXH" },
  { civilian: "iPhone", spy: "Samsung", category: "Công nghệ & MXH" },
  { civilian: "Google", spy: "ChatGPT", category: "Công nghệ & MXH" },
  { civilian: "Laptop", spy: "iPad", category: "Công nghệ & MXH" },
  { civilian: "Messenger", spy: "Telegram", category: "Công nghệ & MXH" },
  { civilian: "Email", spy: "Thư tay", category: "Công nghệ & MXH" },

  // Mối quan hệ
  { civilian: "Người yêu cũ", spy: "Người yêu mới", category: "Mối quan hệ" },
  { civilian: "Vợ", spy: "Mẹ chồng", category: "Mối quan hệ" },
  { civilian: "Bố", spy: "Mẹ", category: "Mối quan hệ" },
  { civilian: "Sếp", spy: "Đồng nghiệp", category: "Mối quan hệ" },
  { civilian: "Thầy giáo", spy: "Học sinh", category: "Mối quan hệ" },
  { civilian: "Hàng xóm", spy: "Bạn thân", category: "Mối quan hệ" },

  // Giải trí & Thể thao
  { civilian: "Bóng đá", spy: "Bóng chuyền", category: "Giải trí & Thể thao" },
  { civilian: "Liên Quân", spy: "Liên Minh Huyền Thoại", category: "Giải trí & Thể thao" },
  { civilian: "Bóng rổ", spy: "Cầu lông", category: "Giải trí & Thể thao" },
  { civilian: "Rạp chiếu phim", spy: "Netflix", category: "Giải trí & Thể thao" },
  { civilian: "Nhạc Pop", spy: "Nhạc Rock", category: "Giải trí & Thể thao" },
  { civilian: "Sách", spy: "Truyện tranh", category: "Giải trí & Thể thao" },
  { civilian: "Đi phượt", spy: "Nghỉ dưỡng", category: "Giải trí & Thể thao" },

  // Đời sống & Tự nhiên
  { civilian: "Xe máy", spy: "Xe đạp", category: "Đời sống" },
  { civilian: "Chó", spy: "Mèo", category: "Đời sống" },
  { civilian: "Con hổ", spy: "Con sư tử", category: "Đời sống" },
  { civilian: "Mưa", spy: "Bão", category: "Đời sống" },
  { civilian: "Mặt trời", spy: "Mặt trăng", category: "Đời sống" },
  { civilian: "Mùa đông", spy: "Mùa hè", category: "Đời sống" },
  { civilian: "Hà Nội", spy: "TP. Hồ Chí Minh", category: "Đời sống" },
  { civilian: "Đà Lạt", spy: "Sa Pa", category: "Đời sống" },
  { civilian: "Đồng hồ", spy: "Vòng tay", category: "Đời sống" },
  { civilian: "Kính cận", spy: "Kính râm", category: "Đời sống" },
  { civilian: "Son môi", spy: "Phấn nền", category: "Đời sống" },
  { civilian: "Biển", spy: "Núi", category: "Đời sống" },
  { civilian: "Vàng", spy: "Bạc", category: "Đời sống" },
  { civilian: "Đại học", spy: "Cấp 3", category: "Đời sống" }
];

export const CATEGORIES = [
  "Tất cả",
  "Ẩm thực",
  "Công nghệ & MXH",
  "Mối quan hệ",
  "Giải trí & Thể thao",
  "Đời sống",
  "Tự nhập từ khóa" // Custom mode
];
