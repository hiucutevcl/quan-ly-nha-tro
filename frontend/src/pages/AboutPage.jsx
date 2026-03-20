import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdsBanner from '../components/AdsBanner';

const API_URL = 'https://api-quan-ly-nha-tro.onrender.com/api';

/** Header Đơn Giản */
function SimpleHeader({ settings }) {
  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-decoration-none" style={{ textDecoration: 'none' }}>
          {settings.logo_image ? (
            <img src={settings.logo_image} alt="Logo" style={{ height: 34, borderRadius: 8, objectFit: 'contain' }} />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 15
            }}>H</div>
          )}
          <span className="text-xl font-black text-gray-800 tracking-tight" style={{ color: '#111827', textDecoration: 'none' }}>
            {settings.nha_tro_name || 'Hệ thống Nhà trọ'}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', textDecoration: 'none' }} className="hover:text-indigo-600 transition-colors">
            Trang chủ
          </Link>
          <Link to="/danh-sach-phong" style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', textDecoration: 'none' }} className="hover:text-indigo-600 transition-colors hidden sm:block">
            Danh sách phòng
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function AboutPage() {
  const [settings, setSettings] = useState({ nha_tro_name: 'Hệ thống Nhà trọ', phone: '', address: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const settingsRes = await axios.get(`${API_URL}/settings/public`);
        setSettings(prev => ({ ...prev, ...settingsRes.data }));
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
      }
    };
    fetchData();
  }, []);

  const coreValues = [
    { 
      icon: '🛡️', title: 'An Ninh Tuyệt Đối', 
      desc: 'Hệ thống camera giám sát 24/7, khóa vân tay và quản lý chặt chẽ đảm bảo sự an tâm tuyệt đối cho mọi cư dân.' 
    },
    { 
      icon: '✨', title: 'Tiện Nghi Hiện Đại', 
      desc: 'Mọi phòng trọ được trang bị đầy đủ nội thất cao cấp, máy lạnh, máy giặt, mang đến không gian sống như ở nhà.' 
    },
    { 
      icon: '🤝', title: 'Cộng Đồng Văn Minh', 
      desc: 'Tuyển chọn cư dân kỹ lưỡng tạo nên một không gian sống văn hóa, thân thiện và tôn trọng lẫn nhau.' 
    },
    { 
      icon: 'شف', title: 'Minh Bạch 100%', 
      desc: 'Mọi chi phí điện, nước, dịch vụ được quản lý công khai, rõ ràng trên hệ thống phần mềm chuyên nghiệp.' 
    }
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen bg-slate-50 flex flex-col">
      <SimpleHeader settings={settings} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white pt-16 pb-20 px-4 relative overflow-hidden border-b border-gray-100">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-indigo-50 blur-3xl opacity-60"></div>
            <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 rounded-full bg-violet-50 blur-3xl opacity-60"></div>
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <span className="text-indigo-600 font-bold tracking-widest text-sm uppercase px-4 py-2 bg-indigo-50 rounded-full inline-block mb-6 shadow-sm border border-indigo-100/50">
                    Sứ mệnh của chúng tôi
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-8 tracking-tight">
                    Tái định nghĩa trải nghiệm <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                        thuê phòng trọ
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
                    Hệ thống phòng trọ <strong className="text-slate-900">{settings.nha_tro_name}</strong> ra đời với mục tiêu xóa bỏ mọi định kiến về "nhà trọ sinh viên". Chúng tôi cam kết mang đến một không gian sống chuẩn mực, an toàn và thông minh, giúp bạn yên tâm học tập và kiến tạo tương lai.
                </p>
                
                <div className="mt-10 flex gap-4 justify-center">
                    <Link to="/danh-sach-phong" className="px-8 py-3.5 bg-indigo-600 text-white rounded-full font-bold shadow-[0_4px_14px_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all outline-none">
                        Khám phá phòng ngay
                    </Link>
                </div>
            </div>
        </section>

        {/* Ad Banner */}
        <div className="max-w-6xl mx-auto px-4 mt-12 mb-4">
           <AdsBanner layout="banner" />
        </div>

        {/* Core Values Section */}
        <section className="py-20 px-4 bg-slate-50 relative">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Giá trị cốt lõi</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg">Những nguyên tắc vàng xây dựng nên nền tảng phát triển bền vững của hệ thống {settings.nha_tro_name}.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {coreValues.map((val, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all group duration-300">
                            <div className="text-4xl mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors shadow-sm">
                                {val.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{val.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm font-medium">{val.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Story / Owner Section */}
        <section className="py-20 px-4 bg-white border-t border-slate-100">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                <div className="w-full md:w-1/2 relative">
                    <div className="aspect-square rounded-[3rem] overflow-hidden bg-slate-200">
                        <img 
                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&w=800&q=80" 
                            alt="Cộng đồng nhà trọ văn minh" 
                            className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
                        />
                    </div>
                    {/* Floating stats box */}
                    <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="text-indigo-600 font-black text-4xl">100+</div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide leading-tight">Cư dân<br/>hiện tại</div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Trở thành một phần của cộng đồng</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        Tại {settings.nha_tro_name}, chúng tôi không chỉ cho thuê một căn phòng, chúng tôi mang đến một "Tổ ấm". Mọi khâu quản lý từ vệ sinh chung, bảo trì thiết bị đến an ninh khu vực đều được thực hiện chuyên nghiệp nhờ sự hỗ trợ của phần mềm quản lý tối tân.
                    </p>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        Cho dù bạn là sinh viên mới nhập học hay người đi làm, chúng tôi đều lắng nghe và hỗ trợ nhanh chóng 24/7 để tạo ra một không gian sinh hoạt hoàn hảo nhất.
                    </p>
                    {settings.phone && (
                        <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl shadow-sm">
                                📞
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Hotline tư vấn</p>
                                <a href={`tel:${settings.phone}`} className="text-2xl font-black text-slate-900 hover:text-indigo-600 transition-colors">
                                    {settings.phone}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>

      </main>

      {/* Basic Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t-[8px] border-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{settings.nha_tro_name}</h3>
            <p className="text-base text-slate-400 mb-8 max-w-md mx-auto">Tự hào là hệ thống quản lý nhà trọ sinh viên, người đi làm chất lượng cao hàng đầu.</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-8 font-medium">
                {settings.phone && <span className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full">📞 {settings.phone}</span>}
                {settings.address && <span className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full">📍 {settings.address}</span>}
            </div>
            <div className="border-t border-slate-700/50 pt-8 text-sm font-medium text-slate-500 flex flex-col sm:flex-row justify-center items-center gap-4">
                <span>© {new Date().getFullYear()} {settings.nha_tro_name}. Tất cả các quyền được bảo lưu.</span>
                <span className="hidden sm:inline">•</span>
                <span>Made with ❤️ for students</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
