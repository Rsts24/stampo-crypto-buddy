import { ArrowLeft, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  onSignOut: () => Promise<void>;
}

export const ProfileHeader = ({ onSignOut }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>
      <Button variant="outline" onClick={onSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};