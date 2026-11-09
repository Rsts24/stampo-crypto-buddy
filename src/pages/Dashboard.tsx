import { motion } from "framer-motion";
import { User } from "lucide-react";
import { subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { TOTAL_STAMPS, STAMP_VALIDITY_MONTHS, getNextMilestone } from "@/lib/rewards";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import StampsCollection from "@/components/dashboard/StampsCollection";
import AvailableRewards from "@/components/dashboard/AvailableRewards";
import StampCode from "@/components/dashboard/StampCode";
import VerifyPhoneCard from "@/components/dashboard/VerifyPhoneCard";

const Dashboard = () => {
  const { user } = useAuth();

  // Count this user's stamps that haven't expired yet
  const { data: stampCount = 0 } = useQuery({
    queryKey: ["stamps", user?.id],
    enabled: !!user,
    // Check every few seconds so a stamp the vendor adds shows up straight away
    refetchInterval: 5000,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("stamps")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("collected_at", subMonths(new Date(), STAMP_VALIDITY_MONTHS).toISOString());

      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: activeRewards } = useQuery({
    queryKey: ["rewards", "active", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("customer_id", user!.id)
        .eq("status", "earned")
        .is("expired_at", null)
        .is("redeemed_at", null);

      if (error) throw error;
      return data;
    },
  });

  const stamps = Math.min(stampCount, TOTAL_STAMPS);
  const next = getNextMilestone(stamps);
  const stampsToNext = next === null ? 0 : next - stamps;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Digital Stamps</h1>
            <p className="text-muted-foreground">Collect stamps, earn amazing rewards</p>
          </div>
          <Link to="/profile">
            <Button variant="outline" size="icon" aria-label="Profile">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <DashboardMetrics
          stamps={stamps}
          activeRewards={activeRewards?.length || 0}
          nextMilestone={stampsToNext}
        />

        {/* Customers confirm a phone number once before they can collect stamps */}
        {user?.phone_confirmed_at ? <StampCode userId={user.id} /> : <VerifyPhoneCard />}

        <StampsCollection stamps={stamps} totalStamps={TOTAL_STAMPS} />

        <AvailableRewards stamps={stamps} />
      </motion.div>
    </div>
  );
};

export default Dashboard;
