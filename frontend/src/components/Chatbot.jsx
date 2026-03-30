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
                    className="mb-3 mr-2 bg-white px-5 py-2.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-200 cursor-pointer flex items-center gap-2 transition-transform hover:-translate-y-1" 
                    onClick={() => setIsOpen(true)}
                >
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium text-gray-800 tracking-wide">Bạn cần hỗ trợ?</span>
                </div>
            )}

            {/* Nút bong bóng */}
            <div className="relative hover:cursor-pointer flex justify-end">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-14 h-14 bg-gray-900 hover:bg-black text-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden z-10"
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : logoUrl ? (
                        <img src={logoUrl} alt="Bot" className="w-full h-full object-cover bg-white" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Cửa sổ chat */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[340px] sm:w-[380px] h-[580px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                    {/* Header Minimalist */}
                    <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Trợ lý" className="w-full h-full object-cover grayscale-[20%]" />
                                ) : (
                                    <span className="text-xl">💬</span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm tracking-wide">Trợ lý nhà trọ</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Trực tuyến</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div 
                        ref={messagesEndRef}
                        className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-white"
                    >
                        {messages.map((msg, idx) => {
                            const isUser = msg.sender === 'user';
                            return (
                                <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-4 text-[14px] leading-relaxed whitespace-pre-line ${
                                        isUser 
                                        ? 'bg-gray-900 text-white rounded-2xl rounded-tr-sm' 
                                        : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="p-4 rounded-2xl bg-gray-100 rounded-tl-sm flex items-center gap-1.5 h-10">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Replies */}
                    {customQuickReplies.length > 0 && (
                        <div className="px-4 pb-3 bg-white flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                            {customQuickReplies.map((qr, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSend(qr.title)}
                                    disabled={isLoading}
                                    className="whitespace-nowrap px-4 py-2 border border-gray-200 text-gray-600 rounded-full text-[13px] font-medium hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all disabled:opacity-50"
                                >
                                    {qr.title}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area Minimalist */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1 focus-within:bg-white focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-100 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Gõ tin nhắn..."
                                disabled={isLoading}
                                className="flex-1 w-full bg-transparent outline-none focus:outline-none focus:ring-0 text-sm pl-3 py-2 text-gray-800 placeholder-gray-400 disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="w-9 h-9 mr-1 bg-gray-900 hover:bg-black text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-gray-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
