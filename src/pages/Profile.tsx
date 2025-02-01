import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-lg">John Doe</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-lg">john@example.com</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p className="text-lg">+44 123 456 7890</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crypto Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Connect Revolut Account
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;