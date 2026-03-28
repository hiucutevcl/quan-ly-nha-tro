const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    str = str.replace(/ + /g," ");
    str = str.trim();
    return str;
}

const handleChatRequest = async (req, res) => {
    try {
        const { messages } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            console.error('Thiếu GEMINI_API_KEY trong file .env');
            return res.status(500).json({ reply: 'Chưa cấu hình GEMINI_API_KEY trên server.' });
        }

        const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
        if (!lastMessage || !lastMessage.text) {
            return res.status(400).json({ reply: 'Tin nhắn trống hoặc không hợp lệ.' });
        }

        let userTextRaw = lastMessage.text.trim();
        let userText = removeVietnameseTones(userTextRaw.toLowerCase());

        let info = {};
        let availableRooms = [];
        let allRooms = [];

        try {
            const [settings] = await db.query('SELECT setting_key, setting_value FROM AppSettings');
            settings.forEach(s => info[s.setting_key] = s.setting_value);
        } catch (dbErr) {
            console.log("Không thể lấy AppSettings:", dbErr.message);
        }

        try {
            const [avRooms] = await db.query('SELECT room_name, price, amenities FROM Rooms WHERE status = "Available"');
            availableRooms = avRooms;
            const [alRooms] = await db.query('SELECT room_name, price, status, amenities FROM Rooms');
            allRooms = alRooms;
        } catch (dbErr) {
            console.log("Không thể lấy Rooms:", dbErr.message);
        }

        const phone = info.phone || 'chủ trọ';
        const address = info.address || 'Đang cập nhật';
        const name = info.nha_tro_name || 'Nhà Trọ';
        const elecPrice = Number(info.elec_price || 3500).toLocaleString();
        const waterPrice = Number(info.water_price || 15000).toLocaleString();
        const buildingsInfo = info.buildings_info ? `\nKhu nhà: ${info.buildings_info}` : '';

        const templateData = {
            name, phone, address, elecPrice, waterPrice, buildingsInfo,
            count: availableRooms.length,
            roomList: availableRooms.map(r => `• Phòng ${r.room_name}: ${Number(r.price).toLocaleString()}đ/tháng${r.amenities ? ` — ${r.amenities}` : ''}`).join('\n') || 'Đang cập nhật',
            prices: allRooms.map(r => `• Phòng ${r.room_name}: ${Number(r.price).toLocaleString()}đ (${r.status === 'Available' ? 'Trống' : 'Đã thuê'})`).join('\n') || 'Đang cập nhật'
        };

        const formatTemplate = (template, data) => {
            if (!template) return '';
            return template.replace(/{(\w+)}/g, (m, key) => data[key] !== undefined ? data[key] : m).replace(/\\n/g, '\n');
        };

        // Xem có khớp Quick Replies (câu hỏi nhanh cấu hình từ Admin) không
        let customQuickReplies = [];
        if (info.custom_quick_replies) {
            try {
                customQuickReplies = JSON.parse(info.custom_quick_replies);
                if (!Array.isArray(customQuickReplies)) customQuickReplies = [];
            } catch (e) {}
        }

        const matchedQR = customQuickReplies.find(qr => 
            removeVietnameseTones(qr.title.trim().toLowerCase()) === userText || 
            qr.title.trim().toLowerCase() === userTextRaw.toLowerCase()
        );

        if (matchedQR) {
            return res.json({ reply: formatTemplate(matchedQR.answer, templateData) });
        }

        // --- Gọi Gemini API ---
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const rules = info.note || 'Không có';
        
        const systemInstruction = `Bạn là trợ lý ảo thân thiện của nhà trọ ${name}. Nhiệm vụ của bạn là tư vấn cho khách thuê phòng trọ một cách ngắn gọn, thân thiện và tự nhiên. KHÔNG dùng markdown phức tạp. Trả lời trực tiếp như chat với bạn bè. Dùng emoji vừa đủ.\nThông tin nhà trọ:\n- Tên: ${name}\n- Liên hệ: ${phone}\n- Địa chỉ: ${address} ${buildingsInfo}\n- Điện: ${elecPrice}đ/kWh, Nước: ${waterPrice}đ/khối\n- Nội quy: ${rules}\n- Danh sách phòng & giá:\n${templateData.prices}\n- Danh sách phòng TRỐNG:\n${templateData.roomList}\n\nChỉ nói những gì khách hỏi. Cung cấp giá hoặc số phòng trống chính xác theo danh sách.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: systemInstruction,
        });

        // Parse history for Gemini (loại bỏ lỗi định dạng user/model)
        let rawHistory = messages.slice(0, -1);
        if (rawHistory.length > 0 && rawHistory[0].sender === 'bot') {
            rawHistory.shift(); // Xóa lời chào mặc định ban đầu của bot
        }

        let historyData = [];
        let lastRole = null;
        for (const m of rawHistory) {
            const currentRole = m.sender === 'bot' ? 'model' : 'user';
            if (currentRole !== lastRole) {
                historyData.push({ role: currentRole, parts: [{ text: m.text }] });
                lastRole = currentRole;
            } else {
                if (historyData.length > 0) {
                    historyData[historyData.length - 1].parts[0].text += '\\n' + m.text;
                }
            }
        }
        
        // Lịch sử phải kết thúc bằng 'model' để chờ user input tiếp theo
        if (historyData.length > 0 && historyData[historyData.length - 1].role === 'user') {
            historyData.pop();
        }

        const chatSession = model.startChat({ history: historyData });
        const result = await chatSession.sendMessage(userTextRaw);
        
        // Bắt lỗi an toàn hoặc model không trả về text
        let reply = "Xin lỗi, câu hỏi này mình chưa hiểu rõ. Bạn thử hỏi cách khác nhé!";
        if (result && result.response) {
            reply = result.response.text();
        }

        return res.json({ reply });

    } catch (error) {
        console.error('Chatbot AI Error:', error);
        res.status(500).json({ reply: 'Xin lỗi, hệ thống AI đang quá tải. Bạn hãy gọi hoặc Zalo cho chủ trọ qua số điện thoại nhé!' });
    }
};

module.exports = { handleChatRequest };
