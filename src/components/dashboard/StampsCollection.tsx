import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StampCard from "@/components/StampCard";
import RewardProgress from "@/components/RewardProgress";
import { STAMP_VALIDITY_MONTHS } from "@/lib/rewards";

interface StampsCollectionProps {
  stamps: number;
  totalStamps: number;
}

const StampsCollection = ({ stamps, totalStamps }: StampsCollectionProps) => {
  const stampCards = Array.from({ length: totalStamps }, (_, i) => (
    <StampCard key={i} isCollected={i < stamps} index={i} />
  ));

  return (
    <Card className="bg-card backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle>Your Stamps</CardTitle>
        <p className="text-sm text-muted-foreground">
          Stamps expire {STAMP_VALIDITY_MONTHS} months after collection
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 justify-items-center">{stampCards}</div>
        <RewardProgress current={stamps} label="Progress to next reward" />
      </CardContent>
    </Card>
  );
};

export default StampsCollection;
