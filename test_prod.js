const axios = require('axios');
async function test() {
    try {
        console.log("Pinging Production API...");
        const res = await axios.post('https://api-quan-ly-nha-tro.onrender.com/api/chat/public', {
            messages: [{ text: "Chào bạn 👋 Mình là Trợ lý Nhà trọ. Bạn có thể hỏi mình về phòng trống, giá thuê, địa chỉ, hoặc điện nước nhé!", sender: "bot" }, { text: "chào bạn", sender: "user" }]
        });
        console.log("✅ SUCCESS:", res.data);
    } catch (e) {
        if (e.response) {
            console.error("❌ STATUS:", e.response.status, "DATA:", e.response.data);
        } else {
            console.error("❌ ERROR:", e.message);
        }
    }
}
test();
