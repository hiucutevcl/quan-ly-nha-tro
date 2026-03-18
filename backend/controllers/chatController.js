const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const handleChatRequest = async (req, res) => {
    try {
        const { messages } = req.body;
        
        // Kiểm tra xem chủ trọ đã cấu hình API key chưa
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ reply: 'Trợ lý AI đang chờ bảo trì do chưa được cấu hình API Key. Chủ trọ vui lòng thiết lập `GEMINI_API_KEY`.' });
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Dữ liệu tin nhắn không hợp lệ' });
        }

        // Lấy thông tin chung của nhà trọ từ database
        const [settings] = await db.query('SELECT setting_key, setting_value FROM AppSettings');
        let info = {};
        settings.forEach(s => info[s.setting_key] = s.setting_value);
        
        // Lấy danh sách phòng trống hiện tại để báo lại cho khách
        const [availableRooms] = await db.query('SELECT room_name, price, amenities FROM Rooms WHERE status = "Available"');
        
        const roomContext = availableRooms.length > 0 
            ? `Đang có ${availableRooms.length} phòng trống: ` + availableRooms.map(r => `Phòng ${r.room_name} (Giá ${Number(r.price).toLocaleString()}đ, Nội thất/Tiện ích: ${r.amenities})`).join('; ')
            : 'Hiện tại hệ thống đã hết phòng trống. Bạn có thể khuyên khách thi thoảng quay lại sau.';

        // Lời nhắc hệ thống (Prompt) để định hình nhân cách và kiến thức của AI
        const systemInstruction = `
Bạn là "Trợ lý ảo" chuyên tư vấn phòng trọ cho khách hàng của hệ thống "Phòng trọ thông minh" do Phạm Minh Hiếu phát triển.
Nhiệm vụ của bạn là tư vấn nhiệt tình, thân thiện, ngắn gọn và chính xác, dựa trên thông tin thực tế của nhà trọ dưới đây:
- Tên hệ thống: ${info.nha_tro_name || 'Phòng trọ hệ thống'}
- Địa chỉ: ${info.address || 'Đang cập nhật'}
- Số điện thoại chủ trọ/quản lý: ${info.phone || 'Đang cập nhật'}
- Tình trạng phòng hiện tại: ${roomContext}
- Nội quy cơ bản: ${info.rules || 'Vui lòng giữ gìn an ninh trật tự và vệ sinh chung'}

Quy tắc bắt buộc:
1. Bạn TUYỆT ĐỐI không được bịa đặt tên phòng, giá tiền hay các dịch vụ không có trong thông tin được cấp ở trên.
2. Nếu khách hỏi thông tin mà bạn không biết hoặc chưa rõ, hãy xin lỗi và hướng dẫn khách gọi điện thoại trực tiếp cho chủ trọ qua số điện thoại ${info.phone || 'quản lý'}.
3. Xưng hô một cách chuyên nghiệp và gần gũi: Xưng là "Mình/Trợ lý", gọi khách là "Bạn/Anh/Chị".
4. Câu trả lời phải NGẮN GỌN (tối đa 4-5 câu), xuống dòng các ý mạch lạc. Không được dài dòng vòng vo trừ khi khách yêu cầu tư vấn chi tiết.
        `;

        // Khởi tạo Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
            systemInstruction 
        });
        
        // Bóc tách tin nhắn cuối cùng (user vừa chat) và lịch sử chat trước đó (cho vào context)
        const userPrompt = messages[messages.length - 1].text;
        
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Bắt đầu hội thoại
        const chat = model.startChat({ history });

        // Gửi tin nhắn mới nhất
        const result = await chat.sendMessage(userPrompt);
        const aiResponse = result.response.text();

        res.json({ reply: aiResponse });

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ reply: 'Rất xin lỗi, bộ não AI hiện đang gặp chút sự cố kết nối. Quý khách vui lòng để lại lời nhắn sau hoặc liên hệ trực tiếp chủ trọ nhé!' });
    }
};

module.exports = { handleChatRequest };
