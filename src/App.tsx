import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import Welcome from "@/pages/Welcome"
import Index from "@/pages/Index"
import Login from "@/pages/Login"
import VendorLogin from "@/pages/VendorLogin"
import Dashboard from "@/pages/Dashboard"
import Profile from "@/pages/Profile"
import Rewards from "@/pages/Rewards"
import VendorDashboard from "@/pages/VendorDashboard"
import AuthCallback from "@/pages/AuthCallback"
import NotFound from "@/pages/NotFound"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/vendor-login" element={<VendorLogin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App