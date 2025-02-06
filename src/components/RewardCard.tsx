import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { format, addMonths } from "date-fns";
import { useState } from "react";
import RewardIcon from "./rewards/RewardIcon";
import RewardInfo from "./rewards/RewardInfo";
import PlatformSelect from "./rewards/PlatformSelect";

interface RewardCardProps {
  type: "coffee" | "crypto" | "both" | "platform_shares";
  stamps: number;
  isAvailable: boolean;
  expiryDate?: Date;
}

const RewardCard = ({ 
  type, 
  stamps, 
  isAvailable, 
  expiryDate = addMonths(new Date(), 1) 
}: RewardCardProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const showPlatformSelect = type === "both" || type === "platform_shares";

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
        <RewardIcon type={type} isAvailable={isAvailable} />
        <div className="flex-1">
          <RewardInfo type={type} stamps={stamps} />
          {showPlatformSelect && isAvailable && (
            <PlatformSelect 
              value={selectedPlatform} 
              onChange={setSelectedPlatform} 
            />
          )}
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