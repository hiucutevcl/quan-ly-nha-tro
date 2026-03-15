import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

const InvoicePDFExport = ({ invoice }) => {
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = async () => {
        if (isPrinting) return;
        setIsPrinting(true);
        try {
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
            const pageWidth = 148;
            
            const bold = (sz = 12) => { doc.setFontSize(sz); doc.setFont('helvetica', 'bold'); };
            const normal = (sz = 11) => { doc.setFontSize(sz); doc.setFont('helvetica', 'normal'); };
            const fmt = (v) => Number(v || 0).toLocaleString('vi-VN') + ' VND';

            let y = 15;
            
            // Header
            doc.setTextColor(29, 78, 216);
            bold(16); doc.text('HOA DON TIEN PHONG', pageWidth / 2, y, { align: 'center' });
            y += 8;
            
            doc.setTextColor(85, 85, 85);
            normal(10);
            doc.text(`Phong: ${invoice.room_name}   |   Thang: ${invoice.month_year}`, pageWidth / 2, y, { align: 'center' });
            y += 5;
            doc.text(`Khach thue: ${invoice.tenant_name || '---'}`, pageWidth / 2, y, { align: 'center' });
            y += 5;
            
            doc.setDrawColor(29, 78, 216); doc.setLineWidth(0.5);
            doc.line(20, y, pageWidth - 20, y);
            y += 10;
            
            // Items
            doc.setTextColor(55, 65, 81);
            const items = [
                ['Tien phong', fmt(invoice.room_fee)],
                [`Tien dien (${invoice.old_elec} -> ${invoice.new_elec})`, fmt(invoice.elec_fee)],
                [`Tien nuoc (${invoice.old_water} -> ${invoice.new_water})`, fmt(invoice.water_fee)],
            ];
            
            if (Number(invoice.trash_fee) > 0) items.push(['Phi rac', fmt(invoice.trash_fee)]);
            if (Number(invoice.wifi_fee) > 0) items.push(['Phi Wifi', fmt(invoice.wifi_fee)]);
            if (Number(invoice.parking_fee) > 0) items.push([`Phi gui xe (${invoice.parking_count} chiec)`, fmt(invoice.parking_fee)]);
            if (Number(invoice.old_debt) > 0) items.push(['No cu mang sang', fmt(invoice.old_debt)]);
            
            items.forEach(row => {
                normal(11); doc.text(row[0], 15, y);
                bold(11); doc.text(row[1], pageWidth - 15, y, { align: 'right' });
                y += 3;
                doc.setDrawColor(229, 231, 235); doc.setLineWidth(0.2);
                doc.line(15, y, pageWidth - 15, y);
                y += 6;
            });
            
            // Total
            y += 2;
            doc.setFillColor(239, 246, 255);
            doc.rect(10, y - 5, pageWidth - 20, 10, 'F');
            doc.setTextColor(29, 78, 216);
            bold(12); doc.text('TONG CONG', 15, y + 1.5);
            bold(14); doc.text(fmt(invoice.total_amount), pageWidth - 15, y + 1.5, { align: 'right' });
            
            y += 15;
            
            // Status
            if (invoice.is_paid) {
                doc.setFillColor(209, 250, 229);
                doc.rect(pageWidth / 2 - 25, y, 50, 8, 'F');
                doc.setTextColor(6, 95, 70);
                bold(10); doc.text('DA THANH TOAN', pageWidth / 2, y + 5.5, { align: 'center' });
            } else {
                doc.setFillColor(254, 226, 226);
                doc.rect(pageWidth / 2 - 25, y, 50, 8, 'F');
                doc.setTextColor(153, 27, 27);
                bold(10); doc.text('CHUA THANH TOAN', pageWidth / 2, y + 5.5, { align: 'center' });
            }
            
            y += 15;
            doc.setTextColor(156, 163, 175);
            normal(9); doc.text('Hoa don duoc xuat tu dong boi He thong Quan ly Nha tro', pageWidth / 2, y, { align: 'center' });

            doc.save(`HoaDon_${invoice.room_name}_${invoice.month_year}.pdf`);
        } catch (error) {
            console.error("Lỗi xuất PDF:", error);
            alert("Lỗi xuất PDF: " + error.message);
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <button
            onClick={handlePrint}
            disabled={isPrinting}
            className={`${isPrinting ? 'text-gray-400' : 'text-purple-600 hover:text-purple-800'} text-sm font-semibold transition`}
            title="Xuất PDF"
        >
            {isPrinting ? '⏳ Đang tạo...' : '🖨️ PDF'}
        </button>
    );
};

export default InvoicePDFExport;
