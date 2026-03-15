const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/psychology/page.tsx', 'utf8');
c = c.replace("useState<(Incident & { student?: any }) |useState<any>(", "useState<any>(");
fs.writeFileSync('src/app/dashboard/psychology/page.tsx', c);
