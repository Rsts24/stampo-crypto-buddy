import { RewardType } from "@/types/rewards";

interface RewardInfoProps {
  type: RewardType;
  stamps: number;
}

const RewardInfo = ({ type, stamps }: RewardInfoProps) => {
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

  return (
    <div>
      <h3 className="font-semibold">{getTitle()}</h3>
      <p className="text-sm text-muted-foreground">{stamps} stamps required</p>
      <p className="text-xs text-muted-foreground mt-1">{getDescription()}</p>
    </div>
  );
};

export default RewardInfo;