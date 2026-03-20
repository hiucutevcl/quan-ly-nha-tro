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
    const siteName = settings?.nha_tro_name || 'Hệ thống Nhà Trọ';
    const logoImg = settings?.logo_image;

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
            <div className="text-center text-slate-500">
                <div className="text-5xl mb-4 animate-bounce">⏳</div>
                <p className="font-semibold text-slate-600">Đang tải dữ liệu của bạn...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
            {/* Header / Topbar */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {logoImg ? (
                            <img src={logoImg} alt="Logo" className="h-10 max-w-[120px] object-contain rounded-lg" />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm">
                                H
                            </div>
                        )}
                        <div>
                            <h1 className="text-[15px] font-extrabold tracking-tight leading-tight text-slate-900 uppercase">
                                Cư Dân <span className="text-indigo-600">{siteName}</span>
                            </h1>
                            <p className="text-slate-500 text-xs font-semibold mt-0.5">Xin chào, <b className="text-slate-800">{profile?.full_name || user.full_name || 'Khách thuê'}</b></p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                        Đăng xuất
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-8 shrink-0">
                {/* Profile & Room Info */}
                {profile && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-70 translate-x-1/2 -translate-y-1/2" />
                        
                        <h2 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center gap-2">
                            <span className="text-indigo-600">👤</span> Thông tin Hợp đồng & Cá nhân
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                                <p className="text-slate-500 flex justify-between"><span>Họ và tên:</span> <b className="text-slate-800 text-right">{profile.full_name || 'Chưa cập nhật'}</b></p>
                                <p className="text-slate-500 flex justify-between"><span>Số điện thoại:</span> <b className="text-slate-800 text-right">{profile.phone || 'Chưa cập nhật'}</b></p>
                                <p className="text-slate-500 flex justify-between"><span>CCCD:</span> <b className="text-slate-800 text-right">{profile.id_card || 'Chưa cập nhật'}</b></p>
                                <p className="text-slate-500 flex justify-between"><span>Quê quán:</span> <b className="text-slate-800 text-right">{profile.hometown || 'Chưa cập nhật'}</b></p>
                            </div>
                            <div className="space-y-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-sm">
                                <p className="text-slate-500 flex justify-between items-center">
                                    <span>Đang thuê:</span> 
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-black text-base">{profile.room_name || 'Chưa xếp phòng'}</span>
                                </p>
                                <p className="text-slate-500 flex justify-between"><span>Giá thuê:</span> <b className="text-rose-600 font-bold">{profile.price ? fmt(profile.price) : '?'} / tháng</b></p>
                                <p className="text-slate-500 flex justify-between"><span>Tiện nghi:</span> <b className="text-slate-800 text-right max-w-[60%] truncate" title={profile.amenities}>{profile.amenities || 'Không có'}</b></p>
                                {profile.start_date && <p className="text-slate-500 flex justify-between"><span>Ngày thuê:</span> <b className="text-slate-800 text-right">{new Date(profile.start_date).toLocaleDateString('vi-VN')}</b></p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Thống kê nhanh */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl mx-auto mb-3">📄</div>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{invoices.length}</p>
                        <p className="text-sm font-semibold text-slate-500 mt-1">Tổng hóa đơn</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow ring-1 ring-emerald-500/10">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-3">✅</div>
                        <p className="text-3xl font-black text-emerald-600 tracking-tight">{invoices.filter(i => i.is_paid).length}</p>
                        <p className="text-sm font-semibold text-slate-500 mt-1">Đã thanh toán</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow ring-1 ring-rose-500/10">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto mb-3">⏳</div>
                        <p className="text-3xl font-black text-rose-600 tracking-tight">{invoices.filter(i => !i.is_paid).length}</p>
                        <p className="text-sm font-semibold text-slate-500 mt-1">Chưa đóng</p>
                    </div>
                </div>

                {/* Alerts */}
                <div className="space-y-4 mb-8">
                    {tongChuaThu > 0 && (
                        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xl font-bold shrink-0">!</div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base mb-1">Cần thanh toán hóa đơn</h3>
                                <p className="text-slate-600 text-sm">Bạn đang có tổng dư nợ <b className="text-rose-600 text-lg ml-1">{fmt(tongChuaThu)}</b></p>
                            </div>
                        </div>
                    )}

                    {/* Nhắc nhở thanh toán nếu từ mùng 5 đến 10 hàng tháng */}
                    {(() => {
                        const currentDay = new Date().getDate();
                        if (currentDay >= 5 && currentDay <= 10 && tongChuaThu > 0) {
                            return (
                                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm flex items-start gap-4 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xl font-bold shrink-0 animate-pulse">
                                        ⏳
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-amber-900 text-base mb-1">Đã gần sát ngày chót!</h3>
                                        <p className="text-amber-800 text-sm leading-relaxed">Sắp đến hạn chót thanh toán kỳ này (ngày 10 hàng tháng). Vui lòng hoàn tất thanh toán sớm để tránh hệ thống phạt chậm đóng.</p>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 tracking-tight">
                        <span className="text-indigo-500">🧾</span> Lịch sử hóa đơn
                    </h2>
                </div>

                {invoices.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-200 border-dashed">
                        <span className="text-6xl block mb-4">📭</span>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Chưa có hóa đơn nào</h3>
                        <p className="text-slate-500 text-sm">Cư dân mới chưa có lịch sử thanh toán.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {invoices.map(invoice => (
                            <div key={invoice.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Header thẻ */}
                                <div className={`px-6 py-4 flex justify-between items-center bg-slate-50/50 border-b border-slate-100`}>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Kỳ cước</p>
                                        <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                                            Tháng {invoice.month_year?.split('-')[1]}/{invoice.month_year?.split('-')[0]}
                                        </h3>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border
                                        ${invoice.is_paid 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                                            : 'bg-rose-50 text-rose-700 border-rose-200/60'}`}>
                                        {invoice.is_paid ? '✅ ĐÃ THANH TOÁN' : '⏳ CHƯA ĐÓNG'}
                                    </span>
                                </div>

                                {/* Chi tiết */}
                                <div className="p-6">
                                    <div className="space-y-3.5 mb-6">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium flex items-center gap-2"><span className="text-slate-300">|</span> 🏠 Tiền phòng</span>
                                            <span className="font-bold text-slate-800">{fmt(invoice.room_fee)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium flex items-center gap-2"><span className="text-indigo-300">|</span> ⚡ Điện ({invoice.old_elec} → {invoice.new_elec} số)</span>
                                            <span className="font-bold text-slate-800">{fmt(invoice.elec_fee)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium flex items-center gap-2"><span className="text-sky-300">|</span> 💧 Nước ({invoice.old_water} → {invoice.new_water} khối)</span>
                                            <span className="font-bold text-slate-800">{fmt(invoice.water_fee)}</span>
                                        </div>
                                        {Number(invoice.trash_fee) > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium flex items-center gap-2"><span className="text-emerald-300">|</span> ♻️ Rác/Vệ sinh</span>
                                                <span className="font-bold text-slate-800">{fmt(invoice.trash_fee)}</span>
                                            </div>
                                        )}
                                        {Number(invoice.wifi_fee) > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium flex items-center gap-2"><span className="text-violet-300">|</span> 📶 Internet</span>
                                                <span className="font-bold text-slate-800">{fmt(invoice.wifi_fee)}</span>
                                            </div>
                                        )}
                                        {Number(invoice.parking_fee) > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium flex items-center gap-2"><span className="text-amber-300">|</span> 🏍️ Gửi xe ({invoice.parking_count} xe)</span>
                                                <span className="font-bold text-slate-800">{fmt(invoice.parking_fee)}</span>
                                            </div>
                                        )}
                                        {Number(invoice.old_debt) > 0 && (
                                            <div className="flex justify-between items-center text-sm pt-3 mt-1 border-t border-slate-100">
                                                <span className="text-rose-600 font-bold flex items-center gap-2">⚠️ Nợ kỳ trước</span>
                                                <span className="font-bold text-rose-600">{fmt(invoice.old_debt)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-5 border-t-2 border-dashed border-slate-200 bg-slate-50 -mx-6 -mb-6 px-6 pb-6">
                                        <span className="font-extrabold text-slate-500 uppercase text-xs tracking-widest">TỔNG THANH TOÁN</span>
                                        <span className={`text-2xl font-black ${invoice.is_paid ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                            {fmt(invoice.total_amount)}
                                        </span>
                                    </div>

                                    {/* Thông tin chuyển khoản QR Code nếu chưa thanh toán */}
                                    {!invoice.is_paid && settings?.bank_name && settings?.bank_account && (
                                        <div className="mt-12 mb-2 p-6 rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 flex flex-col md:flex-row items-center gap-6">
                                            <div className="shrink-0 bg-white p-3 rounded-2xl shadow-sm border border-indigo-100 relative group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
                                                <img 
                                                    src={`https://img.vietqr.io/image/${settings.bank_name}-${settings.bank_account}-compact2.jpg?amount=${invoice.total_amount}&addInfo=${encodeURIComponent(`Thanh toan tien phong ${invoice.room_name} thang ${invoice.month_year}`)}&accountName=${encodeURIComponent(settings.bank_owner || '')}`}
                                                    alt="Mã QR Thanh Toán"
                                                    className="w-40 h-40 object-contain"
                                                />
                                                <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                                    <span className="bg-white/90 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Lưu mã QR</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="text-[13px] font-black text-indigo-600 tracking-widest uppercase mb-4">Thông tin chuyển khoản</h4>
                                                <div className="space-y-2.5 text-sm">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-indigo-100/50 pb-2">
                                                        <span className="text-slate-500 font-medium">Ngân hàng</span>
                                                        <b className="text-slate-800">{settings.bank_name}</b>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-indigo-100/50 pb-2">
                                                        <span className="text-slate-500 font-medium">Chủ tài khoản</span>
                                                        <b className="text-slate-800 uppercase">{settings.bank_owner || '---'}</b>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-indigo-100/50 pb-2">
                                                        <span className="text-slate-500 font-medium">Số tài khoản</span>
                                                        <b className="text-indigo-600 font-bold text-base tracking-wide flex items-center gap-2">
                                                            {settings.bank_account}
                                                        </b>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 pt-1">
                                                        <span className="text-slate-500 font-medium">Nội dung CK</span>
                                                        <b className="text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs select-all">Thanh toan tien phong {invoice.room_name} thang {invoice.month_year}</b>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Footer simple */}
                <div className="mt-12 text-center text-xs text-slate-400 font-medium">
                    © {new Date().getFullYear()} {siteName}. Nền tảng cư dân.
                </div>
            </div>
        </div>
    );
};

export default TenantInvoices;
