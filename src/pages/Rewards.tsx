import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import RewardCard from "../components/RewardCard";

const Rewards = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Rewards</h1>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Coffee Rewards</h2>
            <RewardCard type="coffee" stamps={6} isAvailable={true} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Share Rewards</h2>
            <RewardCard type="crypto" stamps={10} isAvailable={true} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Special Rewards</h2>
            <RewardCard type="both" stamps={15} isAvailable={true} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Rewards;