const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'frontend/src');
const searchString = 'http://localhost:5000';
const replaceString = 'https://api-quan-ly-nha-tro.onrender.com';

function replaceInFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(searchString)) {
                content = content.split(searchString).join(replaceString);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

replaceInFiles(directory);
console.log('Finished updating frontend URLs.');
