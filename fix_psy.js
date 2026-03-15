const fs=require('fs');
let c=fs.readFileSync('src/app/dashboard/psychology/page.tsx','utf8');
c=c.replace("} from 'lucide-react';", ", MoreHorizontal } from 'lucide-react';");
fs.writeFileSync('src/app/dashboard/psychology/page.tsx', c);