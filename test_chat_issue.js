const axios = require('axios');

async function test() {
    try {
        console.log("Gửi request tới API...");
        const res = await axios.post('http://localhost:5000/api/chat/public', {
            messages: [
                { text: 'Chào bạn', sender: 'bot' },
                { text: 'chào bạn', sender: 'user' }
            ]
        });
        console.log("✅ THÀNH CÔNG:", res.data);
    } catch (err) {
        if (err.response) {
            console.error("❌ LỖI SERVER (Status " + err.response.status + "):", err.response.data);
        } else {
            console.error("❌ LỖI KHÔNG GỌI ĐƯỢC API:", err.message);
        }
    }
}
test();
