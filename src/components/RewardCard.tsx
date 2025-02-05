import { motion } from "framer-motion";
import { Coffee, Bitcoin, Clock } from "lucide-react";
import { format, addMonths } from "date-fns";

interface RewardCardProps {
  type: "coffee" | "crypto" | "both";
  stamps: number;
  isAvailable: boolean;
  expiryDate?: Date;
}

const RewardCard = ({ type, stamps, isAvailable, expiryDate = addMonths(new Date(), 1) }: RewardCardProps) => {
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

  const getDescription = () => {
    switch (type) {
      case "coffee":
        return "Any hot or cold drink up to £5";
      case "crypto":
        return "Share in vendor's monthly revenue";
      case "both":
        return "Combo of drink and increased share";
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
        <div className="flex-1">
          <h3 className="font-semibold">{getTitle()}</h3>
          <p className="text-sm text-muted-foreground">{stamps} stamps required</p>
          <p className="text-xs text-muted-foreground mt-1">{getDescription()}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            <span>Expires {format(expiryDate, 'MMM d')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RewardCard;