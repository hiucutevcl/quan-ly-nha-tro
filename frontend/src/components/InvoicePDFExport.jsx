import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoicePDFExport = ({ invoice }) => {
    const handlePrint = async () => {
        const element = document.getElementById(`invoice-preview-${invoice.id}`);
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
        const imgHeight = pageWidth / ratio;
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, Math.min(imgHeight, pageHeight));
        pdf.save(`HoaDon_${invoice.room_name}_${invoice.month_year}.pdf`);
    };

    const fmt = (v) => Number(v || 0).toLocaleString() + ' đ';

    return (
        <>
            {/* Ẩn template mà html2canvas sẽ chụp */}
            <div className="fixed -left-[9999px] top-0">
                <div
                    id={`invoice-preview-${invoice.id}`}
                    style={{ width: '420px', fontFamily: 'Arial, sans-serif', padding: '20px', background: 'white', fontSize: '13px' }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #1d4ed8', paddingBottom: '10px', marginBottom: '12px' }}>
                        <h2 style={{ margin: 0, color: '#1d4ed8', fontSize: '18px', fontWeight: 'bold' }}>HÓA ĐƠN TIỀN PHÒNG</h2>
                        <p style={{ margin: '4px 0 0', color: '#555', fontSize: '11px' }}>
                            Phòng: <b>{invoice.room_name}</b> &nbsp;|&nbsp; Tháng: <b>{invoice.month_year}</b>
                        </p>
                        <p style={{ margin: '2px 0 0', color: '#555', fontSize: '11px' }}>Khách thuê: <b>{invoice.tenant_name}</b></p>
                    </div>

                    {/* Chi tiết */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            {[
                                ['Tiền phòng', fmt(invoice.room_fee)],
                                [`Tiền điện (${invoice.old_elec} → ${invoice.new_elec})`, fmt(invoice.elec_fee)],
                                [`Tiền nước (${invoice.old_water} → ${invoice.new_water})`, fmt(invoice.water_fee)],
                                Number(invoice.trash_fee) > 0 && ['♻️ Phí rác', fmt(invoice.trash_fee)],
                                Number(invoice.wifi_fee) > 0 && ['📶 Phí Wifi', fmt(invoice.wifi_fee)],
                                Number(invoice.parking_fee) > 0 && [`🏍️ Phí gửi xe (${invoice.parking_count} chiếc)`, fmt(invoice.parking_fee)],
                                Number(invoice.old_debt) > 0 && ['⚠️ Nợ cũ mang sang', fmt(invoice.old_debt)],
                            ].filter(Boolean).map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '6px 4px', color: '#374151' }}>{row[0]}</td>
                                    <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>{row[1]}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#eff6ff' }}>
                                <td style={{ padding: '8px 4px', fontWeight: 'bold', color: '#1d4ed8', fontSize: '14px' }}>TỔNG CỘNG</td>
                                <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', color: '#1d4ed8', fontSize: '16px' }}>{fmt(invoice.total_amount)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Trạng thái */}
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        <span style={{
                            display: 'inline-block', padding: '4px 16px', borderRadius: '20px',
                            background: invoice.is_paid ? '#d1fae5' : '#fee2e2',
                            color: invoice.is_paid ? '#065f46' : '#991b1b',
                            fontWeight: 'bold', fontSize: '12px'
                        }}>
                            {invoice.is_paid ? '✅ ĐÃ THANH TOÁN' : '⏳ CHƯA THANH TOÁN'}
                        </span>
                    </div>
                    <p style={{ marginTop: '14px', fontSize: '10px', color: '#9ca3af', textAlign: 'center' }}>
                        Hóa đơn được xuất tự động bởi Hệ thống Quản lý Nhà trọ
                    </p>
                </div>
            </div>

            {/* Nút bấm */}
            <button
                onClick={handlePrint}
                className="text-purple-600 hover:text-purple-800 text-sm font-semibold"
                title="Xuất PDF"
            >
                🖨️ PDF
            </button>
        </>
    );
};

export default InvoicePDFExport;
