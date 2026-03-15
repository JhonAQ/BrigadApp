const fs = require("fs");
let c = fs.readFileSync("src/app/dashboard/incidents/page.tsx", "utf8");
c = c.replace(
  "import { useState } from 'react';",
  "import { useState, useEffect } from 'react';",
);
fs.writeFileSync("src/app/dashboard/incidents/page.tsx", c);
