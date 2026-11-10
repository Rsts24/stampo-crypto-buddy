import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { normalizePhone } from "@/lib/phone";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const RESEND_SECONDS = 30;

interface PhoneCodeFormProps {
  /**
   * "signin": sign in or create an account with just a phone number.
   * "verify": add and confirm a phone number on an account that's already signed in.
   */
  mode: "signin" | "verify";
  onDone?: () => void;
}

// Two quick steps: type your number, then type the 6-digit code we text you.
const PhoneCodeForm = ({ mode, onDone }: PhoneCodeFormProps) => {
  const { toast } = useToast();
  const [rawPhone, setRawPhone] = useState("");
  const [phone, setPhone] = useState<string | null>(null); // set once the code is sent
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const showError = (error: unknown) => {
    let message = (error as Error)?.message || "Something went wrong. Please try again.";
    if (/already (been )?registered|already exists|phone_exists/i.test(message)) {
      message = "This phone number is already linked to another Stampo account.";
    }
    toast({ variant: "destructive", title: "That didn't work", description: message });
  };

  const sendCode = async (target: string) => {
    setBusy(true);
    try {
      const { error } =
        mode === "signin"
          ? await supabase.auth.signInWithOtp({ phone: target })
          : await supabase.auth.updateUser({ phone: target });
      if (error) throw error;
      setPhone(target);
      setCode("");
      setCooldown(RESEND_SECONDS);
      toast({ title: "Code sent", description: `We've texted a 6-digit code to ${target}.` });
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(rawPhone);
    if (!normalized) {
      toast({
        variant: "destructive",
        title: "Check your number",
        description: "Enter a mobile number like 07700 900123, or with a country code like +44.",
      });
      return;
    }
    sendCode(normalized);
  };

  const verify = async (token: string) => {
    if (!phone || token.length !== 6) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: mode === "signin" ? "sms" : "phone_change",
      });
      if (error) throw error;
      onDone?.();
    } catch (error) {
      setCode("");
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  if (!phone) {
    return (
      <form onSubmit={handlePhoneSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="07700 900123"
            value={rawPhone}
            onChange={(e) => setRawPhone(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={busy || !rawPhone.trim()}>
          {busy ? "Sending..." : "Text me a code"}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        verify(code);
      }}
      className="space-y-4"
    >
      <div className="space-y-2 text-center">
        <Label>Enter the 6-digit code sent to {phone}</Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            onComplete={verify}
            autoComplete="one-time-code"
            inputMode="numeric"
            autoFocus
            disabled={busy}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
      <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={busy || code.length !== 6}>
        {busy ? "Checking..." : "Confirm"}
      </Button>
      <div className="flex justify-between text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setPhone(null)}
          disabled={busy}
        >
          Change number
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          onClick={() => sendCode(phone)}
          disabled={busy || cooldown > 0}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
};

export default PhoneCodeForm;
