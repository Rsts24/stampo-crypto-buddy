import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session) {
          toast({
            title: "Successfully authenticated",
            description: "Welcome back!",
          });
          navigate("/dashboard");
        } else {
          toast({
            variant: "destructive",
            title: "Authentication failed",
            description: "Please try logging in again",
          });
          navigate("/login");
        }
      } catch (error: any) {
        console.error("Auth redirect error:", error);
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: error.message || "An unexpected error occurred",
        });
        navigate("/login");
      }
    };

    handleRedirect();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-muted-foreground">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
};

export default AuthCallback;