const db = require('../config/db');

/**
 * API: Phân tích số liệu điện/nước bất thường của các phòng
 * Logic: So sánh tiêu thụ tháng gần nhất với trung bình 3 tháng trước đó
 * Nếu tháng hiện tại > trung bình * ngưỡng (mặc định 1.5x) => bất thường
 */
const getAnomalies = async (req, res) => {
    try {
        // Lấy toàn bộ lịch sử hóa đơn có thông tin điện/nước, sắp xếp theo phòng & tháng
        const sql = `
            SELECT 
                i.room_id,
                r.room_name,
                u.full_name AS tenant_name,
                i.month_year,
                i.elec_used,
                i.water_used,
                i.elec_amount,
                i.water_amount,
                i.total_amount,
                i.is_paid
            FROM Invoices i
            JOIN Rooms r ON i.room_id = r.id
            LEFT JOIN Users u ON r.tenant_id = u.id
            WHERE i.elec_used IS NOT NULL AND i.water_used IS NOT NULL
            ORDER BY i.room_id ASC, i.month_year DESC
        `;
        const [rows] = await db.query(sql);

        if (rows.length === 0) {
            return res.status(200).json({ anomalies: [], summary: { total_rooms: 0, rooms_with_anomaly: 0 } });
        }

        // Nhóm dữ liệu theo phòng
        const roomMap = {};
        for (const row of rows) {
            if (!roomMap[row.room_id]) {
                roomMap[row.room_id] = {
                    room_id: row.room_id,
                    room_name: row.room_name,
                    tenant_name: row.tenant_name || 'Chưa có khách',
                    invoices: []
                };
            }
            roomMap[row.room_id].invoices.push(row);
        }

        const ANOMALY_THRESHOLD = 1.5; // Ngưỡng: tăng hơn 50% so với trung bình
        const MIN_HISTORY = 2;         // Cần ít nhất 2 tháng lịch sử để so sánh
        const anomalies = [];

        for (const roomId in roomMap) {
            const room = roomMap[roomId];
            const invoices = room.invoices; // Đã sort DESC theo tháng

            if (invoices.length < MIN_HISTORY + 1) continue; // Không đủ dữ liệu

            // Tháng mới nhất (index 0) vs lịch sử (index 1 trở đi, tối đa 3 tháng)
            const latestInvoice = invoices[0];
            const historyInvoices = invoices.slice(1, 4); // Lấy tối đa 3 tháng trước

            const avgElec = historyInvoices.reduce((s, i) => s + Number(i.elec_used || 0), 0) / historyInvoices.length;
            const avgWater = historyInvoices.reduce((s, i) => s + Number(i.water_used || 0), 0) / historyInvoices.length;

            const currentElec = Number(latestInvoice.elec_used || 0);
            const currentWater = Number(latestInvoice.water_used || 0);

            const elecRatio = avgElec > 0 ? currentElec / avgElec : 0;
            const waterRatio = avgWater > 0 ? currentWater / avgWater : 0;

            const isElecAnomaly = elecRatio >= ANOMALY_THRESHOLD;
            const isWaterAnomaly = waterRatio >= ANOMALY_THRESHOLD;

            // Chỉ thêm vào nếu có ít nhất 1 bất thường
            if (isElecAnomaly || isWaterAnomaly) {
                const warnings = [];
                if (isElecAnomaly) {
                    warnings.push({
                        type: 'electricity',
                        label: '⚡ Điện tăng bất thường',
                        current: currentElec,
                        avg: Math.round(avgElec * 10) / 10,
                        ratio: Math.round(elecRatio * 100) / 100,
                        percent_increase: Math.round((elecRatio - 1) * 100),
                        unit: 'kWh',
                        severity: elecRatio >= 2 ? 'high' : 'medium'
                    });
                }
                if (isWaterAnomaly) {
                    warnings.push({
                        type: 'water',
                        label: '💧 Nước tăng bất thường',
                        current: currentWater,
                        avg: Math.round(avgWater * 10) / 10,
                        ratio: Math.round(waterRatio * 100) / 100,
                        percent_increase: Math.round((waterRatio - 1) * 100),
                        unit: 'm³',
                        severity: waterRatio >= 2 ? 'high' : 'medium'
                    });
                }

                const maxSeverity = warnings.some(w => w.severity === 'high') ? 'high' : 'medium';
                anomalies.push({
                    room_id: room.room_id,
                    room_name: room.room_name,
                    tenant_name: room.tenant_name,
                    month_year: latestInvoice.month_year,
                    is_paid: latestInvoice.is_paid,
                    warnings,
                    severity: maxSeverity,
                    history_months: historyInvoices.map(i => ({
                        month_year: i.month_year,
                        elec_used: i.elec_used,
                        water_used: i.water_used,
                    }))
                });
            }
        }

        // Sắp xếp: high trước, medium sau
        anomalies.sort((a, b) => (a.severity === 'high' ? -1 : 1));

        const totalRooms = Object.keys(roomMap).length;
        res.status(200).json({
            anomalies,
            summary: {
                total_rooms_analyzed: totalRooms,
                rooms_with_anomaly: anomalies.length,
                high_severity: anomalies.filter(a => a.severity === 'high').length,
                medium_severity: anomalies.filter(a => a.severity === 'medium').length,
                threshold_used: ANOMALY_THRESHOLD,
            }
        });
    } catch (error) {
        console.error('[AnomalyController] Lỗi:', error);
        res.status(500).json({ message: 'Lỗi server khi phân tích: ' + error.message });
    }
};

module.exports = { getAnomalies };
