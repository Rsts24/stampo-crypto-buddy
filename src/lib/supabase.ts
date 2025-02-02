import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypggazqiibqtzitevpgg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZ2dhenFpaWJxdHppdGV2cGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDEwNTMsImV4cCI6MjA1NDAxNzA1M30.utRtMP61-tcqU3chwjeW87DWIBkdgX2d9UDBrsrXOOs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);