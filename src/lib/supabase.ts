import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypggazqiibqtzitevpgg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZ2dhenFpaWJxdHppdGV2cGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY5MTI2OTAsImV4cCI6MjAyMjQ4ODY5MH0.qDPHut7_36q9URiykL4hW3Vb2HJvzqVbE3kQGY12ZXU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);