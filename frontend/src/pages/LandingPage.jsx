import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Chatbot from '../components/Chatbot';

const LandingPage = () => {
    const [settings, setSettings] = useState({
        nha_tro_name: 'Hệ thống Nhà trọ',
        address: 'Đang tải...',
        phone: '...',
        rules: 'Tuân thủ nội quy nhà trọ.'
    });
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'https://api-quan-ly-nha-tro.onrender.com/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, roomsRes] = await Promise.all([
                    axios.get(`${API_URL}/settings/public`),
                    axios.get(`${API_URL}/rooms/public`)
                ]);
                setSettings(prev => ({ ...prev, ...settingsRes.data }));
                setRooms(roomsRes.data);
            } catch (err) {
                console.error("Lỗi tải dữ liệu công khai:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                H
                            </div>
                            <span className="font-black text-xl tracking-tight text-slate-800">{settings.nha_tro_name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="#about" className="hidden md:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Giới thiệu</a>
                            <a href="#rooms" className="hidden md:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Danh sách phòng</a>
                            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95">
                                Đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 overflow-hidden bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-[150px]"></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="inline-block py-1 px-4 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                        Chào mừng bạn đến với chúng tôi
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
                        Không gian sống <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Lý tưởng & An tâm</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
                        Hệ thống {settings.nha_tro_name} cung cấp dịch vụ cho thuê phòng trọ cao cấp, hiện đại, tích hợp công nghệ quản lý tự động, minh bạch và an toàn.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="#rooms" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl">
                            Xem phòng ngay
                        </a>
                        <a href={`tel:${settings.phone}`} className="bg-white border border-slate-200 hover:border-blue-300 text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                            📞 Liên hệ: {settings.phone}
                        </a>
                    </div>
                </div>
            </header>

            {/* Stats/About Section */}
            <section id="about" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow cursor-default group">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Vị trí đắc địa</h3>
                            <p className="text-slate-600 text-sm">{settings.address}</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow cursor-default group">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">An ninh 24/7</h3>
                            <p className="text-slate-600 text-sm">Hệ thống camera giám sát, cửa từ vân tay, đảm bảo an toàn tuyệt đối cho tài sản của bạn.</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow cursor-default group">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Tiện ích đầy đủ</h3>
                            <p className="text-slate-600 text-sm">Wifi tốc độ cao, chỗ để xe rộng rãi, máy giặt, điều hòa, vệ sinh khép kín sạch sẽ.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rooms Showcase */}
            <section id="rooms" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div className="max-w-xl">
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Danh sách phòng hiện có</h2>
                            <p className="text-slate-600">Dưới đây là thông tin chi tiết các phòng trong hệ thống. Bạn có thể xem trạng thái phòng để biết còn trống hay không.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                CÒN {rooms.filter(r => r.status === 'Available').length} PHÒNG TRỐNG
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1,2,3].map(i => (
                                <div key={i} className="aspect-[4/3] bg-slate-100 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {rooms.map((room) => {
                                let images = [];
                                try {
                                    images = room.image_url ? JSON.parse(room.image_url) : [];
                                } catch (e) {
                                    // Fallback for older database rows where image_url was a simple string
                                    images = typeof room.image_url === 'string' ? [room.image_url] : [];
                                }
                                const mainImg = images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                
                                return (
                                    <div key={room.id} className="group cursor-pointer">
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl mb-4 shadow-md group-hover:shadow-xl transition-all duration-500">
                                            <img 
                                                src={mainImg} 
                                                alt={room.room_name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-4 py-2 rounded-2xl text-xs font-black shadow-lg ${
                                                    room.status === 'Available' 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-red-500 text-white'
                                                }`}>
                                                    {room.status === 'Available' ? 'CÒN PHÒNG' : 'HẾT PHÒNG'}
                                                </span>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white text-sm font-medium">{room.amenities || 'Đầy đủ tiện nghi cơ bản'}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-xl font-black text-slate-800 tracking-tight">{room.room_name}</h4>
                                                <p className="text-slate-500 text-sm font-medium">{room.amenities && typeof room.amenities === 'string' ? room.amenities.substring(0, 40) + '...' : 'Tiện nghi cơ bản'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-blue-600 font-black text-lg">{Number(room.price).toLocaleString()}đ</p>
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">/ THÁNG</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Rules / Footer Info */}
            <section className="py-20 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100">
                            <h3 className="text-2xl font-black mb-6 text-slate-800">Nội quy nhà trọ</h3>
                            <div className="prose prose-slate prose-sm text-slate-600">
                                {settings.rules || "Vui lòng giữ vệ sinh chung và đảm bảo an ninh trật tự."}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Sẵn sàng để trở thành <br /> cư dân tiếp theo?</h2>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                Đừng ngần ngại liên hệ hoặc đến xem trực tiếp để cảm nhận không gian tuyệt vời tại {settings.nha_tro_name}. Chúng tôi luôn sẵn sàng hỗ trợ bạn.
                            </p>
                            <Link to="/login" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl group">
                                Bắt đầu ngay
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm font-medium">
                    <p>© {new Date().getFullYear()} {settings.nha_tro_name}. Phát triển bởi <span className="text-slate-600">Antigravity AI</span>.</p>
                </div>
            </footer>

            {/* Chatbot Component */}
            <Chatbot />
        </div>
    );
};

export default LandingPage;
