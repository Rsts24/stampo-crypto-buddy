import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { emailFormSchema, phoneFormSchema } from "@/components/auth/AuthForm";
import * as z from "zod";

const Login = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (user) {
    return <Navigate to="/profile" />;
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
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (signInError) throw signInError;

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (values: z.infer<typeof phoneFormSchema>) => {
    try {
      setIsLoading(true);

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          phone: values.phone,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName,
            },
          },
        });

        if (signUpError) throw signUpError;

        toast({
          title: "Verification code sent",
          description: "Please check your phone for the verification code.",
        });
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          phone: values.phone,
          password: values.password,
        });

        if (signInError) throw signInError;

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold text-gray-800">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AuthTabs
              isSignUp={isSignUp}
              isLoading={isLoading}
              onEmailSubmit={handleEmailSubmit}
              onPhoneSubmit={handlePhoneSubmit}
            />

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full mt-4 text-sm text-gray-600 hover:text-gray-800 transition-colors"
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

export default Login;