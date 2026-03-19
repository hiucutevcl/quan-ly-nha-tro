const axios = require('axios');

async function test() {
    try {
        const payload = {
            messages: [
                { text: "Chào bạn, cho mình hỏi phòng trống", sender: "user" }
            ]
        };
        const res = await axios.post('http://localhost:5000/api/chat/public', payload);
        console.log("SUCCESS:", res.data);
    } catch (err) {
        console.error("FAILED:", err.response ? err.response.data : err.message);
    }
}
test();
