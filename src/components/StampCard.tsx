import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StampCardProps {
  isCollected: boolean;
  index: number;
}

const StampCard = ({ isCollected, index }: StampCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative w-16 h-16 rounded-xl flex items-center justify-center ${
        isCollected
          ? "bg-accent shadow-lg"
          : "bg-secondary border-2 border-dashed border-muted-foreground"
      }`}
    >
      {isCollected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default StampCard;