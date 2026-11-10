import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AuthForm, emailFormSchema } from "@/components/auth/AuthForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as z from "zod";

const VendorLogin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  if (user) {
    return <Navigate to="/vendor-dashboard" />;
  }

  const handleEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    try {
      setIsLoading(true);
      
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            // The database creates the profile and shop from these details
            // as soon as the account exists (see handle_new_user in supabase/migrations)
            data: {
              full_name: values.fullName,
              is_vendor: true,
              business_name: businessName,
              business_address: businessAddress,
            },
          },
        });

        if (signUpError) throw signUpError;

        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (signInError) throw signInError;

        navigate('/vendor-dashboard');

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: (error as Error).message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-black"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-900/90 backdrop-blur-sm shadow-xl border-gray-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold text-white">
              {isSignUp ? "Create Vendor Account" : "Vendor Login"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSignUp && (
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-gray-300">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress" className="text-gray-300">Business Address</Label>
                  <Input
                    id="businessAddress"
                    placeholder="Enter your business address"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            )}

            <AuthForm
              type="email"
              isSignUp={isSignUp}
              onSubmit={handleEmailSubmit}
              isLoading={isLoading}
            />

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full mt-4 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VendorLogin;
