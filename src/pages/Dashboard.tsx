import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Coffee, Bitcoin, Gift, User, Clock } from "lucide-react";
import StampCard from "../components/StampCard";
import RewardProgress from "../components/RewardProgress";
import RewardCard from "../components/RewardCard";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  const stampCards = Array.from({ length: totalStamps }, (_, i) => (
    <StampCard key={i} isCollected={i < stamps} index={i} />
  ));

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stamps</CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stamps}</div>
              <p className="text-xs text-muted-foreground">Valid for 6 months</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRewards?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Ready to redeem</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stamps < 6 ? 6 - stamps : stamps < 15 ? 15 - stamps : 0}
              </div>
              <p className="text-xs text-muted-foreground">Stamps needed</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle>Your Stamps</CardTitle>
            <p className="text-sm text-muted-foreground">Stamps expire 6 months after collection</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-5 gap-4">{stampCards}</div>
            <RewardProgress 
              current={stamps} 
              total={totalStamps} 
              label="Progress to next reward" 
            />
            <Button onClick={handleEarnStamp} className="w-full">
              Earn a Stamp (Demo)
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Available Rewards</h2>
            <Link to="/rewards">
              <Button variant="outline">View All Rewards</Button>
            </Link>
          </div>
          <div className="space-y-4">
            <RewardCard 
              type="coffee" 
              stamps={6} 
              isAvailable={stamps >= 6} 
            />
            <RewardCard 
              type="crypto" 
              stamps={10} 
              isAvailable={stamps >= 10} 
            />
            <RewardCard 
              type="both" 
              stamps={15} 
              isAvailable={stamps >= 15} 
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;