import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdsBanner from '../components/AdsBanner';
import { articles } from '../data/articles';

const API_URL = 'https://api-quan-ly-nha-tro.onrender.com/api';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ nha_tro_name: 'Hệ thống Nhà trọ', phone: '' });

  const article = articles.find(a => a.id === parseInt(id));

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`${API_URL}/settings/public`)
      .then(res => setSettings(prev => ({ ...prev, ...res.data })))
      .catch(console.error);
      
    if (!article) {
      navigate('/tin-tuc-quy-dinh');
    }
  }, [id, article, navigate]);

  if (!article) return null;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen bg-slate-50">
      {/* Header Đơn Giản */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-decoration-none">
            <span className="text-xl font-black text-gray-800 tracking-tight">{settings.nha_tro_name} News</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/tin-tuc-quy-dinh" className="text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors">← Quay lại danh sách</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Cột chính: Chi tiết bài viết */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-64 sm:h-96 w-full">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block shadow-sm">
                    {article.category}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
                    {article.title}
                  </h1>
                  <p className="text-gray-200 text-sm font-medium">Đăng ngày {article.date}</p>
                </div>
              </div>
              
              <div className="p-8 sm:p-10">
                <div className="prose prose-lg prose-orange max-w-none text-gray-700 leading-relaxed" 
                     dangerouslySetInnerHTML={{ __html: article.content }} />
                     
                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                   <Link to="/tin-tuc-quy-dinh" className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition">
                     ← Trở về trang trước
                   </Link>
                </div>
              </div>
            </article>
          </div>

          {/* Cột Sidebar: Quảng cáo Thương Mại */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b pb-3 mb-4">Tài trợ thương mại</h3>
              
              <AdsBanner layout="sidebar" />
              <AdsBanner layout="banner" />
              
              <div className="mt-4 p-4 bg-orange-50 rounded-xl text-center border border-orange-100">
                <p className="text-xs font-semibold text-orange-800 mb-1">Cơ hội liên kết kinh doanh</p>
                <p className="text-[11px] text-orange-600">Liên hệ quản lý {settings.nha_tro_name} để quảng cáo dịch vụ sinh viên.</p>
              </div>
            </div>
          </aside>
          
        </div>
      </div>
      
      {/* Footer minimal */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-12">
         <p className="text-sm">© {new Date().getFullYear()} {settings.nha_tro_name}. Nền tảng nhà trọ thông minh.</p>
      </footer>
    </div>
  );
}
