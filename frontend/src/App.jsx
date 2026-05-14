import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import RoomsPage from './pages/RoomsPage'
import NewsPage from './pages/NewsPage'
import ArticleDetail from './pages/ArticleDetail'
import AdminDashboard from './pages/AdminDashboard'
import TenantInvoices from './pages/TenantInvoices'
import Chatbot from './components/Chatbot'

function AppContent() {
  const location = useLocation();
  // Không hiển thị Chatbot ở các trang quản trị / bảo mật
  const noChatbotRoutes = ['/login', '/admin-dashboard', '/my-invoices'];
  const showChatbot = !noChatbotRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Trang chủ - Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Trang Giới Thiệu */}
        <Route path="/gioi-thieu" element={<AboutPage />} />

        {/* Trang Danh sách Phòng */}
        <Route path="/danh-sach-phong" element={<RoomsPage />} />
        
        {/* Trang Tin tức, Quy định, Quảng Cáo */}
        <Route path="/tin-tuc-quy-dinh" element={<NewsPage />} />
        <Route path="/tin-tuc-quy-dinh/:id" element={<ArticleDetail />} />
        
        {/* Bước 4: Trang Đăng Nhập */}
        <Route path="/login" element={<Login />} />
        
        {/* Bước 5: Trang Chủ Nhà (Admin) */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* Bước 6: Trang Người Thuê (Tenant) */}
        <Route path="/my-invoices" element={<TenantInvoices />} />
      </Routes>

      {/* Hiển thị chatbot trên các trang cộng đồng */}
      {showChatbot && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
