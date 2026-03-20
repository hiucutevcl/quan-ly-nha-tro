const db = require('./config/db');

async function run() {
    try {
        const [result] = await db.query(
            "UPDATE AppSettings SET setting_value = 'Nhà Trọ Minh Hiếu' WHERE setting_key = 'nha_tro_name'"
        );
        console.log('Database updated: ', result.affectedRows > 0 ? 'Success' : 'No changes made');
    } catch (e) {
        console.error('Error updating DB: ', e);
    } finally {
        process.exit(0);
    }
}

run();
