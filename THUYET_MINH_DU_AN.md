# THUYẾT MINH DỰ ÁN: NỀN TẢNG QUẢN LÝ NHÀ TRỌ THÔNG MINH

## 1. MỤC TIÊU DỰ ÁN
Dự án "Quản lý Nhà Trọ Thông Minh" được xây dựng nhằm giải quyết những khó khăn trong khâu vận hành của các chủ nhà trọ hiện đại, đồng thời mang lại trải nghiệm thuê trọ minh bạch, tiện lợi cho người thuê. Hệ thống kết hợp khả năng tự động hóa nghiệp vụ (Automation) và Trí tuệ nhân tạo (AI) để tạo ra một "Trợ lý ảo" thực thụ cho chủ nhà.

Khác với các công cụ ghi chép truyền thống, dự án này được thiết kế theo hướng **Sản phẩm thương mại số (Commercial Product)**, có khả năng mở rộng (Scale) để quản lý hàng loạt chuỗi khu trọ (Multi-buildings) và tích hợp các nguồn doanh thu chéo (Cross-Selling / Ads Revenue).

## 2. CÔNG NGHỆ ÁP DỤNG
- **Frontend**: ReactJS, TailwindCSS (Tạo giao diện hiện đại, Glassmorphism, Responsive chuẩn Mobile).
- **Backend**: Node.js, Express.js (Xử lý API RESTful, Authentication bằng JWT).
- **Database**: MySQL (Aiven Cloud) - Cấu trúc dữ liệu quan hệ chặt chẽ, an toàn.
- **AI Integration**: Tích hợp Google Gemini API vào hệ thống Chatbot xử lý ngôn ngữ tự nhiên (NLP).
- **Hosting / Deployment**: Vercel (dành cho Frontend) và Render (dành cho Backend).

## 3. TÍNH NĂNG NỔI BẬT

### A. Dành Cho Người Thuê (Tenant / Khách truy cập)
1. **Landing Page Chuyên Nghiệp**: Trang chủ giới thiệu hệ thống phòng trọ, hiển thị phòng trống realtime, giao diện bắt mắt tạo sự tin tưởng.
2. **Kênh Tin Tức & Quy Định**: Không chỉ là nơi thuê phòng, hệ thống còn cung cấp một chuyên trang (`/tin-tuc-quy-dinh`) về kinh nghiệm sống, PCCC, hướng dẫn làm thủ tục lưu trú trực tuyến.
3. **AI Chatbot Hỗ Trợ 24/7**: 
   - Chatbot không sử dụng các câu lệnh tĩnh cứng nhắc mà được thiết kế bằng thuật toán Keyword Matching & Template kết hợp Admin Cấu hình.
   - Trả lời chuẩn xác bảng giá, tiện ích, địa chỉ.
   - **Đặc biệt**: Chatbot hỗ trợ thông tin **Đa khu nhà**, báo giá điện nước theo từng đơn vị chuẩn quốc tế (`kWh` đối với điện tích năng, `m³` đối với nước), tránh dùng từ lóng (ký điện, khối nước) để đảm bảo tính pháp lý và chuyên nghiệp.

### B. Dành Cho Chủ Nhà (Admin Dashboard)
1. **Quản lý Đa Khu Nhà (Multi-buildings Management)**: Cấu hình thông tin, giá điện nước, nội quy của nhiều chi nhánh khác nhau ngay trên Settings.
2. **Quản trị Phòng Trọ & Tiền phòng**: Tạo, xóa, theo dõi trạng thái Available/Occupied của từng phòng.
3. **Xuất Hợp Đồng PDF Tự Động**: Tính năng cho phép tạo và tải xuống hợp đồng thuê nhà file PDF tự động dựa trên thông tin người thuê chỉ với 1 click.
4. **Theo dõi Chỉ số Đồng hồ**: Nhập liệu điện nước (kWh, m³). Hệ thống tự xuất hóa đơn tương ứng với giá quy định của từng khu.

## 4. TIỀM NĂNG THƯƠNG MẠI & DOANH THU (BUSINESS MODEL)
Hệ thống không chỉ tiện lợi mà còn tính minh họa được **Luồng doanh thu (Revenue Streams)**, biến sản phẩm từ "đồ án" thành một "Platform Thương Mại":

1. **Doanh thu chính (Core Revenue):** Thu từ phí vận hành cho thuê phần mềm đối với từng chủ trọ, hoặc lợi nhuận trực tiếp từ việc kinh doanh tiền phòng.
2. **Doanh thu từ Quảng cáo (Ads Revenue):** 
   - Hệ thống được thiết kế chèn mô-đun **AdsBanner** (Quảng cáo liên kết) tại trang chủ và Sidebar trang Tin tức.
   - Chủ nhà có thể thu tiền tài trợ từ các dịch vụ liên quan đến tệp khách hàng sinh viên như: Lắp đặt Internet (Viettel, FPT), Dịch vụ dọn/chuyển trọ trọn gói, Giặt sấy tự động, v.v.
   - Đây là mô hình Cross-selling (Bán chéo) thông minh, giúp tối ưu hóa lợi nhuận trên mỗi User sử dụng hệ thống.

## 5. TỔNG KẾT
Sản phẩm là kết quả quá trình nghiên cứu, ứng dụng stack công nghệ hiện đại hóa từ Database, Backend Logic cho tới Giao diện UI/UX. Với thiết kế đáp ứng đầy đủ tính năng thực tiễn, có mở rộng quản lý đa cơ sở và định hình cả tiềm năng sinh lời qua Quảng cáo, đây hoàn toàn có thể trở thành một Startup quy mô vừa và nhỏ.
