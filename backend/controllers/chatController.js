const db = require('../config/db');

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
        // quickReplyIndex: số thứ tự của quick reply (0-4), được gửi khi bấm nút quick reply
        const { messages, quickReplyIndex } = req.body;

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || !lastMessage.text) {
            return res.status(400).json({ reply: 'Tin nhắn trống hoặc không hợp lệ.' });
        }
        
        let userText = lastMessage.text.toLowerCase().trim();
        userText = removeVietnameseTones(userText);

        let info = {};
        let availableRooms = [];
        let allRooms = [];

        try {
            const [settings] = await db.query('SELECT setting_key, setting_value FROM AppSettings');
            settings.forEach(s => info[s.setting_key] = s.setting_value);
        } catch (dbErr) {
            console.log("Không thể lấy AppSettings, dùng mặc định:", dbErr.message);
        }

        try {
            const [avRooms] = await db.query(
                'SELECT room_name, price, amenities FROM Rooms WHERE status = "Available"'
            );
            availableRooms = avRooms;

            const [alRooms] = await db.query(
                'SELECT room_name, price, status, amenities FROM Rooms'
            );
            allRooms = alRooms;
        } catch (dbErr) {
            console.log("Không thể lấy Rooms, dùng mặc định:", dbErr.message);
        }

        const phone = info.phone || 'chủ trọ';
        const address = info.address || 'Đang cập nhật';
        const name = info.nha_tro_name || 'Nhà Trọ';
        const elecPrice = Number(info.elec_price || 3500).toLocaleString();
        const waterPrice = Number(info.water_price || 15000).toLocaleString();
        const buildingsInfo = info.buildings_info ? `\n\n🏘️ **Danh sách các khu nhà & Giá điện nước:**\n${info.buildings_info}\n` : '';

        // ---- Bộ nhận dạng từ khóa ----
        const rawKeywords = {
            greet: ['chào', 'hello', 'hi', 'xin chào', 'alo', 'hey', 'bạn ơi'],
            available: ['phòng trống', 'còn phòng', 'có phòng', 'còn trống', 'phòng nào', 'đặt phòng', 'thuê phòng', 'phòng nào trống', 'xem phòng'],
            price: ['giá', 'bao nhiêu', 'giá thuê', 'giá phòng', 'phí', 'tiền thuê', 'chi phí', 'mắc không', 'rẻ không'],
            address: ['địa chỉ', 'ở đâu', 'chỗ nào', 'đường nào', 'khu vực', 'vị trí', 'gần đâu'],
            amenities: ['tiện nghi', 'tiện ích', 'nội thất', 'có gì', 'trang bị', 'phòng có', 'điều hòa', 'máy lạnh', 'wifi', 'tủ lạnh', 'máy giặt', 'ban công'],
            utilities: ['điện', 'nước', 'tiền điện', 'tiền nước', 'giá điện', 'giá nước', 'điện nước', 'bao gồm'],
            contact: ['liên hệ', 'số điện thoại', 'gọi', 'điện thoại', 'số phone', 'zalo', 'gặp chủ', 'chủ trọ', 'liên lạc'],
            rules: ['nội quy', 'quy định', 'quy tắc', 'được làm', 'không được', 'cấm', 'giờ giấc', 'vào ra', 'nuôi thú'],
            payment: ['thanh toán', 'trả tiền', 'đóng tiền', 'chuyển khoản', 'ngân hàng', 'tài khoản', 'bank'],
        };

        const keywords = {};
        for (const intent in rawKeywords) {
            keywords[intent] = rawKeywords[intent].map(k => removeVietnameseTones(k.toLowerCase()));
        }

        const match = (keys) => keys.some(k => userText.includes(k));

        const formatTemplate = (template, data) => {
            if (!template) return '';
            return template.replace(/{(\w+)}/g, (m, key) => data[key] !== undefined ? data[key] : m).replace(/\\n/g, '\n');
        };

        const roomList = availableRooms.map(r =>
            `• Phòng **${r.room_name}**: ${Number(r.price).toLocaleString()}đ/tháng${r.amenities ? ` — ${r.amenities}` : ''}`
        ).join('\n');

        const prices = allRooms.map(r =>
            `• Phòng **${r.room_name}**: ${Number(r.price).toLocaleString()}đ/tháng (${r.status === 'Available' ? '✅ Còn trống' : '🔴 Đã có người'})`
        ).join('\n');

        const defaultTemplates = {
            chat_available_rooms: `Hiện tại **{name}** đang có **{count} phòng trống** 🏠:\\n\\n{roomList}\\n\\nBạn muốn đặt lịch xem phòng, liên hệ chủ trọ qua số **{phone}** nhé!`,
            chat_price: `💰 Bảng giá phòng tại **{name}**:\\n\\n{prices}\\n\\nChưa bao gồm điện & nước. Liên hệ **{phone}** để biết thêm chi tiết!`,
            chat_address: `📍 **Địa chỉ:** {address}{buildingsInfo}\\n\\nBạn có thể liên hệ chủ trọ qua số **{phone}** để được hướng dẫn đường đi chi tiết nhé!`,
            chat_utilities: `⚡ Giá điện mặc định: **{elecPrice}đ/kWh**\\n💧 Giá nước mặc định: **{waterPrice}đ/m³**{buildingsInfo}\\n\\nĐây là giá thu theo chỉ số thực tế hàng tháng (chuẩn kWh, m³). Nếu cần thêm thông tin, liên hệ **{phone}** nhé!`,
            chat_contact: `📞 Để liên hệ chủ trọ **{name}**:\\n\\n• Số điện thoại/Zalo: **{phone}**\\n• Địa chỉ chính: **{address}**{buildingsInfo}\\n\\nBạn có thể nhắn tin Zalo hoặc gọi trực tiếp, chủ trọ sẽ phản hồi sớm nhất có thể nhé!`
        };

        const templateData = {
            name, phone, address, elecPrice, waterPrice, buildingsInfo,
            count: availableRooms.length,
            roomList: roomList || 'Đang cập nhật',
            prices: prices || 'Đang cập nhật'
        };

        // Map từ index của quick reply sang intent (theo thứ tự admin settings)
        // 0=Phòng trống, 1=Giá phòng, 2=Địa chỉ, 3=Liên hệ, 4=Điện nước
        const quickReplyIntentMap = ['available', 'price', 'address', 'contact', 'utilities'];

        let reply = '';

        // Nếu client gửi quickReplyIndex hợp lệ → dùng template từ admin trực tiếp
        if (typeof quickReplyIndex === 'number' && quickReplyIndex >= 0 && quickReplyIndex < quickReplyIntentMap.length) {
            const intent = quickReplyIntentMap[quickReplyIndex];

            if (intent === 'available') {
                // Luôn ưu tiên template admin nếu đã cấu hình
                if (info.chat_available_rooms) {
                    reply = formatTemplate(info.chat_available_rooms, templateData);
                } else if (availableRooms.length === 0) {
                    reply = `Hiện tại **${name}** chưa có phòng trống ạ. 😔\nBạn để lại số điện thoại hoặc liên hệ trực tiếp qua **${phone}** để được thông báo khi có phòng nhé!`;
                } else {
                    reply = formatTemplate(defaultTemplates.chat_available_rooms, templateData);
                }
            } else if (intent === 'price') {
                // Luôn ưu tiên template admin nếu đã cấu hình
                if (info.chat_price) {
                    reply = formatTemplate(info.chat_price, templateData);
                } else if (allRooms.length === 0) {
                    reply = `Bạn vui lòng liên hệ chủ trọ qua số **${phone}** để được báo giá nhé!`;
                } else {
                    reply = formatTemplate(defaultTemplates.chat_price, templateData);
                }
            } else if (intent === 'address') {
                const tpl = info.chat_address || defaultTemplates.chat_address;
                reply = formatTemplate(tpl, templateData);
            } else if (intent === 'contact') {
                const tpl = info.chat_contact || defaultTemplates.chat_contact;
                reply = formatTemplate(tpl, templateData);
            } else if (intent === 'utilities') {
                const tpl = info.chat_utilities || defaultTemplates.chat_utilities;
                reply = formatTemplate(tpl, templateData);
            }

        // Nếu là tin nhắn gõ tay → dùng keyword matching
        } else if (match(keywords.greet)) {
            reply = `Chào bạn! 👋 Mình là trợ lý của **${name}**.\nBạn có thể hỏi mình về:\n- 🏠 Phòng trống hiện có\n- 💰 Giá thuê & tiện nghi\n- 📍 Địa chỉ nhà trọ\n- ⚡ Giá điện, nước\n- 📞 Liên hệ chủ trọ\n\nBạn cần hỏi gì ạ?`;

        } else if (match(keywords.available)) {
            // Luôn ưu tiên template admin nếu đã cấu hình
            if (info.chat_available_rooms) {
                reply = formatTemplate(info.chat_available_rooms, templateData);
            } else if (availableRooms.length === 0) {
                reply = `Hiện tại **${name}** chưa có phòng trống ạ. 😔\nBạn để lại số điện thoại hoặc liên hệ trực tiếp qua **${phone}** để được thông báo khi có phòng nhé!`;
            } else {
                reply = formatTemplate(defaultTemplates.chat_available_rooms, templateData);
            }

        } else if (match(keywords.price)) {
            // Luôn ưu tiên template admin nếu đã cấu hình
            if (info.chat_price) {
                reply = formatTemplate(info.chat_price, templateData);
            } else if (allRooms.length === 0) {
                reply = `Bạn vui lòng liên hệ chủ trọ qua số **${phone}** để được báo giá nhé!`;
            } else {
                reply = formatTemplate(defaultTemplates.chat_price, templateData);
            }

        } else if (match(keywords.address)) {
            const tpl = info.chat_address || defaultTemplates.chat_address;
            reply = formatTemplate(tpl, templateData);

        } else if (match(keywords.amenities)) {
            if (availableRooms.length === 0) {
                reply = `Hiện chưa có phòng trống. Bạn liên hệ **${phone}** để hỏi về tiện nghi các phòng nhé!`;
            } else {
                const amenityList = availableRooms
                    .filter(r => r.amenities)
                    .map(r => `• Phòng **${r.room_name}**: ${r.amenities}`)
                    .join('\n') || '• Đang cập nhật thông tin tiện nghi';
                reply = `🛋️ Tiện nghi các phòng trống:\n\n${amenityList}\n\nBạn muốn xem trực tiếp, gọi **${phone}** đặt lịch nhé!`;
            }

        } else if (match(keywords.utilities)) {
            const tpl = info.chat_utilities || defaultTemplates.chat_utilities;
            reply = formatTemplate(tpl, templateData);

        } else if (match(keywords.contact)) {
            const tpl = info.chat_contact || defaultTemplates.chat_contact;
            reply = formatTemplate(tpl, templateData);

        } else if (match(keywords.rules)) {
            const rules = info.note || 'Vui lòng giữ gìn vệ sinh chung, không gây ồn ào sau 22h, và tôn trọng các cư dân khác.';
            reply = `📋 **Nội quy ${name}:**\n\n${rules}\n\nNếu cần biết thêm chi tiết, liên hệ chủ trọ qua **${phone}** nhé!`;

        } else if (match(keywords.payment)) {
            const bank = info.bank_name 
                ? `• Ngân hàng: **${info.bank_name}**\n• Số tài khoản: **${info.bank_account || 'Đang cập nhật'}**\n• Chủ tài khoản: **${info.bank_owner || 'Đang cập nhật'}**` 
                : `Bạn vui lòng liên hệ chủ trọ qua **${phone}** để được hướng dẫn cách thanh toán nhé!`;
            reply = `💳 **Thông tin thanh toán:**\n\n${bank}`;

        } else {
            reply = `Cảm ơn bạn đã nhắn tin! 😊\nMình chưa hiểu rõ câu hỏi của bạn.\n\nBạn có thể hỏi về:\n• 🏠 Phòng trống\n• 💰 Giá thuê\n• 📍 Địa chỉ\n• ⚡ Giá điện, nước\n• 📞 Liên hệ\n\nHoặc gọi thẳng cho chủ trọ: **${phone}** để được hỗ trợ nhanh nhất nhé!`;
        }

        res.json({ reply });

    } catch (error) {
        console.error('Chatbot Error:', error);
        res.status(500).json({ reply: 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng liên hệ trực tiếp chủ trọ để được hỗ trợ nhé!' });
    }
};

module.exports = { handleChatRequest };
