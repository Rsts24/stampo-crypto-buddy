import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const RevolutConnect = () => {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  const handleConnect = () => {
    if (!selectedPlatform) {
      toast({
        title: "Please select a platform",
        description: "Choose a trading platform to connect your account",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coming Soon",
      description: `${selectedPlatform} integration will be available soon!`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Platform</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Select your preferred platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trading212">Trading 212</SelectItem>
            <SelectItem value="freetrade">Freetrade</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleConnect}
        >
          Connect Trading Account
        </Button>
      </CardContent>
    </Card>
  );
};