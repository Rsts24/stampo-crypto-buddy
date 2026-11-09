import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhoneCodeForm from "@/components/auth/PhoneCodeForm";

// Shown instead of the stamp QR code until the customer confirms a phone number.
// One phone number = one account, so people can't collect rewards on several accounts.
const VerifyPhoneCard = () => {
  const { toast } = useToast();

  return (
    <Card className="bg-card backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle>Confirm your phone to start collecting</CardTitle>
        <p className="text-sm text-muted-foreground">
          It's a one-time step that keeps every card linked to one person. We'll text you a code.
        </p>
      </CardHeader>
      <CardContent>
        <PhoneCodeForm
          mode="verify"
          onDone={() =>
            toast({ title: "Phone confirmed", description: "You can start collecting stamps now." })
          }
        />
      </CardContent>
    </Card>
  );
};

export default VerifyPhoneCard;
