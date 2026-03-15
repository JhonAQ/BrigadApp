const fs = require("fs");
let c = fs.readFileSync("src/app/dashboard/psychology/page.tsx", "utf8");
c = c.replace("AlertCircle,", "AlertCircle,\n  MoreHorizontal,");
fs.writeFileSync("src/app/dashboard/psychology/page.tsx", c);
