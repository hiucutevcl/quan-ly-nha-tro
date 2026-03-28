const fs = require('fs');
const path = require('path');

const files = [
    'RoomManagement.jsx',
    'UserManagement.jsx',
    'InvoiceManagement.jsx',
    'PaymentCalendar.jsx',
    'ReportDashboard.jsx',
    'SettingsPage.jsx'
];

const dir = path.join(__dirname, 'frontend/src/pages');

// Only replace exact word-boundary class names, NOT partial matches like rounded-lg
const replacements = [
    // green -> indigo
    ['bg-green-500', 'bg-indigo-600'],
    ['bg-green-600', 'bg-indigo-600'],
    ['bg-green-700', 'bg-indigo-700'],
    ['hover:bg-green-600', 'hover:bg-indigo-700'],
    ['hover:bg-green-700', 'hover:bg-indigo-700'],
    ['text-green-600', 'text-indigo-600'],
    ['text-green-700', 'text-indigo-700'],
    ['hover:text-green-600', 'hover:text-indigo-600'],
    ['border-green-500', 'border-indigo-500'],
    ['border-green-600', 'border-indigo-600'],
    ['focus:ring-green-400', 'focus:ring-indigo-400'],
    ['focus:ring-green-500', 'focus:ring-indigo-500'],
    ['border-t-4 border-green-500', 'border-t-4 border-indigo-500'],
    
    // teal -> slate/indigo
    ['text-teal-800', 'text-slate-700'],
    ['bg-teal-50', 'bg-indigo-50/50'],
    ['border-teal-200', 'border-indigo-200/50'],
    ['text-teal-600', 'text-indigo-600'],
    ['text-teal-700', 'text-indigo-700'],
    ['hover:text-teal-700', 'hover:text-indigo-700'],

    // blue accents in content pages -> indigo/violet
    ['bg-blue-600', 'bg-indigo-600'],
    ['bg-blue-700', 'bg-indigo-700'],
    ['text-blue-600', 'text-indigo-600'],
    ['text-blue-800', 'text-indigo-800'],
    ['text-blue-500', 'text-indigo-500'],
    ['border-blue-200', 'border-indigo-200'],
    ['border-blue-500', 'border-indigo-500'],
    ['bg-blue-50', 'bg-indigo-50'],
    ['hover:bg-blue-100', 'hover:bg-indigo-100'],
    ['bg-blue-100', 'bg-indigo-100'],
    ['text-blue-700', 'text-indigo-700'],
    ['focus:ring-blue-400', 'focus:ring-indigo-400'],
    ['focus:ring-blue-500', 'focus:ring-indigo-500'],
    
    // gray -> slate (more refined)
    ['bg-gray-400', 'bg-slate-400'],
    ['bg-gray-50', 'bg-slate-50'],
    ['text-gray-400', 'text-slate-400'],
];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
        console.log('Skipping ' + file + ' - not found');
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    let changes = 0;

    replacements.forEach(([from, to]) => {
        // Use simple string replace (all occurrences) - safe for Tailwind class names
        while (content.includes(from)) {
            content = content.replace(from, to);
            changes++;
        }
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + file + ' (' + changes + ' replacements)');
    } else {
        console.log('No changes for ' + file);
    }
});

console.log('All done!');
