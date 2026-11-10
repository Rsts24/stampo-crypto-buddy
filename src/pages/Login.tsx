import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AuthForm, emailFormSchema } from "@/components/auth/AuthForm";
import PhoneCodeForm from "@/components/auth/PhoneCodeForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as z from "zod";

const Login = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [tab, setTab] = useState("phone");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    try {
      setIsLoading(true);
      
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes("User already registered")) {
            toast({
              variant: "destructive",
              title: "Account already exists",
              description: "Please try signing in instead.",
            });
            setIsSignUp(false);
          } else {
            throw signUpError;
          }
          return;
        }

        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (signInError) throw signInError;

        // Fetch user profile to check if they're a vendor
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_vendor')
          .eq('id', data.user.id)
          .single();

        // Redirect based on user role
        if (profile?.is_vendor) {
          navigate('/vendor-dashboard');
        } else {
          navigate('/dashboard');
        }

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
      className="min-h-screen flex items-center justify-center p-4 bg-background"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/80 backdrop-blur-sm shadow-xl border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold text-card-foreground">
              {tab === "email" && isSignUp ? "Create Account" : "Welcome to Stampo"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="phone">Phone</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>

              {/* Same steps whether you're new or coming back: number, then code */}
              <TabsContent value="phone" className="space-y-3">
                <PhoneCodeForm mode="signin" />
                <p className="text-xs text-center text-muted-foreground">
                  New here? This creates your account. No password needed.
                </p>
              </TabsContent>

              <TabsContent value="email">
                <AuthForm
                  type="email"
                  isSignUp={isSignUp}
                  onSubmit={handleEmailSubmit}
                  isLoading={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Sign Up"}
                </button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
