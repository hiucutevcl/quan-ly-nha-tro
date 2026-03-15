const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
    const formData = new FormData();
    formData.append('images', fs.createReadStream('test.png')); // 1st image
    formData.append('images', fs.createReadStream('test.png')); // 2nd image

    try {
        const response = await axios.post('https://api-quan-ly-nha-tro.onrender.com/api/rooms/upload-image/1', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzczNTg2MjE3LCJleHAiOjE3NzM2NzI2MTd9.O_NyDuGm3tu2RnwooicqdE4hjmcmlosm1q6PABXpwPY`
            }
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testUpload();
