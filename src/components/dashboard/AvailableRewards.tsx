import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RewardCard from "@/components/RewardCard";
import { REWARD_TIERS } from "@/lib/rewards";

interface AvailableRewardsProps {
  stamps: number;
}

const AvailableRewards = ({ stamps }: AvailableRewardsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Rewards</h2>
        <Link to="/rewards">
          <Button variant="outline">View All Rewards</Button>
        </Link>
      </div>
      <div className="space-y-4">
        {REWARD_TIERS.map((tier) => (
          <RewardCard
            key={tier.type}
            type={tier.type}
            stamps={tier.stamps}
            isAvailable={stamps >= tier.stamps}
          />
        ))}
      </div>
    </div>
  );
};

export default AvailableRewards;
