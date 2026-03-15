const fs = require("fs");
let c = fs.readFileSync("src/app/dashboard/attendance/page.tsx", "utf8");
c = c
  .replace(/variant="outline"/g, 'variant="secondary"')
  .replace(/variant="link"/g, 'variant="ghost"')
  .replace(/variant="destructive"/g, 'variant="danger"');
fs.writeFileSync("src/app/dashboard/attendance/page.tsx", c);
