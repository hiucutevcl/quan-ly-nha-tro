const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'controllers');

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.js')) {
        const fullPath = path.join(dir, file);
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content.replace(/\b(Users|Rooms|Invoices)\b/g, match => match.toLowerCase());
        if (content !== newContent) {
            fs.writeFileSync(fullPath, newContent, 'utf8');
            console.log('Fixed', file);
        }
    }
});
console.log('Done!');
