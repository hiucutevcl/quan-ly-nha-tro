import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomManagement from './RoomManagement';
import UserManagement from './UserManagement';
import InvoiceManagement from './InvoiceManagement';
import ReportDashboard from './ReportDashboard';
import SettingsPage from './SettingsPage';
import PaymentCalendar from './PaymentCalendar';

const TABS = [
    { key: 'rooms',    label: 'Quản lý Phòng',  icon: '🏠' },
    { key: 'users',    label: 'Khách Thuê',      icon: '👥' },
    { key: 'invoices', label: 'Hóa Đơn',         icon: '📄' },
    { key: 'calendar', label: 'Lịch Thu Tiền',  icon: '📅' },
    { key: 'reports',  label: 'Thống Kê',        icon: '📊' },
    { key: 'settings', label: 'Cài Đặt',         icon: '⚙️' },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('rooms');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const currentTab = TABS.find(t => t.key === activeTab);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* ===== SIDEBAR ===== */}
            <div className="w-full md:w-60 bg-blue-950 text-white shadow-2xl flex flex-col md:min-h-screen">
                {/* Logo - chỉ hiện trên PC */}
                <div className="hidden md:flex flex-col items-center py-6 px-4 border-b border-blue-800">
                    <span className="text-4xl mb-1">🏠</span>
                    <h1 className="text-lg font-black tracking-wider text-center leading-tight">
                        QUẢN LÝ<br/><span className="text-blue-300">NHÀ TRỌ</span>
                    </h1>
                </div>

                {/* Menu */}
                <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible flex-shrink-0 py-2 md:py-4">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-3 py-3 px-4 md:px-5 text-sm font-semibold whitespace-nowrap transition
                                hover:bg-blue-800 md:w-full text-left
                                ${activeTab === tab.key
                                    ? 'bg-blue-700 md:border-l-4 border-yellow-400 text-white'
                                    : 'text-blue-200 hover:text-white'
                                }`}
                        >
                            <span className="text-xl flex-shrink-0">{tab.icon}</span>
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Footer Sidebar - chỉ hiện trên PC */}
                <div className="hidden md:block mt-auto p-4 border-t border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-lg font-black">
                            {(user.full_name || 'A')[0]}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-tight">{user.full_name || 'Admin'}</p>
                            <p className="text-xs text-blue-300">Quản trị viên</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
                    >
                        🚪 Đăng Xuất
                    </button>
                </div>
            </div>

            {/* ===== NỘI DUNG CHÍNH ===== */}
            <div className="flex-1 flex flex-col">
                {/* Topbar Mobile */}
                <div className="md:hidden bg-blue-950 px-4 py-3 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <span>🏠</span>
                        <span className="font-bold text-sm">{user.full_name || 'Admin'}</span>
                    </div>
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-xs font-bold transition">
                        Đăng xuất
                    </button>
                </div>

                {/* Breadcrumb tiêu đề trang */}
                <div className="bg-white border-b px-6 py-3 hidden md:flex items-center gap-2 text-gray-600 text-sm">
                    <span className="font-bold text-blue-800">Trang chủ</span>
                    <span>›</span>
                    <span className="font-semibold text-gray-800">{currentTab?.icon} {currentTab?.label}</span>
                </div>

                {/* Nội dung Tab */}
                <div className="flex-1 p-4 md:p-6">
                    {activeTab === 'rooms'    && <RoomManagement />}
                    {activeTab === 'users'    && <UserManagement />}
                    {activeTab === 'invoices' && <InvoiceManagement />}
                    {activeTab === 'calendar' && <PaymentCalendar />}
                    {activeTab === 'reports'  && <ReportDashboard />}
                    {activeTab === 'settings' && <SettingsPage />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
