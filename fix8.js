const fs = require('fs');

let c = fs.readFileSync('src/app/dashboard/psychology/page.tsx', 'utf8');
c = c.replace(/MOCK_USERS[\s\S]*?\.name/g, '"Oficial"');
fs.writeFileSync('src/app/dashboard/psychology/page.tsx', c);
