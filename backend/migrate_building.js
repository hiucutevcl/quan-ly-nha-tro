const db = require('./config/db');

async function migrate() {
    try {
        // Thêm cột building_name nếu chưa có
        await db.query("ALTER TABLE Rooms ADD COLUMN building_name VARCHAR(255) DEFAULT ''");
        console.log('✅ Đã thêm cột building_name vào bảng Rooms!');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Cột building_name đã tồn tại rồi.');
        } else {
            console.error('❌ Lỗi:', e.message);
        }
    }

    try {
        // Thêm cột address cho phòng nếu chưa có
        await db.query("ALTER TABLE Rooms ADD COLUMN room_address VARCHAR(500) DEFAULT ''");
        console.log('✅ Đã thêm cột room_address vào bảng Rooms!');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Cột room_address đã tồn tại rồi.');
        } else {
            console.error('❌ Lỗi:', e.message);
        }
    }

    process.exit(0);
}

migrate();
