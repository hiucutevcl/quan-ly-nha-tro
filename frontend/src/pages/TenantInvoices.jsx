import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TenantInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const axiosAuth = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        axiosAuth.get('/invoices/my-invoices')
            .then(res => { setInvoices(res.data); setLoading(false); })
            .catch(() => { alert('Phiên đăng nhập hết hạn!'); navigate('/login'); });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const fmt = (v) => Number(v || 0).toLocaleString('vi-VN') + ' đ';

    const tongChuaThu = invoices.filter(i => !i.is_paid).reduce((s, i) => s + Number(i.total_amount), 0);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
                <div className="text-4xl mb-3 animate-bounce">⏳</div>
                <p>Đang tải hóa đơn của bạn...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 pb-10">
            {/* Header */}
            <div className="bg-blue-800 text-white px-4 py-4 shadow-md">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black tracking-wide">🏠 QUẢN LÝ NHÀ TRỌ</h1>
                        <p className="text-blue-300 text-sm mt-0.5">Xin chào, <b className="text-white">{user.full_name || 'Khách thuê'}</b></p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition">
                        Đăng xuất
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6">
                {/* Thống kê nhanh */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 text-center shadow border-t-4 border-blue-500">
                        <p className="text-2xl font-black text-blue-600">{invoices.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Tổng hóa đơn</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow border-t-4 border-green-500">
                        <p className="text-2xl font-black text-green-600">{invoices.filter(i => i.is_paid).length}</p>
                        <p className="text-xs text-gray-500 mt-1">Đã thanh toán</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 text-center shadow border-t-4 border-red-500">
                        <p className="text-2xl font-black text-red-600">{invoices.filter(i => !i.is_paid).length}</p>
                        <p className="text-xs text-gray-500 mt-1">Chưa thanh toán</p>
                    </div>
                </div>

                {tongChuaThu > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                        <span className="text-3xl">⚠️</span>
                        <div>
                            <p className="font-bold text-red-700">Bạn đang có tiền chưa thanh toán!</p>
                            <p className="text-red-600 text-sm">Tổng số tiền cần đóng: <b className="text-xl">{fmt(tongChuaThu)}</b></p>
                        </div>
                    </div>
                )}

                <h2 className="text-lg font-bold text-gray-700 mb-3">📋 Lịch sử hóa đơn</h2>

                {invoices.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                        <span className="text-5xl block mb-3">📭</span>
                        <p className="text-gray-400 font-medium">Chưa có hóa đơn nào được tạo.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invoices.map(invoice => (
                            <div key={invoice.id} className="bg-white rounded-xl shadow overflow-hidden">
                                {/* Header thẻ */}
                                <div className={`px-5 py-3 flex justify-between items-center ${invoice.is_paid ? 'bg-green-600' : 'bg-blue-700'} text-white`}>
                                    <div>
                                        <h3 className="font-black text-lg">
                                            Tháng {invoice.month_year?.split('-')[1]}/{invoice.month_year?.split('-')[0]}
                                        </h3>
                                        <p className="text-sm opacity-80">Phòng: {invoice.room_name}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black border-2 
                                        ${invoice.is_paid ? 'border-white text-white' : 'border-yellow-300 text-yellow-300'}`}>
                                        {invoice.is_paid ? '✅ ĐÃ ĐÓNG' : '⏳ CHƯA ĐÓNG'}
                                    </span>
                                </div>

                                {/* Chi tiết */}
                                <div className="p-5">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">🏠 Tiền phòng</span>
                                            <span className="font-semibold">{fmt(invoice.room_fee)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">⚡ Tiền điện ({invoice.old_elec} → {invoice.new_elec} số)</span>
                                            <span className="font-semibold">{fmt(invoice.elec_fee)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">💧 Tiền nước ({invoice.old_water} → {invoice.new_water} khối)</span>
                                            <span className="font-semibold">{fmt(invoice.water_fee)}</span>
                                        </div>
                                        {Number(invoice.trash_fee) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">♻️ Thu gom rác</span>
                                                <span className="font-semibold">{fmt(invoice.trash_fee)}</span>
                                            </div>
                                        )}
                                        {Number(invoice.wifi_fee) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">📶 Internet Wifi</span>
                                                <span className="font-semibold">{fmt(invoice.wifi_fee)}</span>
                                            </div>
                                        )}
                                        {Number(invoice.parking_fee) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">🏍️ Phí gửi xe ({invoice.parking_count} chiếc)</span>
                                                <span className="font-semibold">{fmt(invoice.parking_fee)}</span>
                                            </div>
                                        )}
                                        {Number(invoice.old_debt) > 0 && (
                                            <div className="flex justify-between text-sm text-orange-600 font-medium border-t pt-2 mt-1">
                                                <span>⚠️ Nợ tháng trước mang sang</span>
                                                <span>{fmt(invoice.old_debt)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 mt-3 border-t-2 border-dashed">
                                        <span className="font-bold text-gray-700 uppercase text-sm tracking-wide">TỔNG CỘNG</span>
                                        <span className={`text-2xl font-black ${invoice.is_paid ? 'text-green-600' : 'text-red-600'}`}>
                                            {fmt(invoice.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenantInvoices;
