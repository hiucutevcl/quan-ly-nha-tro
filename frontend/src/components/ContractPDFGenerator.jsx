import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import axios from 'axios';

/**
 * ContractPDFGenerator - Sinh PDF hợp đồng thuê nhà phiên bản chi tiết (Legal Standard)
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

    const landlordName = settings.nha_tro_name || settings.owner || 'Chu nha tro';
    const address = settings.address || 'Dia chi nha tro';
    const phone = settings.phone || 'SDT chu tro';
    
    // Fallback if tenant info is somewhat missing
    const tenantName = room.tenant_name || tenant?.full_name || 'Khach thue';
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
        try {
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });

            // Helper function to remove accents for jsPDF standard font
            const removeDiacritics = (str) => {
                if (!str) return '';
                return str.toString()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
            };

            let y = 20;
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // Text formatting helpers
            const setBold = (sz = 12) => { doc.setFontSize(sz); doc.setFont('helvetica', 'bold'); };
            const setNormal = (sz = 11) => { doc.setFontSize(sz); doc.setFont('helvetica', 'normal'); };
            const setItalic = (sz = 11) => { doc.setFontSize(sz); doc.setFont('helvetica', 'italic'); };

            const checkPageBreak = (neededHeight) => {
                if (y + neededHeight > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }
            };

            // Wrapped Text print helper
            const addWrappedText = (text, x, indent, isBold, size) => {
                if (isBold) setBold(size);
                else setNormal(size);
                
                const lines = doc.splitTextToSize(removeDiacritics(text), 210 - x - indent - 15);
                lines.forEach(line => {
                    checkPageBreak(7);
                    doc.text(line, x + indent, y);
                    y += 6;
                });
            };

            // ========== Header: Quốc hiệu, Tiêu ngữ ==========
            setBold(12);
            doc.text(removeDiacritics('CONG HOA XA HOI CHU NGHIA VIET NAM'), 105, y, { align: 'center' });
            y += 6;
            setBold(13);
            doc.text(removeDiacritics('Doc lap - Tu do - Hanh phuc'), 105, y, { align: 'center' });
            y += 2;
            doc.setLineWidth(0.5);
            doc.line(70, y, 140, y);
            y += 15;

            // Tên hợp đồng
            setBold(16);
            doc.text(removeDiacritics('HOP DONG THUE PHONG TRO'), 105, y, { align: 'center' });
            y += 6;
            setItalic(10);
            doc.text(removeDiacritics(`(So: HD-${room.id}-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')})`), 105, y, { align: 'center' });
            y += 10;

            // Introduction Date
            setItalic(11);
            doc.text(removeDiacritics(`Hom nay, ngay ${today.getDate()} thang ${today.getMonth()+1} nam ${today.getFullYear()}, chung toi gom co:`), 15, y);
            y += 10;

            // ========== Party A ==========
            setBold(12);
            doc.text(removeDiacritics('BEN A: BEN CHO THUE PHONG TRO'), 15, y);
            y += 7;
            setNormal(11);
            doc.text(removeDiacritics(`- Ong/ba: ${landlordName}`), 20, y); y+=6;
            addWrappedText(`- Dia chi: ${address}`, 20, 0, false, 11);
            doc.text(removeDiacritics(`- Dien thoai: ${phone}`), 20, y); y+=8;

            // ========== Party B ==========
            setBold(12);
            doc.text(removeDiacritics('BEN B: BEN THUE PHONG TRO'), 15, y);
            y += 7;
            setNormal(11);
            doc.text(removeDiacritics(`- Ong/ba: ${tenantName}`), 20, y); y+=6;
            doc.text(removeDiacritics(`- CMND/CCCD: ${tenantIdCard}`), 20, y); y+=6;
            doc.text(removeDiacritics(`- Dien thoai: ${tenantPhone}`), 20, y); y+=6;
            addWrappedText(`- Que quan: ${tenantHometown}`, 20, 0, false, 11);
            y+=2;

            addWrappedText('Sau khi thoa thuan, hai ben thong nhat ky ket Hop dong thue phong tro voi cac dieu khoan sau day:', 15, 0, false, 11);
            y+=2;

            // ========== Terms ==========
            setBold(12);
            doc.text(removeDiacritics('DIEU 1: THONG TIN PHONG THUE'), 15, y); y+=7;
            setNormal(11);
            addWrappedText(`1.1. Ben A dong y cho Ben B thue phong so: ${room.room_name} tai dia chi: ${address}.`, 20, 0, false, 11);
            addWrappedText(`1.2. Tien nghi hien co trong phong bao gom: ${room.amenities || 'Khong co thiet bi dac biet.'}`, 20, 0, false, 11);
            addWrappedText(`1.3. Thoi han thue: Tu ngay ${formatDate(room.start_date)} den ngay ${formatDate(room.end_date)}.`, 20, 0, false, 11);
            y+=2;

            setBold(12);
            doc.text(removeDiacritics('DIEU 2: GIA THUE VA PHUONG THUC THANH TOAN'), 15, y); y+=7;
            setNormal(11);
            addWrappedText(`2.1. Gia thue phong la: ${Number(room.price).toLocaleString('vi-VN')} dong/thang.`, 20, 0, false, 11);
            addWrappedText(`2.2. Tien dat coc: ${Number(room.price).toLocaleString('vi-VN')} dong. Khoan tien nay se duoc hoan tra cho Ben B sau khi tru di chi phi dien, nuoc va ton that hu hong tai san (neu co) khi cham dut hop dong va tra trang thai phong nhu ban dau.`, 20, 0, false, 11);
            addWrappedText(`2.3. Cac khoan chi phi khac:`, 20, 0, false, 11);
            addWrappedText(`- Tien dien: 4.000 dong/kWh.`, 25, 0, false, 11);
            addWrappedText(`- Tien nuoc: 30.000 dong/m3.`, 25, 0, false, 11);
            addWrappedText(`2.4. Thanh toan: Ben B thanh toan tien phong va chi phi dich vu tu ngay 01 den ngay 05 moi thang.`, 20, 0, false, 11);
            y+=2;

            setBold(12);
            doc.text(removeDiacritics('DIEU 3: QUYEN VA NGHIA VU CUA BEN A'), 15, y); y+=7;
            setNormal(11);
            addWrappedText(`3.1. Giao phong va cac trang thiet bi cho Ben B dung thoi han cung cac dieu kien su dung dien, nuoc an toan.`, 20, 0, false, 11);
            addWrappedText(`3.2. Sua chua kip thoi cac hu hong thuoc ve ban chat cua tai san (khong do loi cua Ben B) de dam bao nhu cau sinh hoat.`, 20, 0, false, 11);
            addWrappedText(`3.3. Dam bao quyen su dung phong tro tron ven cho Ben B, huong dan Ben B tuan thu cac quy dinh chung cua khu tro.`, 20, 0, false, 11);
            y+=2;

            setBold(12);
            doc.text(removeDiacritics('DIEU 4: QUYEN VA NGHIA VU CUA BEN B'), 15, y); y+=7;
            setNormal(11);
            addWrappedText(`4.1. Thanh toan tien thue va cac chi phi dich vu day dug han theo Dieu 2 cua hop dong.`, 20, 0, false, 11);
            addWrappedText(`4.2. Khong duoc phep chuyen nhuong hoac cho nguoi khac thue lai neu khong co su dong y bang van ban cua Ben A.`, 20, 0, false, 11);
            addWrappedText(`4.3. Nhanh chong bao cho Ben A kip thoi giqi quyet trong truong hop phat sinh thu hu hong doi voi tai san cua Ben A. Dam bao boi thuong cac hu hong do loi cua Ben B sinh ra.`, 20, 0, false, 11);
            addWrappedText(`4.4. Tuan thu cac quy dinh ve cham soc, bao ve tai san, giu gin an ninh trat tu, phong chay chua chay, khong lam anh huong den my quan, ve sinh moi truong noi cu tru.`, 20, 0, false, 11);
            addWrappedText(`4.5. Phai bao cho Ben A biet truoc it nhat 30 ngay neu khong con nhu cau tiep tuc thue.`, 20, 0, false, 11);
            y+=2;

            setBold(12);
            doc.text(removeDiacritics('DIEU 5: PHAT VI PHAM VA CHAM DUT HOP DONG'), 15, y); y+=7;
            setNormal(11);
            addWrappedText(`5.1. Hai ben co the cham dut hop dong truoc thoi han trong cac truong hop bat kha khang.`, 20, 0, false, 11);
            addWrappedText(`5.2. Neu Ben B dọn di ma khong bao truoc du 30 ngay thi se mat khoan tien coc. Neu Ben A lay lai phong ma khong bao truoc 30 ngay thi phai boi thuong gap doi so tien dat coc cho Ben B.`, 20, 0, false, 11);
            y+=2;

            setBold(12);
            doc.text(removeDiacritics('DIEU 6: DIEU KHOAN CHUNG'), 15, y); y+=7;
            setNormal(11);
            addWrappedText(`Hai ben doc lai cac dieu khoan trong hop dong tu nguyen va cung ky ten xac nhan. Hop dong lap thanh 02 ban co gia tri phap ly nhu nhau, moi ben giu 01 ban.`, 20, 0, false, 11);
            y+=10;

            checkPageBreak(40);
            
            // Chữ ký
            setBold(12);
            doc.text(removeDiacritics('BEN A KY TEN'), 55, y, { align: 'center' });
            doc.text(removeDiacritics('BEN B KY TEN'), 155, y, { align: 'center' });
            y += 5; setNormal(10);
            doc.text(removeDiacritics('(Ky, ghi ro ho ten)'), 55, y, { align: 'center' });
            doc.text(removeDiacritics('(Ky, ghi ro ho ten)'), 155, y, { align: 'center' });
            y += 25;
            doc.text(removeDiacritics(landlordName), 55, y, { align: 'center' });
            doc.text(removeDiacritics(tenantName), 155, y, { align: 'center' });

            doc.save(`HopDong_${room.room_name}_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}.pdf`);
            if (onClose) onClose();
        } catch (error) {
            console.error("Lỗi tạo PDF hợp đồng:", error);
            alert("Lỗi tạo PDF hợp đồng: " + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
                <h2 className="text-xl font-black text-gray-800 mb-2">📋 In Hợp Đồng Thuê Nhà</h2>
                <p className="text-gray-500 text-sm mb-5">Hệ thống sẽ tạo bản PDF hợp đồng chi tiết chuẩn pháp lý với thông tin bên dưới:</p>
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
                        <span className="text-gray-500">Giá thuê/Cọc:</span>
                        <span className="font-bold">{Number(room.price).toLocaleString('vi-VN')}đ</span>
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
                    💡 Hợp đồng gồm đầy đủ 6 Điều khoản tiêu chuẩn và sẽ tự động thêm trang nếu nội dung dài.
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`flex-1 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                        {loading ? '⏳ Đang tải...' : '📄 Xuất Hợp Đồng Chi Tiết'}
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
