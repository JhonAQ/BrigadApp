const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/incidents/page.tsx', 'utf8');
c = "import { supabase } from '@/lib/supabase';\n" + c;
fs.writeFileSync('src/app/dashboard/incidents/page.tsx', c);
