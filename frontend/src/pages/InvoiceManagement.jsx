import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InvoicePDFExport from '../components/InvoicePDFExport';
import * as XLSX from 'xlsx';

const InvoiceManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [allRooms, setAllRooms] = useState([]); // Lưu dữ liệu phòng đầy đủ để auto-fill
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterPaid, setFilterPaid] = useState('all'); // 'all' | 'paid' | 'unpaid'
    
    // Form Dữ liệu lập Hóa Đơn
    const [invoiceData, setInvoiceData] = useState({
        room_id: '', month_year: new Date().toISOString().slice(0, 7),
        old_elec: '', new_elec: '', old_water: '', new_water: '',
        parking_count: 0, is_wifi: true, is_trash: true
    });

    const token = localStorage.getItem('token');
    const apiHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        try {
            const resRooms = await axios.get('https://api-quan-ly-nha-tro.onrender.com/api/invoices/rooms', apiHeaders);
            const resAllRooms = await axios.get('https://api-quan-ly-nha-tro.onrender.com/api/rooms/all', apiHeaders);
            const resInvoices = await axios.get('https://api-quan-ly-nha-tro.onrender.com/api/invoices/all', apiHeaders);
            setRooms(resRooms.data);
            setAllRooms(resAllRooms.data);
            setInvoices(resInvoices.data);
            setLoading(false);
        } catch (error) {
            alert('Lỗi lấy dữ liệu: ' + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target;
        setInvoiceData({ ...invoiceData, [name]: type === 'checkbox' ? checked : value });
    };

    // Khi Admin chọn phòng, tự điền số cũ từ đồng hồ
    const handleRoomSelect = (e) => {
        const selectedRoomId = e.target.value;
        const roomInfo = allRooms.find(r => String(r.id) === String(selectedRoomId));
        if (roomInfo) {
            setInvoiceData(prev => ({
                ...prev,
                room_id: selectedRoomId,
                old_elec: roomInfo.current_elec ?? '',
                old_water: roomInfo.current_water ?? ''
            }));
        } else {
            setInvoiceData(prev => ({...prev, room_id: selectedRoomId}));
        }
    };

    // Tạo hóa đơn mới
    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://api-quan-ly-nha-tro.onrender.com/api/invoices/create', invoiceData, apiHeaders);
            alert('Tạo hóa đơn thành công! Tổng tiền: ' + res.data.total_amount.toLocaleString() + 'đ');
            setInvoiceData({...invoiceData, room_id: '', old_elec: '', new_elec: '', old_water: '', new_water: '', parking_count: 0});
            fetchData();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể tạo hóa đơn'));
        }
    };

    // Thu Tiền
    const handlePay = async (id) => {
        if (!window.confirm('Chắc chắn khách đã nộp tiền cho hóa đơn này?')) return;
        try {
            await axios.put(`https://api-quan-ly-nha-tro.onrender.com/api/invoices/pay/${id}`, {}, apiHeaders);
            fetchData();
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật thanh toán!');
        }
    };

    // Lọc hóa đơn theo tìm kiếm và trạng thái
    const filteredInvoices = invoices.filter(inv => {
        const matchSearch = !search || 
            inv.room_name?.toLowerCase().includes(search.toLowerCase()) ||
            inv.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
            inv.month_year?.includes(search);
        const matchPaid = filterPaid === 'all' || 
            (filterPaid === 'paid' && inv.is_paid) || 
            (filterPaid === 'unpaid' && !inv.is_paid);
        return matchSearch && matchPaid;
    });

    // Xuất Excel
    const exportToExcel = () => {
        const data = filteredInvoices.map(inv => ({
            'Phòng': inv.room_name,
            'Khách Thuê': inv.tenant_name || '---',
            'Tháng': inv.month_year,
            'Tiền Nhà (đ)': Number(inv.room_price || 0),
            'Điện Số Cũ': Number(inv.old_elec || 0),
            'Điện Số Mới': Number(inv.new_elec || 0),
            'Tiêu Thụ Điện (kWh)': Number(inv.new_elec || 0) - Number(inv.old_elec || 0),
            'Tiền Điện (đ)': Number(inv.elec_fee || 0),
            'Nước Số Cũ': Number(inv.old_water || 0),
            'Nước Số Mới': Number(inv.new_water || 0),
            'Tiêu Thụ Nước (m³)': Number(inv.new_water || 0) - Number(inv.old_water || 0),
            'Tiền Nước (đ)': Number(inv.water_fee || 0),
            'Dịch Vụ Khác (đ)': Number(inv.wifi_fee || 0) + Number(inv.trash_fee || 0) + Number(inv.parking_fee || 0),
            'Nợ Cũ (đ)': Number(inv.previous_debt || 0),
            'Tổng Cộng (đ)': Number(inv.total_amount || 0),
            'Trạng Thái': inv.is_paid ? 'Đã thu' : 'Chưa thu'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Hoa Don');
        const month = new Date().toISOString().slice(0,7);
        XLSX.writeFile(wb, `BaoCao_HoaDon_${month}.xlsx`);
    };

    if (loading) return <div className="text-center mt-10">Đang tải dữ liệu hóa đơn...</div>;

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-indigo-800 uppercase">Nghiệp vụ Hóa Đơn & Thu Tiền</h1>
                <button
                    onClick={exportToExcel}
                    disabled={filteredInvoices.length === 0}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition disabled:opacity-40"
                >
                    📤 Xuất Excel ({filteredInvoices.length} HĐ)
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {/* Cột 1: Form Tạo Hóa Đơn Mới */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500 lg:col-span-1 border">
                    <h2 className="text-lg font-bold mb-4 text-gray-700">LẬP HÓA ĐƠN THÁNG</h2>
                    <form onSubmit={handleCreateInvoice}>
                        <div className="mb-3">
                            <label className="block text-xs font-bold mb-1 text-gray-600">Phòng Khách</label>
                            <select className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-400" required
                                name="room_id" value={invoiceData.room_id} onChange={handleRoomSelect}>
                                <option value="">- Chọn Phòng -</option>
                                {rooms.filter(r => r.status === 'Occupied').map(room => (
                                    <option key={room.id} value={room.id}>{room.room_name} ({room.tenant_name})</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="block text-xs font-bold mb-1 text-gray-600">Tháng Chốt</label>
                            <input type="month" className="w-full border p-2 rounded" required
                                name="month_year" value={invoiceData.month_year} onChange={handleInputChange} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-600">
                                    ⚡ Điện CŨ
                                </label>
                                <input type="number" className="w-full border p-2 rounded" required
                                    name="old_elec" value={invoiceData.old_elec} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-600 flex justify-between">
                                    <span>⚡ Điện MỚI</span>
                                    <span className="text-indigo-600 font-normal">4.000đ/kWh</span>
                                </label>
                                <input type="number" className="w-full border p-2 rounded bg-yellow-50" required
                                    name="new_elec" value={invoiceData.new_elec} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-600">
                                    💧 Nước CŨ
                                </label>
                                <input type="number" className="w-full border p-2 rounded" required
                                    name="old_water" value={invoiceData.old_water} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 text-gray-600 flex justify-between">
                                    <span>💧 Nước MỚI</span>
                                    <span className="text-indigo-600 font-normal">30.000đ/m³</span>
                                </label>
                                <input type="number" className="w-full border p-2 rounded bg-indigo-50" required
                                    name="new_water" value={invoiceData.new_water} onChange={handleInputChange} />
                            </div>
                        </div>

                        {/* Dịch Vụ */}
                        <div className="p-3 bg-gray-100 rounded border border-gray-200 mb-5">
                            <label className="block text-xs font-bold mb-2 text-gray-700">DỊCH VỤ CỘNG THÊM</label>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">♻️ Thu gom rác (30K)</span>
                                <input type="checkbox" className="w-4 h-4" name="is_trash" checked={invoiceData.is_trash} onChange={handleInputChange}/>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">📶 Internet Wifi (100K)</span>
                                <input type="checkbox" className="w-4 h-4" name="is_wifi" checked={invoiceData.is_wifi} onChange={handleInputChange}/>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">🏍️ Gửi xe (150K/xe)</span>
                                <input type="number" className="w-16 border rounded p-1 text-center" min="0" placeholder="Số xe" 
                                    name="parking_count" value={invoiceData.parking_count} onChange={handleInputChange}/>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-indigo-700 hover:bg-blue-800 text-white font-bold py-3 rounded shadow-lg transition">
                            PHÁT HÀNH HÓA ĐƠN
                        </button>
                    </form>
                </div>

                {/* Cột 2 + 3: Bảng danh sách Hóa Đơn */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden lg:col-span-2 border">
                    <div className="bg-gray-800 text-white p-4 font-bold flex flex-wrap justify-between items-center gap-2">
                        <span>LỊCH SỬ HÓA ĐƠN</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="🔍 Tìm phòng / khách / tháng..."
                                className="text-sm text-gray-800 border rounded px-2 py-1 w-48"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <select
                                className="text-sm text-gray-800 border rounded px-2 py-1"
                                value={filterPaid}
                                onChange={e => setFilterPaid(e.target.value)}
                            >
                                <option value="all">Tất cả</option>
                                <option value="unpaid">Chưa thu</option>
                                <option value="paid">Đã thu</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-3 py-3 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase">Phòng/Kỳ</th>
                                    <th className="px-3 py-3 bg-gray-100 text-right text-xs font-bold text-gray-600 uppercase">Tiền Phí</th>
                                    <th className="px-3 py-3 bg-gray-100 text-right text-xs font-bold text-red-600 uppercase">Tổng Đóng</th>
                                    <th className="px-3 py-3 bg-gray-100 text-center text-xs font-bold text-gray-600 uppercase">Trạng Thái & Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-10 text-slate-400">Không tìm thấy hóa đơn.</td></tr>
                                )}
                                {filteredInvoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50 border-b border-gray-200">
                                        <td className="px-3 py-4 text-sm">
                                            <p className="font-bold text-indigo-700 text-lg">{inv.room_name}</p>
                                            <p className="text-gray-500 text-xs">{inv.tenant_name}</p>
                                            <p className="text-gray-500">T{inv.month_year.split('-')[1]}/{inv.month_year.split('-')[0]}</p>
                                        </td>
                                        <td className="px-3 py-4 text-sm text-right text-gray-600">
                                            <p>Phòng: {Number(inv.room_fee).toLocaleString()}đ</p>
                                            <p>DV: {(Number(inv.trash_fee)||0) + (Number(inv.wifi_fee)||0) + (Number(inv.parking_fee)||0) > 0 
                                                ? ((Number(inv.trash_fee)||0) + (Number(inv.wifi_fee)||0) + (Number(inv.parking_fee)||0)).toLocaleString() + 'đ'
                                                : '—'}
                                            </p>
                                            {Number(inv.old_debt) > 0 && <p className="text-orange-500">Nợ cũ: {Number(inv.old_debt).toLocaleString()}đ</p>}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-right font-black text-red-500 text-lg">
                                            {Number(inv.total_amount).toLocaleString()}đ
                                        </td>
                                        <td className="px-3 py-4 text-sm text-center">
                                            <div className="flex flex-col gap-2 items-center">
                                                {inv.is_paid ? (
                                                    <span className="bg-emerald-50 text-emerald-700 py-1 px-3 rounded-full font-bold text-xs">ĐÃ THU</span>
                                                ) : (
                                                    <>
                                                        <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full font-bold text-xs">CHƯA THU</span>
                                                        <button onClick={() => handlePay(inv.id)} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                                                            💰 Nhận Tiền
                                                        </button>
                                                    </>
                                                )}
                                                <InvoicePDFExport invoice={inv} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceManagement;
