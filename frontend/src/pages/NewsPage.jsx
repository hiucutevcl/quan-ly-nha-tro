import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdsBanner from '../components/AdsBanner';

const API_URL = 'https://api-quan-ly-nha-tro.onrender.com/api';

const articles = [
  {
    id: 1,
    title: 'Quy trình khai báo tạm trú trực tuyến an toàn, nhanh chóng năm 2026',
    date: '10/03/2026',
    category: 'Thủ Tục',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    excerpt: 'Theo quy định mới, khách thuê có thể khai báo tạm trú online qua Cổng Dịch Vụ Công Quốc Gia. Hãy cùng tìm hiểu các giấy tờ cần chuẩn bị và quy trình.',
    content: "Chi tiết...",
  },
  {
    id: 2,
    title: 'Cẩm nang Phòng Cháy Chữa Cháy (PCCC) cho phòng trọ sinh viên',
    date: '05/03/2026',
    category: 'An Toàn',
    image: 'https://images.unsplash.com/photo-1563200782-208b89416550?auto=format&fit=crop&w=600&q=80',
    excerpt: 'Trang bị ngay 5 bình chữa cháy mini cho phòng trọ sinh viên. Tuyệt đối không sạc xe máy điện, xe đạp điện qua đêm trong hầm để xe...',
    content: "Chi tiết...",
  },
  {
    id: 3,
    title: 'Nội quy chung cư mini & Hệ thống nhà trọ',
    date: '01/03/2026',
    category: 'Quy Định',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80',
    excerpt: 'Để đảm bảo an ninh trật tự và môi trường sống văn minh, cư dân vui lòng tuân thủ quy định giờ giấc giới nghiêm, tiếng ồn sau 22h và đổ rác đúng giờ.',
    content: "Chi tiết...",
  },
  {
    id: 4,
    title: 'Mẹo tiết kiệm điệm nước mùa Hè cực kì hiệu quả',
    date: '15/02/2026',
    category: 'Đời Sống',
    image: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=600&q=80',
    excerpt: 'Mùa hè tới khiến hóa đơn tiền điện tăng cao. Hãy đặt máy lạnh ở mức độ 26-28 độ C kết hợp quạt, vệ sinh màng lọc và bảo dưỡng định kỳ.',
    content: "Chi tiết...",
  }
];

export default function NewsPage() {
  const [settings, setSettings] = useState({ nha_tro_name: 'Hệ thống Nhà trọ', phone: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`${API_URL}/settings/public`)
      .then(res => setSettings(prev => ({ ...prev, ...res.data })))
      .catch(console.error);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen bg-slate-50">
      {/* Header Đơn Giản */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-decoration-none">
            <span className="text-xl font-black text-gray-800 tracking-tight">{settings.nha_tro_name} News</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors">Trang chủ</Link>
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="text-sm font-bold bg-orange-100 text-orange-600 px-4 py-2 rounded-full hover:bg-orange-200 transition-colors">
                📞 Liên hệ
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Tiêu đề trang */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Kênh Thông Tin & Quy Định</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Cập nhật những tin tức mới nhất về nhà trọ, hướng dẫn thủ tục lưu trú, quy chế an toàn, và các mẹo vặt đời sống sinh viên.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Cột chính: Danh sách bài viết */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow">
                <div className="sm:w-2/5 relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold text-gray-800 px-3 py-1 rounded-full z-10 shadow-sm">
                    {article.category}
                  </span>
                  <img src={article.image} alt={article.title} className="w-full h-56 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                  <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">{article.date}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-orange-600 transition-colors">
                    <Link to="#">{article.title}</Link>
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {article.excerpt}
                  </p>
                  <Link to="#" className="inline-block mt-auto text-sm font-bold text-orange-600 hover:text-orange-700">Đọc tiếp →</Link>
                </div>
              </article>
            ))}
          </div>

          {/* Cột Sidebar: Quảng cáo Thương Mại */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b pb-3 mb-4">Tài trợ thương mại</h3>
              
              {/* Banner Quảng Cáo 1 */}
              <AdsBanner layout="any" />

              {/* Banner Quảng Cáo 2 */}
              <AdsBanner layout="any" />
              
              <div className="mt-4 p-4 bg-orange-50 rounded-xl text-center border border-orange-100">
                <p className="text-xs font-semibold text-orange-800 mb-1">Cơ hội liên kết kinh doanh</p>
                <p className="text-[11px] text-orange-600">Liên hệ quản lý {settings.nha_tro_name} để quảng cáo dịch vụ sinh viên.</p>
              </div>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
