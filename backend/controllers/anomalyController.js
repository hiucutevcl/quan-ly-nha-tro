const db = require('../config/db');

/**
 * API: Phân tích số liệu điện/nước bất thường của các phòng
 * Logic: So sánh tiêu thụ tháng gần nhất với trung bình 3 tháng trước đó
 * Nếu tháng hiện tại > trung bình * ngưỡng (mặc định 1.5x) => bất thường
 * 
 * LƯU Ý: Bảng Invoices không có cột elec_used/water_used riêng.
 * Phải tính: elec_used = (new_elec - old_elec), water_used = (new_water - old_water)
 */
const getAnomalies = async (req, res) => {
    try {
        // Lấy lịch sử hóa đơn có thông tin điện/nước đầy đủ
        // Tính elec_used và water_used trực tiếp từ cột old/new
        const sql = `
            SELECT 
                i.room_id,
                r.room_name,
                u.full_name AS tenant_name,
                i.month_year,
                (i.new_elec - i.old_elec) AS elec_used,
                (i.new_water - i.old_water) AS water_used,
                i.elec_fee,
                i.water_fee,
                i.total_amount,
                i.is_paid
            FROM Invoices i
            JOIN Rooms r ON i.room_id = r.id
            LEFT JOIN Users u ON r.tenant_id = u.id
            WHERE i.new_elec IS NOT NULL 
              AND i.old_elec IS NOT NULL
              AND i.new_water IS NOT NULL
              AND i.old_water IS NOT NULL
              AND (i.new_elec - i.old_elec) >= 0
              AND (i.new_water - i.old_water) >= 0
            ORDER BY i.room_id ASC, i.month_year DESC
        `;
        const [rows] = await db.query(sql);

        if (rows.length === 0) {
            return res.status(200).json({
                anomalies: [],
                summary: { total_rooms_analyzed: 0, rooms_with_anomaly: 0, high_severity: 0, medium_severity: 0, threshold_used: 1.5 }
            });
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

        const ANOMALY_THRESHOLD = 1.5; // tăng hơn 50% => bất thường
        const MIN_HISTORY = 2;         // cần ít nhất 2 tháng lịch sử
        const anomalies = [];          // Giữ lại để tương thích (chỉ chứa phòng bất thường)
        const all_analyses = [];       // Chứa TẤT CẢ các phòng đã phân tích

        for (const roomId in roomMap) {
            const room = roomMap[roomId];
            const invoices = room.invoices; // sorted DESC by month_year

            if (invoices.length < MIN_HISTORY + 1) continue;

            const latestInvoice = invoices[0];
            const historyInvoices = invoices.slice(1, 4); // tối đa 3 tháng trước

            const avgElec = historyInvoices.reduce((s, i) => s + Number(i.elec_used || 0), 0) / historyInvoices.length;
            const avgWater = historyInvoices.reduce((s, i) => s + Number(i.water_used || 0), 0) / historyInvoices.length;

            const currentElec = Number(latestInvoice.elec_used || 0);
            const currentWater = Number(latestInvoice.water_used || 0);

            const elecRatio = avgElec > 0 ? currentElec / avgElec : 0;
            const waterRatio = avgWater > 0 ? currentWater / avgWater : 0;

            const isElecAnomaly = elecRatio >= ANOMALY_THRESHOLD;
            const isWaterAnomaly = waterRatio >= ANOMALY_THRESHOLD;

            const warnings = [];
            
            // Luôn ghi nhận thông số (Dù bất thường hay không để hiển thị chi tiết)
            warnings.push({
                type: 'electricity',
                label: '⚡ Điện',
                current: currentElec,
                avg: Math.round(avgElec * 10) / 10,
                ratio: Math.round(elecRatio * 100) / 100,
                percent_increase: Math.round((elecRatio - 1) * 100),
                unit: 'kWh',
                severity: isElecAnomaly ? (elecRatio >= 2 ? 'high' : 'medium') : 'normal'
            });

            warnings.push({
                type: 'water',
                label: '💧 Nước',
                current: currentWater,
                avg: Math.round(avgWater * 10) / 10,
                ratio: Math.round(waterRatio * 100) / 100,
                percent_increase: Math.round((waterRatio - 1) * 100),
                unit: 'm³',
                severity: isWaterAnomaly ? (waterRatio >= 2 ? 'high' : 'medium') : 'normal'
            });

            const maxSeverity = (isElecAnomaly || isWaterAnomaly) 
                ? (warnings.some(w => w.severity === 'high') ? 'high' : 'medium')
                : 'normal';

            const analysisRecord = {
                room_id: room.room_id,
                room_name: room.room_name,
                tenant_name: room.tenant_name,
                month_year: latestInvoice.month_year,
                is_paid: latestInvoice.is_paid,
                warnings,
                severity: maxSeverity,
                history_months: historyInvoices.map(i => ({
                    month_year: i.month_year,
                    elec_used: Number(i.elec_used),
                    water_used: Number(i.water_used),
                }))
            };

            all_analyses.push(analysisRecord);
            
            if (maxSeverity !== 'normal') {
                anomalies.push(analysisRecord);
            }
        }

        // Sắp xếp: high trước, medium giữa, normal cuối cùng
        const severityOrder = { 'high': 1, 'medium': 2, 'normal': 3 };
        all_analyses.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        const totalRoomsAnalyzed = all_analyses.length;
        res.status(200).json({
            anomalies,
            all_analyses,
            summary: {
                total_rooms_analyzed: totalRoomsAnalyzed,
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
