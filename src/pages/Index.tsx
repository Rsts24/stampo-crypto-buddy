import { useState } from "react";
import StampCard from "../components/StampCard";
import RewardProgress from "../components/RewardProgress";
import RewardCard from "../components/RewardCard";
import { motion } from "framer-motion";

const Index = () => {
  const [stamps, setStamps] = useState(3);
  const totalStamps = 15;

  const stampCards = Array.from({ length: totalStamps }, (_, i) => (
    <StampCard key={i} isCollected={i < stamps} index={i} />
  ));

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Digital Stamps</h1>
          <p className="text-muted-foreground">Collect stamps, earn rewards</p>
        </div>

        <div className="bg-card backdrop-blur-md p-6 rounded-2xl shadow-lg space-y-6">
          <div className="grid grid-cols-5 gap-4">{stampCards}</div>
          <RewardProgress current={stamps} total={totalStamps} label="Progress to next reward" />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Rewards</h2>
          <div className="space-y-4">
            <RewardCard type="coffee" stamps={5} isAvailable={stamps >= 5} />
            <RewardCard type="crypto" stamps={10} isAvailable={stamps >= 10} />
            <RewardCard type="both" stamps={15} isAvailable={stamps >= 15} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;