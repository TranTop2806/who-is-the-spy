# Trò chơi "Ai Là Gián Điệp?" (Undercover Party Game)

Một ứng dụng web chạy cực kỳ mượt mà, tối ưu hiển thị trên các thiết bị di động (mobile-responsive) để chơi trực tiếp tại các buổi party bằng cơ chế **Pass & Play** (chuyền tay chơi trên cùng 1 điện thoại).

---

## 🚀 Tính Năng Nổi Bật

- 📱 **Giao diện di động cao cấp**: Thiết kế theo phong cách Dark Mode kết hợp hiệu ứng Glassmorphism (kính mờ), phản hồi cảm ứng mượt mà.
- 🔊 **Âm thanh tự tổng hợp**: Sử dụng Web Audio API để phát ra các âm thanh lật thẻ (card flip), đếm ngược (countdown tick), báo hết giờ (buzzer), chiến thắng (success fanfare) và thất bại (fail music) mà không tốn dung lượng tải file âm thanh ngoài.
- 🎴 **Lật thẻ 3D bí mật**: Hiệu ứng lật thẻ 3D giúp bảo mật từ khóa tối đa khi phát máy cho từng người.
- 🇻🇳 **Bộ từ khóa tiếng Việt đa dạng**: Chứa hơn 40 cặp từ khóa chọn lọc thuộc các chủ đề như *Ẩm thực*, *Công nghệ*, *Mối quan hệ*, *Giải trí & Thể thao*, *Đời sống*...
- ✏️ **Tự tạo từ khóa**: Người chơi có thể tự nhập cặp từ khóa của riêng mình để tạo bất ngờ cho bạn bè.
- 🧠 **Cơ chế bầu chọn Mr. White**: Tích hợp phần đoán từ khóa của Mr. White và cho phép cả nhóm bỏ phiếu quyết định kết quả.

---

## 🎮 Tóm Tắt Luật Chơi

1. **Dân Thường (Civilian)**: Nhận từ khóa chính (ví dụ: *Phở*). Cố gắng mô tả từ khóa để đồng đội nhận ra nhau nhưng không để Gián Điệp biết được.
2. **Gián Điệp (Spy)**: Nhận từ khóa phụ gần giống (ví dụ: *Bún chả*). Cố gắng mô tả khéo léo để ẩn mình và tìm ra từ khóa của Dân Thường.
3. **Mr. White**: Không nhận được từ khóa nào. Phải nghe mô tả của người trước để đoán từ khóa và bịa ra câu mô tả hợp lý.
4. **Mô tả & Bầu chọn**: Mỗi người mô tả 1 từ/cụm từ ngắn theo lượt. Sau đó thảo luận và biểu quyết loại 1 người chơi.
5. **Điều kiện thắng**:
   - Dân Thường thắng khi loại bỏ hết Gián Điệp & Mr. White.
   - Gián Điệp/Mr. White thắng khi số lượng đồng minh còn sống bằng hoặc nhiều hơn số Dân Thường.
   - Mr. White bị loại nhưng đoán trúng từ khóa Dân Thường sẽ giành chiến thắng tuyệt đối.

---

## 🛠️ Hướng Dẫn Chạy Dưới Local

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
2. Chạy ứng dụng ở chế độ phát triển:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt ở địa chỉ hiển thị trên terminal (thường là `http://localhost:5173`).

---

## ⚡ Hướng Dẫn Deploy Lên Vercel (Miễn Phí)

Dự án sử dụng Vite và đã được cấu hình sẵn file `vercel.json` để deploy tự động không cần thiết lập thêm.

### Cách 1: Deploy bằng GitHub (Khuyên Dùng)
1. Đẩy mã nguồn của bạn lên một kho lưu trữ GitHub (ví dụ: `ai-la-gian-diep`).
2. Truy cập vào [Vercel Dashboard](https://vercel.com/dashboard) và đăng nhập bằng tài khoản GitHub của bạn.
3. Nhấp vào **"Add New"** -> **"Project"**.
4. Chọn kho lưu trữ `ai-la-gian-diep` vừa tải lên và nhấp **"Import"**.
5. Nhấp **"Deploy"**. Vercel sẽ tự động phát hiện cấu hình Vite và deploy ứng dụng của bạn trong chưa đầy 1 phút.

### Cách 2: Deploy bằng Vercel CLI
Nếu bạn đã cài đặt Vercel CLI trên máy tính:
1. Mở terminal tại thư mục dự án và chạy lệnh:
   ```bash
   npm install -g vercel
   ```
2. Thực hiện đăng nhập (nếu chưa):
   ```bash
   vercel login
   ```
3. Deploy ứng dụng trực tiếp bằng lệnh:
   ```bash
   vercel
   ```
4. Làm theo hướng dẫn trên terminal và bạn sẽ nhận được link chơi game trực tuyến ngay lập tức!
