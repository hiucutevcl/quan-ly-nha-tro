const fs = require('fs');

function replaceColors(file) {
  let c = fs.readFileSync(file, 'utf8');

  // Blue -> Violet replacements
  c = c.replace(/#2563eb/g, '#6366f1')
       .replace(/#1d4ed8/g, '#4338ca')
       .replace(/rgba\(37,\s*99,\s*235,/g, 'rgba(99, 102, 241,')
       .replace(/'#eff6ff'/g, "'#f5f3ff'")
       .replace(/'#dbeafe'/g, "'#ddd6fe'")
       .replace(/'hsl\(215,\s*100%,\s*35%\)'/g, "'#4338ca'")
       .replace(/'hsl\(215,\s*100%,\s*45%\)'/g, "'#6366f1'")
       .replace(/'hsl\(215,\s*100%,\s*96%\)'/g, "'#f5f3ff'")
       .replace(/'hsl\(215,\s*100%,\s*80%\)'/g, "'#c4b5fd'")
       .replace(/'hsl\(215,\s*100%,\s*92%\)'/g, "'#ede9fe'")
       .replace(/hsl\(215,\s*100%,\s*35%\)/g, '#4338ca')
       .replace(/hsl\(215,\s*100%,\s*45%\)/g, '#6366f1')
       .replace(/hsl\(220,\s*10%,\s*46%\)/g, '#6b7280') /* gray text */
       .replace(/hsl\(220,\s*20%,\s*10%\)/g, '#111827'); /* dark text */

  fs.writeFileSync(file, c);
  console.log('Fixed ' + file);
}

replaceColors('frontend/src/pages/LandingPage.jsx');
replaceColors('frontend/src/pages/Login.jsx');
