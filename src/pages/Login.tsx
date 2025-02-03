import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";

const phoneRegex = /^\+[1-9]\d{1,14}$/;

const emailFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
});

const phoneFormSchema = z.object({
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number with country code (e.g., +1234567890)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
});

const Login = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phone: "",
      password: "",
      fullName: "",
    },
  });

  if (user) {
    return <Navigate to="/profile" />;
  }

  const handleEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    try {
      setIsLoading(true);
      console.log("Attempting email auth:", { isSignUp, email: values.email });
      
      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          console.error("Sign up error:", signUpError);
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

        if (signUpData.user) {
          toast({
            title: "Account created successfully",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (signInError) {
          console.error("Sign in error:", signInError);
          throw signInError;
        }

        if (signInData.user) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
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
      console.log("Attempting phone auth:", { isSignUp, phone: values.phone });

      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          phone: values.phone,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName,
            },
          },
        });

        if (signUpError) {
          console.error("Phone sign up error:", signUpError);
          throw signUpError;
        }

        if (signUpData.user) {
          toast({
            title: "Verification code sent",
            description: "Please check your phone for the verification code.",
          });
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          phone: values.phone,
          password: values.password,
        });

        if (signInError) {
          console.error("Phone sign in error:", signInError);
          throw signInError;
        }

        if (signInData.user) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
      }
    } catch (error: any) {
      console.error("Phone authentication error:", error);
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
            <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as "email" | "phone")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="bg-white/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isSignUp && (
                      <FormField
                        control={emailForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                className="bg-white/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={emailForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              className="bg-white/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Please wait..."
                        : isSignUp
                        ? "Sign Up"
                        : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="phone">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+1234567890"
                              className="bg-white/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isSignUp && (
                      <FormField
                        control={phoneForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                className="bg-white/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={phoneForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              className="bg-white/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Please wait..."
                        : isSignUp
                        ? "Sign Up with Phone"
                        : "Sign In with Phone"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

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