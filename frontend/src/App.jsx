import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import NewsPage from './pages/NewsPage'
import ArticleDetail from './pages/ArticleDetail'
import AdminDashboard from './pages/AdminDashboard'
import TenantInvoices from './pages/TenantInvoices'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ - Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
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
    </BrowserRouter>
  )
}

export default App
