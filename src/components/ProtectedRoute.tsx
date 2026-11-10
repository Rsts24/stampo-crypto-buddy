import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Waits until Supabase has restored the session before deciding whether to
// redirect, so refreshing a signed-in page no longer bounces you to /login.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
