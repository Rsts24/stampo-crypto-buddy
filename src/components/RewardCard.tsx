import { motion } from "framer-motion";
import { Coffee, Bitcoin, Clock } from "lucide-react";
import { format, addMonths } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface RewardCardProps {
  type: "coffee" | "crypto" | "both" | "platform_shares";
  stamps: number;
  isAvailable: boolean;
  expiryDate?: Date;
}

const RewardCard = ({ type, stamps, isAvailable, expiryDate = addMonths(new Date(), 1) }: RewardCardProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

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
      case "platform_shares":
        return <Bitcoin className="w-6 h-6" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "coffee":
        return "Free Coffee";
      case "crypto":
        return "0.01% Vendor Share";
      case "both":
        return "Coffee + £1 Platform Shares";
      case "platform_shares":
        return "£1 Platform Shares";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "coffee":
        return "Any hot or cold drink up to £5";
      case "crypto":
        return "Share in vendor's monthly revenue";
      case "both":
        return "Combo of drink and £1 worth of shares on your chosen platform";
      case "platform_shares":
        return "£1 worth of shares on your chosen platform";
    }
  };

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
          {showPlatformSelect && isAvailable && (
            <div className="mt-2">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select trading platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trading212">Trading 212</SelectItem>
                  <SelectItem value="freetrade">Freetrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
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