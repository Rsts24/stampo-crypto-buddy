import { motion } from "framer-motion";

interface RewardProgressProps {
  current: number;
  total: number;
  label: string;
}

const RewardProgress = ({ current, total, label }: RewardProgressProps) => {
  const progress = (current / total) * 100;
  const nextMilestone = current < 6 ? 6 : current < 15 ? 15 : total;
  const progressToNextMilestone = (current / nextMilestone) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{current}/{nextMilestone} stamps</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressToNextMilestone}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-accent rounded-full"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Current: {current}</span>
        <span>Next Reward: {nextMilestone}</span>
      </div>
    </div>
  );
};

export default RewardProgress;