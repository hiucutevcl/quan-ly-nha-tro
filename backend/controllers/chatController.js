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
        
        let apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Thiếu GEMINI_API_KEY');
            return res.status(500).json({ reply: 'Hệ thống chưa được cấp quyền AI (Chưa cấu hình GEMINI_API_KEY trên Render).' });
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
            const [avRooms] = await db.query('SELECT room_name, price, amenities, floor, area, building_name FROM Rooms WHERE status = "Available"');
            availableRooms = avRooms;
            const [alRooms] = await db.query('SELECT room_name, price, status, amenities, floor, area, building_name FROM Rooms');
            allRooms = alRooms;
        } catch (dbErr) {
            console.log("Không thể lấy Rooms:", dbErr.message);
        }

        let servicesInfo = '';
        try {
            const [srvs] = await db.query('SELECT service_name, price, unit FROM Services');
            servicesInfo = srvs.map(s => `${s.service_name}: ${Number(s.price).toLocaleString()}đ/${s.unit}`).join(', ');
        } catch (e) { console.log(e); }

        const phone = info.phone || 'chủ trọ';
        const address = info.address || 'Đang cập nhật';
        const name = info.nha_tro_name || 'Nhà Trọ';
        
        let branchDetails = '';
        if (info.buildings_info) {
             try {
                const bArray = JSON.parse(info.buildings_info);
                branchDetails = bArray.map(b => `- Khu ${b.name}: ${b.address} (Điện: ${b.elec_price}đ, Nước: ${b.water_price}đ)`).join('\n');
             } catch(e) {}
        }
        const buildingsInfoText = branchDetails ? `\nCác Cơ Sở:\n${branchDetails}` : '';

        const templateData = {
            name, phone, address,
            count: availableRooms.length,
            roomList: availableRooms.map(r => `• Phòng ${r.room_name} (${r.building_name||'Cơ sở 1'}) - Tầng ${r.floor||'?'}, ${r.area||'?'}m2 : ${Number(r.price).toLocaleString()}đ/tháng — Tiện ích: ${r.amenities||'Cơ bản'}`).join('\n') || 'Hiện không có phòng trống',
            prices: allRooms.map(r => `• Phòng ${r.room_name} (${r.building_name||'Cơ sở 1'}): ${Number(r.price).toLocaleString()}đ - Tình trạng: ${r.status === 'Available' ? 'Trống' : 'Đã thuê'}`).join('\n') || 'Đang cập nhật'
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
        const genAI = new GoogleGenerativeAI(apiKey);
        const rules = info.note || 'Không có';
        
        const systemInstruction = `Bạn là máy chủ AI tư vấn tổng đài của nhà trọ ${name}. Nhiệm vụ của bạn là tư vấn cho khách thuê phòng một cách chuyên nghiệp, tự nhiên, và giải đáp mọi thắc mắc dựa trên Database. KHÔNG dùng markdown phức tạp. Dùng emoji vừa đủ.\n
DỮ LIỆU DATABASE HIỆN TẠI:
- Tên hệ thống: ${name}
- Liên hệ Chủ nhà/Quản lý: ${phone}
- Địa chỉ trụ sở: ${address} \n${buildingsInfoText}
- Phí dịch vụ cố định: ${servicesInfo}
- Nội quy nhà trọ: ${rules}
- DANH SÁCH CHI TIẾT CÁC PHÒNG (Dùng để tra cứu giá, cấu trúc của mọi phòng):
${templateData.prices}
- DANH SÁCH CÁC PHÒNG CÒN TRỐNG NGAY LÚC NÀY (Báo cho khách nếu họ muốn thuê):
${templateData.roomList}

LƯU Ý QUAN TRỌNG:
1. Mọi câu hỏi về vị trí, chi nhánh, diện tích, giá tiền, tầng đều phải lấy chính xác từ "DỮ LIỆU DATABASE HIỆN TẠI".
2. Nếu khách hỏi thông tin phòng không có trong bảng trên, nói không tìm thấy dữ liệu.
3. Luôn luôn mời khách liên hệ Zalo số điện thoại nếu cần đặt cọc hoặc xem phòng trực tiếp.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
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
                    historyData[historyData.length - 1].parts[0].text += '\n' + m.text;
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
        res.status(500).json({ reply: 'Hệ thống AI đang bảo trì. Vui lòng liên hệ trực tiếp chủ trọ!' });
    }
};

module.exports = { handleChatRequest };
