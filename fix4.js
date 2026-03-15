const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/incidents/page.tsx', 'utf8');
c = c.replace("import { supabase } from '@/lib/supabase';\n'use client';", "'use client';\nimport { supabase } from '@/lib/supabase';");
fs.writeFileSync('src/app/dashboard/incidents/page.tsx', c);
