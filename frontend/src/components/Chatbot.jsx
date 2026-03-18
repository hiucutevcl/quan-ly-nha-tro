import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn! Tôi là Bot hỗ trợ nhà trọ. Bạn cần giúp gì?", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTo({ top: messagesEndRef.current.scrollHeight, behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setInput("");

        // Simple logic bot
        setTimeout(() => {
            let botReply = "Xin lỗi, tôi chưa hiểu ý bạn. Bạn có thể hỏi về 'giá phòng', 'liên hệ', hoặc 'còn phòng không' nhé!";
            
            const lowerMsg = userMsg.toLowerCase();
            if (lowerMsg.includes("giá") || lowerMsg.includes("bao nhiêu")) {
                botReply = "Giá phòng dao động từ 2.000.000đ đến 3.500.000đ tùy diện tích và tiện nghi bạn nhé.";
            } else if (lowerMsg.includes("liên hệ") || lowerMsg.includes("số điện thoại") || lowerMsg.includes("sđt")) {
                botReply = "Bạn có thể gọi trực tiếp cho chủ nhà qua số điện thoại hiển thị ở phần thông tin liên hệ trên trang web.";
            } else if (lowerMsg.includes("còn phòng") || lowerMsg.includes("trống")) {
                botReply = "Bạn vui lòng xem danh sách các phòng bên dưới, những phòng có nhãn 'Còn phòng' màu xanh là đang trống ạ.";
            } else if (lowerMsg.includes("địa chỉ") || lowerMsg.includes("ở đâu")) {
                botReply = "Địa chỉ nhà trọ được ghi rõ ở phần giới thiệu trên trang chủ bạn nhé!";
            } else if (lowerMsg.includes("chào") || lowerMsg.includes("hi") || lowerMsg.includes("hello")) {
                botReply = "Chào bạn! Chúc bạn một ngày tốt lành. Tôi có thể giúp gì cho bạn trong việc tìm phòng trọ không?";
            }

            setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
        }, 600);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000]">
            {/* Nút bong bóng */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Cửa sổ chat */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[450px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold">Trợ lý Nhà trọ</h3>
                            <p className="text-xs text-blue-100">Đang trực tuyến</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div 
                        ref={messagesEndRef}
                        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSend}
                            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
