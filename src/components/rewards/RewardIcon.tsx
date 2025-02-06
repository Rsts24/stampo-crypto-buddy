import { Coffee, Bitcoin } from "lucide-react";
import { RewardType } from "@/types/rewards";

interface RewardIconProps {
  type: RewardType;
  isAvailable: boolean;
}

const RewardIcon = ({ type, isAvailable }: RewardIconProps) => {
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

  return (
    <div
      className={`p-3 rounded-full ${
        isAvailable ? "bg-accent text-white" : "bg-muted text-muted-foreground"
      }`}
    >
      {getIcon()}
    </div>
  );
};

export default RewardIcon;