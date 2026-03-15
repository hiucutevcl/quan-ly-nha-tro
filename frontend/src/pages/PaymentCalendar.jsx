import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentCalendar = () => {
    const [invoices, setInvoices] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7) // YYYY-MM
    );

    const token = localStorage.getItem('token');
    const apiHeaders = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        Promise.all([
            axios.get('https://api-quan-ly-nha-tro.onrender.com/api/invoices/all', apiHeaders),
            axios.get('https://api-quan-ly-nha-tro.onrender.com/api/rooms/all', apiHeaders),
        ]).then(([resInvoices, resRooms]) => {
            setInvoices(resInvoices.data);
            setRooms(resRooms.data);
            setLoading(false);
        });
    }, []);

    const handlePayInvoice = async (id) => {
        if (!window.confirm('Xác nhận đã thu tiền hóa đơn này?')) return;
        try {
            await axios.put(`https://api-quan-ly-nha-tro.onrender.com/api/invoices/pay/${id}`, {}, apiHeaders);
            setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, is_paid: 1 } : inv));
        } catch (e) {
            alert('Lỗi: ' + e.message);
        }
    };

    const fmt = (v) => Number(v || 0).toLocaleString('vi-VN') + 'đ';

    // Lọc hóa đơn theo tháng đang chọn
    const filtered = invoices.filter(inv => inv.month_year === selectedMonth);
    const chuaThu = filtered.filter(inv => !inv.is_paid);
    const daThu = filtered.filter(inv => inv.is_paid);
    const tongChuaThu = chuaThu.reduce((s, i) => s + Number(i.total_amount), 0);
    const tongDaThu = daThu.reduce((s, i) => s + Number(i.total_amount), 0);

    // Danh sách phòng chưa có hóa đơn tháng này
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied');
    const roomsWithInvoice = new Set(filtered.map(inv => inv.room_id));
    const missingInvoice = occupiedRooms.filter(r => !roomsWithInvoice.has(r.id));

    if (loading) return <div className="text-center py-10 text-gray-500">Đang tải...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-black text-gray-800 uppercase">📅 Lịch Thu Tiền</h1>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-bold text-gray-600">Tháng:</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="border-2 rounded-lg px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 text-center shadow border-t-4 border-blue-500">
                    <p className="text-2xl font-black text-blue-600">{filtered.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Tổng hóa đơn</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow border-t-4 border-red-500">
                    <p className="text-2xl font-black text-red-600">{chuaThu.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Chưa thu</p>
                    <p className="text-xs text-red-500 font-bold">{Number(tongChuaThu).toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow border-t-4 border-green-500">
                    <p className="text-2xl font-black text-green-600">{daThu.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Đã thu</p>
                    <p className="text-xs text-green-600 font-bold">{Number(tongDaThu).toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow border-t-4 border-orange-400">
                    <p className="text-2xl font-black text-orange-500">{missingInvoice.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Chưa lập hóa đơn</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                {/* Cột trái: Chưa thu */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="bg-red-600 text-white px-4 py-3 font-bold flex items-center gap-2">
                        <span>⏳ Chưa Thu ({chuaThu.length})</span>
                    </div>
                    {chuaThu.length === 0 ? (
                        <div className="text-center py-8 text-green-500">
                            <span className="text-4xl block mb-2">✅</span>
                            <p className="font-semibold">Đã thu hết tiền tháng này!</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {chuaThu.map(inv => (
                                <div key={inv.id} className="px-4 py-3 flex justify-between items-center hover:bg-red-50 transition">
                                    <div>
                                        <p className="font-bold text-gray-800">🏠 {inv.room_name}</p>
                                        <p className="text-xs text-gray-500">{inv.tenant_name || 'Chưa có khách'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-red-600">{fmt(inv.total_amount)}</p>
                                        <button
                                            onClick={() => handlePayInvoice(inv.id)}
                                            className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-bold hover:bg-green-700 transition mt-1"
                                        >
                                            ✅ Thu tiền
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cột phải: Đã thu + Chưa lập */}
                <div className="space-y-4">
                    {/* Đã thu */}
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="bg-green-600 text-white px-4 py-3 font-bold flex items-center gap-2">
                            <span>✅ Đã Thu ({daThu.length})</span>
                        </div>
                        {daThu.length === 0 ? (
                            <div className="text-center py-4 text-gray-400 text-sm">Chưa thu được phòng nào</div>
                        ) : (
                            <div className="divide-y max-h-48 overflow-y-auto">
                                {daThu.map(inv => (
                                    <div key={inv.id} className="px-4 py-2 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-sm text-gray-800">🏠 {inv.room_name}</p>
                                            <p className="text-xs text-gray-400">{inv.tenant_name}</p>
                                        </div>
                                        <p className="font-bold text-green-600 text-sm">{fmt(inv.total_amount)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chưa lập hóa đơn */}
                    {missingInvoice.length > 0 && (
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="bg-orange-500 text-white px-4 py-3 font-bold">
                                ⚠️ Chưa Lập Hóa Đơn ({missingInvoice.length} phòng)
                            </div>
                            <div className="divide-y">
                                {missingInvoice.map(room => (
                                    <div key={room.id} className="px-4 py-2 flex justify-between items-center">
                                        <p className="font-semibold text-sm">🏠 {room.room_name}</p>
                                        <span className="text-xs text-orange-500 font-bold">Chưa có HĐ tháng này</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentCalendar;
