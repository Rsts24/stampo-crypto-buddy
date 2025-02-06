import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StampCard from "@/components/StampCard";
import RewardProgress from "@/components/RewardProgress";

interface StampsCollectionProps {
  stamps: number;
  totalStamps: number;
  onEarnStamp: () => void;
}

const StampsCollection = ({ stamps, totalStamps = 16, onEarnStamp }: StampsCollectionProps) => {
  const stampCards = Array.from({ length: totalStamps }, (_, i) => (
    <StampCard key={i} isCollected={i < stamps} index={i} />
  ));

  return (
    <Card className="bg-card backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle>Your Stamps</CardTitle>
        <p className="text-sm text-muted-foreground">Stamps expire 6 months after collection</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-4 gap-4">{stampCards}</div>
        <RewardProgress 
          current={stamps} 
          total={totalStamps} 
          label="Progress to next reward" 
        />
        <Button onClick={onEarnStamp} className="w-full">
          Earn a Stamp (Demo)
        </Button>
      </CardContent>
    </Card>
  );
};

export default StampsCollection;