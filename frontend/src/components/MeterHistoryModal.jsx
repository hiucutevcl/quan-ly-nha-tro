import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MeterHistoryModal = ({ room, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        axios.get(`http://localhost:5000/api/invoices/meter-history/${room.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setHistory(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [room.id]);

    const fmt = (v) => Number(v || 0).toLocaleString('vi-VN');

    const fmtMonth = (m) => {
        if (!m) return '—';
        const [y, mo] = m.split('-');
        return `Tháng ${mo}/${y}`;
    };

    // Tìm giá trị max để vẽ thanh bar
    const maxElec = Math.max(...history.map(h => h.elec_used || 0), 1);
    const maxWater = Math.max(...history.map(h => h.water_used || 0), 1);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-5 rounded-t-2xl flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black">📊 Lịch Sử Chỉ Số Điện Nước</h2>
                        <p className="text-blue-200 text-sm mt-0.5">Phòng: <b className="text-white">{room.room_name}</b></p>
                    </div>
                    <button onClick={onClose} className="text-blue-200 hover:text-white bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center font-bold transition text-lg">✕</button>
                </div>

                {/* Nội dung */}
                <div className="overflow-y-auto flex-1 p-5">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">⏳ Đang tải lịch sử...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-10">
                            <span className="text-4xl block mb-2">📭</span>
                            <p className="text-gray-400">Chưa có hóa đơn nào cho phòng này.</p>
                            <p className="text-gray-300 text-sm">Tạo hóa đơn đầu tiên để bắt đầu lưu lịch sử.</p>
                        </div>
                    ) : (
                        <>
                            {/* Thẻ tóm tắt */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                                    <p className="text-xs text-blue-500 font-bold uppercase mb-1">Tổng tháng đã ghi</p>
                                    <p className="text-2xl font-black text-blue-700">{history.length}</p>
                                </div>
                                <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
                                    <p className="text-xs text-yellow-600 font-bold uppercase mb-1">⚡ Tiêu thụ trung bình</p>
                                    <p className="text-2xl font-black text-yellow-700">
                                        {Math.round(history.reduce((s, h) => s + (h.elec_used || 0), 0) / history.length)}
                                        <span className="text-sm font-normal"> kWh</span>
                                    </p>
                                </div>
                                <div className="bg-cyan-50 rounded-xl p-3 text-center border border-cyan-100">
                                    <p className="text-xs text-cyan-600 font-bold uppercase mb-1">💧 Tiêu thụ trung bình</p>
                                    <p className="text-2xl font-black text-cyan-700">
                                        {Math.round(history.reduce((s, h) => s + (h.water_used || 0), 0) / history.length)}
                                        <span className="text-sm font-normal"> m³</span>
                                    </p>
                                </div>
                            </div>

                            {/* Bảng chi tiết */}
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-3 py-3 text-left">Tháng</th>
                                            <th className="px-3 py-3 text-center bg-yellow-50 text-yellow-700">⚡ Số cũ</th>
                                            <th className="px-3 py-3 text-center bg-yellow-50 text-yellow-700">⚡ Số mới</th>
                                            <th className="px-3 py-3 text-center bg-yellow-50 text-yellow-700">⚡ Dùng</th>
                                            <th className="px-3 py-3 text-center bg-cyan-50 text-cyan-700">💧 Số cũ</th>
                                            <th className="px-3 py-3 text-center bg-cyan-50 text-cyan-700">💧 Số mới</th>
                                            <th className="px-3 py-3 text-center bg-cyan-50 text-cyan-700">💧 Dùng</th>
                                            <th className="px-3 py-3 text-center">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {history.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition">
                                                <td className="px-3 py-3 font-bold text-gray-700 whitespace-nowrap">{fmtMonth(row.month_year)}</td>

                                                {/* Điện */}
                                                <td className="px-3 py-2 text-center text-gray-500 bg-yellow-50/50">{fmt(row.old_elec)}</td>
                                                <td className="px-3 py-2 text-center font-semibold bg-yellow-50/50">{fmt(row.new_elec)}</td>
                                                <td className="px-3 py-2 bg-yellow-50/50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[40px]">
                                                            <div
                                                                className="bg-yellow-400 h-2 rounded-full"
                                                                style={{ width: `${Math.round((row.elec_used / maxElec) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-yellow-700 whitespace-nowrap">{fmt(row.elec_used)} số</span>
                                                    </div>
                                                </td>

                                                {/* Nước */}
                                                <td className="px-3 py-2 text-center text-gray-500 bg-cyan-50/50">{fmt(row.old_water)}</td>
                                                <td className="px-3 py-2 text-center font-semibold bg-cyan-50/50">{fmt(row.new_water)}</td>
                                                <td className="px-3 py-2 bg-cyan-50/50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[40px]">
                                                            <div
                                                                className="bg-cyan-400 h-2 rounded-full"
                                                                style={{ width: `${Math.round((row.water_used / maxWater) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-cyan-700 whitespace-nowrap">{fmt(row.water_used)} khối</span>
                                                    </div>
                                                </td>

                                                <td className="px-3 py-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.is_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                        {row.is_paid ? '✅ Đã thu' : '⏳ Chưa thu'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeterHistoryModal;
