import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fzhxshnrdxquivyoxbrn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aHhzaG5yZHhxdWl2eW94YnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMzEyOTgsImV4cCI6MjEwOTgwNzI5OH0.ywx0TFgolnbeOa8GYcPG4isgInP9iO1WSn6GssRIdHw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);