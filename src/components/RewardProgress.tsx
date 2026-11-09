import { motion } from "framer-motion";
import { getNextMilestone, REWARD_TIERS } from "@/lib/rewards";

interface RewardProgressProps {
  current: number;
  label: string;
}

const RewardProgress = ({ current, label }: RewardProgressProps) => {
  const next = getNextMilestone(current);
  const target = next ?? REWARD_TIERS[REWARD_TIERS.length - 1].stamps;
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{current}/{target} stamps</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-accent rounded-full"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Current: {current}</span>
        <span>{next === null ? "All rewards unlocked!" : `Next reward: ${next}`}</span>
      </div>
    </div>
  );
};

export default RewardProgress;
