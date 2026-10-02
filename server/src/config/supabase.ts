import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || ''; // We use secret key on backend for admin access

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[WARNING] Supabase environment variables missing.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
