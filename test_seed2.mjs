import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs
  .readFileSync(".env.local", "utf8")
  .split("\n")
  .reduce((acc, line) => {
    const [k, v] = line.split("=");
    if (k && v) acc[k.trim()] = v.trim().replace(/['"]/g, "").replace("\r", "");
    return acc;
  }, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
supabase
  .from("users")
  .select("name, role, dni")
  .in("dni", [
    "00000001",
    "00000002",
    "00000003",
    "00000004",
    "00000005",
    "00000006",
  ])
  .then(({ data }) => console.log(data));
