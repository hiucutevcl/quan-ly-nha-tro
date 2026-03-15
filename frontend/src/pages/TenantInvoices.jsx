import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TenantInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const axiosAuth = axios.create({
        baseURL: 'https://api-quan-ly-nha-tro.onrender.com/api',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const [profile, setProfile] = useState(null);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        
        const fetchDashboardData = async () => {
            try {
                const [invRes, profRes, setRes] = await Promise.all([
                    axiosAuth.get('/invoices/my-invoices'),
                    axiosAuth.get('/auth/me'),
                    axiosAuth.get('/settings')
                ]);
                setInvoices(invRes.data);
                setProfile(profRes.data);
                setSettings(setRes.data);
                setLoading(false);
            } catch (err) {
                alert('Phiên đăng nhập hết hạn hoặc lỗi máy chủ!');
                navigate('/login');
            }
        };
        fetchDashboardData();
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
                        <p className="text-blue-300 text-sm mt-0.5">Xin chào, <b className="text-white">{profile?.full_name || user.full_name || 'Khách thuê'}</b></p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition">
                        Đăng xuất
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6">
                {/* Profile & Room Info */}
                {profile && (
                    <div className="bg-white rounded-xl shadow p-5 mb-6 border-l-4 border-blue-500">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Thông tin Hợp đồng & Cá nhân</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Họ và tên: <b className="text-gray-800">{profile.full_name || 'Chưa cập nhật'}</b></p>
                                <p className="text-gray-500 mb-1">Số điện thoại: <b className="text-gray-800">{profile.phone || 'Chưa cập nhật'}</b></p>
                                <p className="text-gray-500 mb-1">CCCD: <b className="text-gray-800">{profile.id_card || 'Chưa cập nhật'}</b></p>
                                <p className="text-gray-500">Quê quán: <b className="text-gray-800">{profile.hometown || 'Chưa cập nhật'}</b></p>
                            </div>
                            <div className="md:border-l md:pl-4">
                                <p className="text-gray-500 mb-1">Đang thuê: <b className="text-blue-600 text-base">{profile.room_name || 'Chưa xếp phòng'}</b></p>
                                <p className="text-gray-500 mb-1">Giá thuê: <b className="text-red-500">{profile.price ? fmt(profile.price) : '?'} / tháng</b></p>
                                <p className="text-gray-500 mb-1">Tiện nghi: <b className="text-gray-800">{profile.amenities || 'Không có'}</b></p>
                                {profile.start_date && <p className="text-gray-500">Ngày thuê: <b className="text-gray-800">{new Date(profile.start_date).toLocaleDateString('vi-VN')}</b></p>}
                            </div>
                        </div>
                    </div>
                )}

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

                {/* Nhắc nhở thanh toán nếu từ mùng 5 đến 10 hàng tháng */}
                {(() => {
                    const currentDay = new Date().getDate();
                    if (currentDay >= 5 && currentDay <= 10 && tongChuaThu > 0) {
                        return (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-5 rounded-r-xl shadow-sm animate-pulse">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-3">🔔</span>
                                    <div>
                                        <h3 className="font-black text-lg">Nhắc nhở đóng tiền nhà!</h3>
                                        <p className="text-sm">Đã sắp đến hạn chót thanh toán (mùng 10 hàng tháng). Vui lòng quét mã QR bên dưới để thanh toán sớm nhé!</p>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

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

                                    {/* Thông tin chuyển khoản QR Code nếu chưa thanh toán */}
                                    {!invoice.is_paid && settings?.bank_name && settings?.bank_account && (
                                        <div className="mt-5 pt-4 border-t-2 border-dashed flex flex-col items-center bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm font-bold text-gray-700 mb-3 text-center uppercase">Quét mã QR để thanh toán</p>
                                            <img 
                                                src={`https://img.vietqr.io/image/${settings.bank_name}-${settings.bank_account}-compact2.jpg?amount=${invoice.total_amount}&addInfo=${encodeURIComponent(`Thanh toan tien phong ${invoice.room_name} thang ${invoice.month_year}`)}&accountName=${encodeURIComponent(settings.bank_owner || '')}`}
                                                alt="Mã QR Thanh Toán"
                                                className="w-48 h-48 object-contain bg-white p-2 rounded-xl shadow-md border"
                                            />
                                            <div className="mt-4 text-center text-sm space-y-1">
                                                <p className="text-gray-500">Ngân hàng: <b className="text-gray-800">{settings.bank_name}</b></p>
                                                <p className="text-gray-500">Số tài khoản: <b className="text-blue-600">{settings.bank_account}</b></p>
                                                <p className="text-gray-500">Chủ tài khoản: <b className="text-gray-800">{settings.bank_owner || '---'}</b></p>
                                                <p className="text-gray-500">Nội dung CK: <b className="text-orange-600">Thanh toan tien phong {invoice.room_name} thang {invoice.month_year}</b></p>
                                            </div>
                                        </div>
                                    )}
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
