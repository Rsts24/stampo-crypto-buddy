import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RewardCard from "@/components/RewardCard";

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
        <RewardCard 
          type="coffee" 
          stamps={6} 
          isAvailable={stamps >= 6} 
        />
        <RewardCard 
          type="crypto" 
          stamps={12} 
          isAvailable={stamps >= 12} 
        />
        <RewardCard 
          type="both" 
          stamps={16} 
          isAvailable={stamps >= 16} 
        />
      </div>
    </div>
  );
};

export default AvailableRewards;