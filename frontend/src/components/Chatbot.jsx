import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn 👋 Mình là Trợ lý Nhà trọ. Bạn có thể hỏi mình về phòng trống, giá thuê, địa chỉ, hoặc điện nước nhé!", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [customQuickReplies, setCustomQuickReplies] = useState([]);
    const [logoUrl, setLogoUrl] = useState("");
    const messagesEndRef = useRef(null);    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api/chat/public' 
        : 'https://api-quan-ly-nha-tro.onrender.com/api/chat/public';
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTo({ top: messagesEndRef.current.scrollHeight, behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        axios.get(API_URL.replace('/chat/public', '/settings/public'))
            .then(res => {
                let dynamicReplies = [];
                if (res.data.custom_quick_replies) {
                    try {
                        dynamicReplies = JSON.parse(res.data.custom_quick_replies);
                        if (!Array.isArray(dynamicReplies)) dynamicReplies = [];
                    } catch(e) {}
                }
                setCustomQuickReplies(dynamicReplies);
                if (res.data.logo_image) setLogoUrl(res.data.logo_image);
            })
            .catch(err => console.error("Lỗi tải quick replies:", err));
    }, [API_URL]);

    // quickReplyIdx: truyền index của quick reply (0-4) để server dùng đúng template admin
    const handleSend = async (overrideText = null, quickReplyIdx = null) => {
        const textToSend = overrideText || input;
        if ((!textToSend || !textToSend.trim()) || isLoading) return;

        const userMsg = textToSend.trim();
        const newMessages = [...messages, { text: userMsg, sender: 'user' }];
        
        setMessages(newMessages);
        if (!overrideText) setInput("");
        setIsLoading(true);

        try {
            const payload = { messages: newMessages };
            // Không gửi quickReplyIdx nữa vì server sẽ query String name trực tiếp
            const res = await axios.post(API_URL, payload);
            setMessages(prev => [...prev, { text: res.data.reply, sender: 'bot' }]);
        } catch (error) {
            console.error("Lỗi AI API:", error);
            setMessages(prev => [...prev, { text: 'Mình đang gặp chút sự cố mạng. Vui lòng liên hệ trực tiếp chủ trọ nhé!', sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
            {/* Gợi ý bật chat */}
            {!isOpen && (
                <div 
                    className="mb-3 mr-2 bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-gray-100 animate-bounce cursor-pointer flex items-center gap-2 relative transition-transform hover:scale-105" 
                    onClick={() => setIsOpen(true)}
                >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Chat ngay nào 👋</span>
                    {/* Mũi tên */}
                    <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
                </div>
            )}

            {/* Nút bong bóng */}
            <div className="relative group hover:cursor-pointer">
                {!isOpen && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-80 transition duration-500 animate-pulse"></div>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden border-[3px] border-white z-10"
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : logoUrl ? (
                        <img src={logoUrl} alt="Bot" className="w-full h-full object-cover bg-white" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    )}
                </button>
                {!isOpen && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 z-20">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </div>

            {/* Cửa sổ chat */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[520px] bg-white rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-blue-500">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Trợ lý" className="w-full h-full object-cover" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            )}
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
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                                    msg.sender === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none leading-relaxed'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] p-3 px-4 rounded-2xl bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Replies */}
                    <div className="px-4 pb-3 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                        {customQuickReplies.map((qr, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleSend(qr.title)}
                                disabled={isLoading}
                                className="whitespace-nowrap px-3 py-1.5 bg-white border border-blue-100 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {qr.title}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Nhắn hoặc hỏi thêm..."
                            disabled={isLoading}
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
