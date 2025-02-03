import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm, profileFormSchema } from "@/components/profile/PersonalInfoForm";
import { RevolutConnect } from "@/components/profile/RevolutConnect";
import { z } from "zod";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof profileFormSchema>) => {
      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    },
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "Please try again later",
      });
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const initialFormData = {
    full_name: profile?.full_name || "",
    mobile_number: profile?.mobile_number || "",
    date_of_birth: profile?.date_of_birth ? new Date(profile.date_of_birth) : undefined,
    address: profile?.address || "",
    preferred_language: profile?.preferred_language || "en",
    notification_preferences: profile?.notification_preferences || {
      email: true,
      sms: true,
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <ProfileHeader onSignOut={handleSignOut} />

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonalInfoForm
              initialData={initialFormData}
              onSubmit={(values) => updateProfile.mutate(values)}
              isLoading={updateProfile.isPending}
            />
          </CardContent>
        </Card>

        <RevolutConnect />
      </motion.div>
    </div>
  );
};

export default Profile;