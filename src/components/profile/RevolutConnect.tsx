import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const RevolutConnect = () => {
  const { toast } = useToast();

  const handleRevolutConnect = () => {
    toast({
      title: "Coming Soon",
      description: "Revolut integration will be available soon!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleRevolutConnect}
        >
          Connect Revolut Account
        </Button>
      </CardContent>
    </Card>
  );
};