// Supabase
import process from 'node:process';
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Copy .env.example to .env (locally) or set them in Render's Environment tab."
  );
  process.exit(1);
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
