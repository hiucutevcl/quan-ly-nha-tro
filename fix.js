const db = require('./backend/config/db');
const hash = '$2b$10$9P5yRBEc6r.xq8I0UTc6lOIDwyJinK2D25RbCV/Xtmeb0P69lFYW6';
db.query("UPDATE Users SET password = ? WHERE username IN ('admin', 'tenant1')", [hash])
  .then(() => console.log('UPDATE_SUCCESS'))
  .catch(console.error)
  .finally(() => process.exit());
