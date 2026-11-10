import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface GiveStampCardProps {
  vendorId: string;
}

// Lets a vendor add a stamp to a customer's card by scanning the customer's
// QR code or pasting their code.
const GiveStampCard = ({ vendorId }: GiveStampCardProps) => {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const giveStamp = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from("stamps")
        .insert({ user_id: customerId, vendor_id: vendorId });
      if (error) throw error;
    },
    onSuccess: () => {
      setCode("");
      queryClient.invalidateQueries({ queryKey: ["vendorMetrics", vendorId] });
      toast({ title: "Stamp added", description: "The customer's card has been updated." });
    },
    onError: (error: Error) => {
      // The database refuses stamps for customers who haven't confirmed their phone yet
      const description = /row-level security/i.test(error.message)
        ? "This customer needs to confirm their phone number in the Stampo app first."
        : error.message;
      toast({ variant: "destructive", title: "Couldn't add stamp", description });
    },
  });

  const submit = (value: string) => {
    const customerId = value.trim();
    if (!UUID_PATTERN.test(customerId)) {
      toast({
        variant: "destructive",
        title: "That isn't a valid customer code",
        description: "Ask the customer to show the QR code on their Stampo dashboard.",
      });
      return;
    }
    giveStamp.mutate(customerId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Give a Stamp</CardTitle>
        <p className="text-sm text-muted-foreground">
          Scan the customer's QR code, or paste their code below
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanning ? (
          <div className="space-y-2">
            <div className="mx-auto max-w-xs overflow-hidden rounded-lg">
              <Scanner
                formats={["qr_code"]}
                onScan={(codes) => {
                  if (codes.length > 0) {
                    setScanning(false);
                    submit(codes[0].rawValue);
                  }
                }}
                onError={() => {
                  setScanning(false);
                  toast({
                    variant: "destructive",
                    title: "Camera unavailable",
                    description: "Allow camera access, or paste the customer's code instead.",
                  });
                }}
              />
            </div>
            <Button variant="outline" className="w-full" onClick={() => setScanning(false)}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={() => setScanning(true)} disabled={giveStamp.isPending}>
            <Camera className="mr-2 h-4 w-4" /> Scan QR Code
          </Button>
        )}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(code);
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Customer code"
            aria-label="Customer code"
          />
          <Button type="submit" variant="secondary" disabled={!code.trim() || giveStamp.isPending}>
            {giveStamp.isPending ? "Adding..." : "Add Stamp"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GiveStampCard;
