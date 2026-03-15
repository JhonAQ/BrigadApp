
const fs = require("fs");

// page.tsx
let f = "src/app/dashboard/page.tsx";
let c = fs.readFileSync(f, "utf8");
c = c.replace(/MOCK_INCIDENTS\.slice\(0,\s*5\)/g, "([]) /* replaced mock */");
c = c.replace(/MOCK_STUDENTS\.find[\s\S]*?\)/g, "null");
fs.writeFileSync(f, c);

// auth-context.tsx
f = "src/lib/auth-context.tsx";
c = fs.readFileSync(f, "utf8");
c = c.replace(/import \{ User, MOCK_USERS \} from "\.\/mock";/g, `import { User } from "./mock";\nimport { supabase } from "./supabase";`);
c = c.replace(/setTimeout\(\(\) => \{[\s\S]*?\}, 800\);/, `(async () => {
    try {
      const { data: foundUser, error } = await supabase
        .from("users")
        .select("*")
        .eq("dni", dni)
        .single();
        
      if (error || !foundUser) {
        toast.error("DNI no encontrado");
        setIsLoading(false);
        return;
      }
      
      setUser(foundUser as any);
      localStorage.setItem("brigadapp_user", JSON.stringify(foundUser));
      toast.success("Bienvenido, " + foundUser.name);
      router.push("/dashboard");
    } catch (e) {
      toast.error("Error al conectar");
    } finally {
      setIsLoading(false);
    }
  })();`);
fs.writeFileSync(f, c);

// psychology/page.tsx
f = "src/app/dashboard/psychology/page.tsx";
c = fs.readFileSync(f, "utf8");
c = c.replace(/MOCK_USERS\.find[\s\S]*?\)/g, "{ name: \"Psicólogo\" }");
fs.writeFileSync(f, c);

