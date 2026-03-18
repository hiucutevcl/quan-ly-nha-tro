import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/AdminDashboard'
import TenantInvoices from './pages/TenantInvoices'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ - Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
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
