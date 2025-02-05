import { motion } from "framer-motion";
import { Coffee, Bitcoin } from "lucide-react";

interface RewardCardProps {
  type: "coffee" | "crypto" | "both";
  stamps: number;
  isAvailable: boolean;
}

const RewardCard = ({ type, stamps, isAvailable }: RewardCardProps) => {
  const getIcon = () => {
    switch (type) {
      case "coffee":
        return <Coffee className="w-6 h-6" />;
      case "crypto":
        return <Bitcoin className="w-6 h-6" />;
      case "both":
        return (
          <div className="flex space-x-2">
            <Coffee className="w-6 h-6" />
            <Bitcoin className="w-6 h-6" />
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (type) {
      case "coffee":
        return "Free Coffee";
      case "crypto":
        return "0.01% Vendor Share";
      case "both":
        return "Coffee + 0.02% Vendor Share";
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-2xl backdrop-blur-md ${
        isAvailable
          ? "bg-card shadow-lg cursor-pointer"
          : "bg-secondary cursor-not-allowed opacity-75"
      }`}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`p-3 rounded-full ${
            isAvailable ? "bg-accent text-white" : "bg-muted text-muted-foreground"
          }`}
        >
          {getIcon()}
        </div>
        <div>
          <h3 className="font-semibold">{getTitle()}</h3>
          <p className="text-sm text-muted-foreground">{stamps} stamps required</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RewardCard;