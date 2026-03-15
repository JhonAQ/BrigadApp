const fs = require('fs');
let c = fs.readFileSync('src/components/dashboard/sidebar.tsx', 'utf8');
c = c.replace(/roles: \[/g, "roles: ['DEVELOPER_ADMIN', ");
fs.writeFileSync('src/components/dashboard/sidebar.tsx', c);
