// Re-export the single shared Supabase client.
// Having two separate clients caused "Multiple GoTrueClient instances" warnings
// and meant the two could disagree about who is signed in.
export { supabase } from "@/integrations/supabase/client";
