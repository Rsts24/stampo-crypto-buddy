import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StampCodeProps {
  userId: string;
}

// The customer shows this to the vendor at the till. The vendor scans it
// (or pastes the code) to add a stamp to this customer's card.
const StampCode = ({ userId }: StampCodeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by the browser; the code is still visible to copy by hand
    }
  };

  return (
    <Card className="bg-card backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle>Collect a Stamp</CardTitle>
        <p className="text-sm text-muted-foreground">
          Show this code to the vendor when you pay
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="rounded-xl bg-white p-4">
          <QRCodeSVG value={userId} size={180} aria-label="Your stamp QR code" />
        </div>
        <div className="flex w-full items-center gap-2">
          <code className="flex-1 truncate rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {userId}
          </code>
          <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy code">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StampCode;
