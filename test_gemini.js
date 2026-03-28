require('dotenv').config({ path: 'backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
    console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "N/A");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const models = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.0-pro'];
    for (const m of models) {
        try {
            console.log(`Testing model: ${m}`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Say 'hello'");
            console.log(`✅ SUCCESS [${m}]:`, result.response.text());
        } catch (e) {
            console.error(`❌ FAILED [${m}]:`, e.message);
        }
    }
}
testModels();
