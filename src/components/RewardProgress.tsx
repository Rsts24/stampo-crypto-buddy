import { motion } from "framer-motion";

interface RewardProgressProps {
  current: number;
  total: number;
  label: string;
}

const RewardProgress = ({ current, total, label }: RewardProgressProps) => {
  const progress = (current / total) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{label}</span>
        <span>{current}/{total} stamps</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-accent rounded-full"
        />
      </div>
    </div>
  );
};

export default RewardProgress;