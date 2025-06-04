const SUPABASE_URL = 'https://xunmwuaosuujtknspzkh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bm13dWFvc3V1anRrbnNwemtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTY3NDIsImV4cCI6MjA2NDUzMjc0Mn0.jGoRVZLBZz53jl35MUbUKgRkgeZLECCLxUBO-LK3NkE';

// Initialize the Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make supabase available globally
window.supabaseClient = supabase;