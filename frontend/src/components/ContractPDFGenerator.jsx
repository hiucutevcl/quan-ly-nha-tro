import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import axios from 'axios';

/**
 * ContractPDFGenerator - Sinh PDF hợp đồng thuê nhà
 * @param {object} room - Thông tin phòng (room_name, price, amenities, start_date, end_date, tenant_name)
 * @param {object} tenant - Thông tin khách thuê (full_name, phone, id_card, hometown)
 */
const ContractPDFGenerator = ({ room, tenant, onClose }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('https://api-quan-ly-nha-tro.onrender.com/api/settings', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setSettings(res.data);
            } catch (err) {
                console.error("Lỗi lấy cài đặt:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const landlordName = settings.nha_tro_name || settings.owner || 'Chủ nhà trọ';
    const address = settings.address || 'Địa chỉ nhà trọ';
    const phone = settings.phone || 'SĐT chủ trọ';
    const tenantName = room.tenant_name || tenant?.full_name || 'Khách thuê';
    const tenantPhone = tenant?.phone || '---';
    const tenantIdCard = tenant?.id_card || '---';
    const tenantHometown = tenant?.hometown || '---';

    const today = new Date();
    const formatDate = (d) => {
        if (!d) return '___/___/______';
        const dt = new Date(d);
        return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
    };

    const handleGenerate = () => {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        // Helper functions
        const addLine = (y) => { doc.setDrawColor(180); doc.line(15, y, 195, y); };
        const bold = (sz = 12) => { doc.setFontSize(sz); doc.setFont('helvetica', 'bold'); };
        const normal = (sz = 11) => { doc.setFontSize(sz); doc.setFont('helvetica', 'normal'); };

        // ========== Header ==========
        doc.setFillColor(37, 99, 235); doc.rect(0, 0, 210, 28, 'F');
        doc.setTextColor(255, 255, 255);
        bold(16); doc.text('HOP DONG THUE PHONG TRO', 105, 12, { align: 'center' });
        normal(10); doc.text('RENTAL AGREEMENT', 105, 20, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        let y = 38;

        // Số hợp đồng + ngày
        normal(10);
        doc.text(`So hop dong: HD-${room.id}-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}`, 15, y);
        doc.text(`Ngay lap: ${formatDate(today)}`, 195, y, { align: 'right' });
        y += 8; addLine(y); y += 5;

        // Bên A - Chủ nhà
        bold(12); doc.text('BEN A - CHU NHA (BEN CHO THUE)', 15, y); y += 7;
        normal(11);
        doc.text(`Ho va ten: ${landlordName}`, 20, y); y += 6;
        doc.text(`Dia chi nha tro: ${address}`, 20, y); y += 6;
        doc.text(`So dien thoai: ${phone}`, 20, y); y += 7;
        addLine(y); y += 5;

        // Bên B - Khách thuê
        bold(12); doc.text('BEN B - NGUOI THUE', 15, y); y += 7;
        normal(11);
        doc.text(`Ho va ten: ${tenantName}`, 20, y); y += 6;
        doc.text(`CCCD/CMND: ${tenantIdCard}`, 20, y); y += 6;
        doc.text(`So dien thoai: ${tenantPhone}`, 20, y); y += 6;
        doc.text(`Que quan: ${tenantHometown}`, 20, y); y += 7;
        addLine(y); y += 5;

        // Điều khoản thuê
        bold(12); doc.text('NOI DUNG HOP DONG', 15, y); y += 7;
        normal(11);
        doc.text(`Dieu 1: Phong thue: ${room.room_name}`, 20, y); y += 6;
        doc.text(`Dieu 2: Gia thue: ${Number(room.price).toLocaleString('vi-VN')} dong/thang`, 20, y); y += 6;
        doc.text(`Dieu 3: Ngay bat dau: ${formatDate(room.start_date)}`, 20, y); y += 6;
        doc.text(`Dieu 4: Ngay ket thuc: ${formatDate(room.end_date)}`, 20, y); y += 6;
        doc.text(`Dieu 5: Gia dien: 4.000 dong/kWh  |  Gia nuoc: 30.000 dong/m3`, 20, y); y += 6;
        if (room.amenities) {
            doc.text(`Dieu 6: Tien nghi: ${room.amenities}`, 20, y); y += 6;
        }
        y += 2; addLine(y); y += 5;

        // Nghĩa vụ
        bold(11); doc.text('NGHIA VU CAC BEN', 15, y); y += 6;
        normal(10);
        const terms = [
            '- Ben B co nghia vu dong tien thue dung han vao ngay 5 hang thang.',
            '- Ben B khong duoc cho thue lai, khong lam anh huong nguoi xung quanh.',
            '- Ben B co nghia vu giu gin ve sinh, bao quan tai san trong phong.',
            '- Khi tra phong, Ben B phai bao truoc 30 ngay.',
            '- Hai ben cam ket thuc hien dung hop dong.'
        ];
        terms.forEach(t => { doc.text(t, 20, y); y += 5.5; });
        y += 3; addLine(y); y += 8;

        // Chữ ký
        bold(11);
        doc.text('BEN A KY TEN', 45, y, { align: 'center' });
        doc.text('BEN B KY TEN', 165, y, { align: 'center' });
        y += 5; normal(10);
        doc.text('(Chu nha tro)', 45, y, { align: 'center' });
        doc.text('(Nguoi thue)', 165, y, { align: 'center' });
        y += 20;
        doc.text(landlordName, 45, y, { align: 'center' });
        doc.text(tenantName, 165, y, { align: 'center' });

        // Footer
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 285, 210, 12, 'F');
        doc.setTextColor(255, 255, 255);
        normal(9);
        doc.text(`${landlordName} | ${address} | ${phone}`, 105, 292, { align: 'center' });

        doc.save(`HopDong_${room.room_name}_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}.pdf`);
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
                <h2 className="text-xl font-black text-gray-800 mb-2">📋 In Hợp Đồng Thuê Nhà</h2>
                <p className="text-gray-500 text-sm mb-5">Hệ thống sẽ tạo bản PDF hợp đồng với thông tin bên dưới:</p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 mb-5 border">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Phòng:</span>
                        <span className="font-bold">{room.room_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Khách thuê:</span>
                        <span className="font-bold">{room.tenant_name || '---'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Giá thuê:</span>
                        <span className="font-bold">{Number(room.price).toLocaleString('vi-VN')}đ/tháng</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Từ ngày:</span>
                        <span className="font-bold">{room.start_date ? new Date(room.start_date).toLocaleDateString('vi-VN') : '---'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Đến ngày:</span>
                        <span className="font-bold">{room.end_date ? new Date(room.end_date).toLocaleDateString('vi-VN') : '---'}</span>
                    </div>
                </div>
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg mb-4">
                    💡 Thông tin Chủ nhà được lấy từ tab <b>⚙️ Cài đặt</b>. Hãy điền đầy đủ trước khi in.
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`flex-1 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                        {loading ? '⏳ Đang tải...' : '📄 Tải PDF về máy'}
                    </button>
                    <button onClick={onClose} className="px-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition">
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractPDFGenerator;
