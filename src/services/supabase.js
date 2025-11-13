import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://anfgceeegcfmyqzxddix.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZmdjZWVlZ2NmbXlxenhkZGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDQxNTcsImV4cCI6MjA3ODYyMDE1N30.VEWqqG3X4B0H8hxk-772fjrwLlLdza-zBrofuBc8Ww0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
