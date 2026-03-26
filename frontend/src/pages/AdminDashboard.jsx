import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoomManagement from './RoomManagement';
import UserManagement from './UserManagement';
import InvoiceManagement from './InvoiceManagement';
import ReportDashboard from './ReportDashboard';
import SettingsPage from './SettingsPage';
import PaymentCalendar from './PaymentCalendar';
import AnomalyAnalysis from './AnomalyAnalysis';

const TABS = [
    { key: 'rooms',    label: 'Quản lý Phòng',  icon: '🏠' },
    { key: 'users',    label: 'Khách Thuê',      icon: '👥' },
    { key: 'invoices', label: 'Hóa Đơn',         icon: '📄' },
    { key: 'calendar', label: 'Lịch Thu Tiền',  icon: '📅' },
    { key: 'reports',  label: 'Thống Kê',        icon: '📊' },
    { key: 'anomaly',  label: 'Phân Tích',       icon: '🔍' },
    { key: 'settings', label: 'Cài Đặt',         icon: '⚙️' },
];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('rooms');
    const [settings, setSettings] = useState({});
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        axios.get('https://api-quan-ly-nha-tro.onrender.com/api/settings/public')
            .then(res => setSettings(res.data))
            .catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const currentTab = TABS.find(t => t.key === activeTab);
    const siteName = settings.nha_tro_name || 'Nhà Trọ';
    const logoImg = settings.logo_image;


    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
            {/* ===== SIDEBAR ===== */}
            <div className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col md:min-h-screen z-10 shadow-sm relative">
                {/* Logo - chỉ hiện trên PC */}
                <div className="hidden md:flex flex-col items-center py-8 px-4 border-b border-slate-100">
                    {logoImg ? (
                        <img src={logoImg} alt="Logo" className="h-12 max-w-[140px] object-contain rounded-lg mb-3" />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 outline outline-4 outline-indigo-50 rounded-xl flex items-center justify-center text-white text-2xl font-black mb-3 shadow-md">
                            H
                        </div>
                    )}
                    <h1 className="text-[17px] font-extrabold tracking-tight text-center leading-tight text-slate-900">
                        Quản lý <span className="text-indigo-600">{siteName}</span>
                    </h1>
                </div>

                {/* Menu */}
                <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible flex-shrink-0 py-2 md:py-6 gap-1 px-3">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-3 py-3 px-4 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200
                                ${activeTab === tab.key
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                        >
                            <span className={`text-xl flex-shrink-0 transition-transform ${activeTab === tab.key ? 'scale-110' : ''}`}>{tab.icon}</span>
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Footer Sidebar - chỉ hiện trên PC */}
                <div className="hidden md:block mt-auto p-5 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 text-lg font-black border border-indigo-200/50">
                            {(user.full_name || 'A')[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 leading-tight truncate">{user.full_name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 truncate">Quản trị viên</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        Đăng Xuất
                    </button>
                </div>
            </div>

            {/* ===== NỘI DUNG CHÍNH ===== */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar Mobile */}
                <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center z-20 sticky top-0">
                    <div className="flex items-center gap-2">
                        {logoImg ? (
                            <img src={logoImg} alt="Logo" className="h-8 max-w-[80px] object-contain rounded" />
                        ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                H
                            </div>
                        )}
                        <span className="font-bold text-sm text-slate-800">{user.full_name || 'Admin'}</span>
                    </div>
                    <button onClick={handleLogout} className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                        Đăng xuất
                    </button>
                </div>

                {/* Breadcrumb tiêu đề trang */}
                <div className="bg-white/60 backdrop-blur-md border-b border-slate-200 px-8 py-4 hidden md:flex items-center gap-2.5 text-slate-500 text-sm sticky top-0 z-10">
                    <span className="font-bold text-indigo-600">Trang chủ</span>
                    <span className="text-slate-300">/</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-2">{currentTab?.icon} {currentTab?.label}</span>
                </div>

                {/* Nội dung Tab */}
                <div className="flex-1 p-4 md:p-8">
                    {activeTab === 'rooms'    && <RoomManagement setActiveTab={setActiveTab} />}
                    {activeTab === 'users'    && <UserManagement />}
                    {activeTab === 'invoices' && <InvoiceManagement />}
                    {activeTab === 'calendar' && <PaymentCalendar />}
                    {activeTab === 'reports'  && <ReportDashboard />}
                    {activeTab === 'anomaly'  && <AnomalyAnalysis />}
                    {activeTab === 'settings' && <SettingsPage />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
