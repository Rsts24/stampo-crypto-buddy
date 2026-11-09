import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee, Store } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)",
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite",
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-xl space-y-6">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h1 className="text-3xl font-bold text-gray-800">Welcome to Stampo</h1>
            <p className="text-gray-600">Your digital loyalty program for coffee lovers</p>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-16 text-lg"
                variant="default"
              >
                <Coffee className="mr-2 h-5 w-5" />
                Sign in as Customer
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => navigate("/vendor-login")}
                className="w-full h-16 text-lg"
                variant="secondary"
              >
                <Store className="mr-2 h-5 w-5" />
                Sign in as Vendor
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;