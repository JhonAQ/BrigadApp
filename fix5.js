const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/psychology/page.tsx', 'utf8');
c = c.replace(/dbIncidents/g, 'incidents');
c = c.replace(/MOCK_USERS\.find\(user => user\.id === inc\.recordedBy\)\?\.name/g, '"Oficial"');
fs.writeFileSync('src/app/dashboard/psychology/page.tsx', c);
