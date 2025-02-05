import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import StampsCollection from "@/components/dashboard/StampsCollection";
import AvailableRewards from "@/components/dashboard/AvailableRewards";

const Dashboard = () => {
  const [stamps, setStamps] = useState(3);
  const totalStamps = 15;
  const { toast } = useToast();

  const { data: activeRewards } = useQuery({
    queryKey: ['rewards', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('status', 'earned')
        .is('expired_at', null)
        .is('redeemed_at', null);
      
      if (error) throw error;
      return data;
    }
  });

  const handleEarnStamp = () => {
    if (stamps < totalStamps) {
      setStamps(prev => prev + 1);
      toast({
        title: "Stamp Earned!",
        description: "You're getting closer to your next reward!",
      });
    }
  };

  const nextMilestone = stamps < 6 ? 6 - stamps : stamps < 15 ? 15 - stamps : 0;

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
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <DashboardMetrics 
          stamps={stamps}
          activeRewards={activeRewards?.length || 0}
          nextMilestone={nextMilestone}
        />

        <StampsCollection 
          stamps={stamps}
          totalStamps={totalStamps}
          onEarnStamp={handleEarnStamp}
        />

        <AvailableRewards stamps={stamps} />
      </motion.div>
    </div>
  );
};

export default Dashboard;