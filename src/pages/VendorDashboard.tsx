import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Coffee, Bitcoin } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

interface DashboardMetrics {
  totalRevenue: number
  totalTransactions: number
  activeStamps: number
  totalRewards: number
}

export default function VendorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  const { data: vendorId } = useQuery({
    queryKey: ["vendorId", user?.id],
    enabled: !!user?.id, // Only run query when we have a user ID
    queryFn: async () => {
      const { data: vendor, error } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user?.id)
        .single()

      if (error) {
        console.error("Error fetching vendor:", error)
        return null
      }

      return vendor?.id
    },
  })

  const { data: metrics } = useQuery({
    queryKey: ["vendorMetrics", vendorId],
    enabled: !!vendorId, // Only run query when we have a vendor ID
    queryFn: async () => {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount_in_pence, stamps_earned")
        .eq("vendor_id", vendorId)

      const { data: rewards } = await supabase
        .from("rewards")
        .select("*")
        .eq("vendor_id", vendorId)

      const totalRevenue = transactions?.reduce(
        (sum, tx) => sum + tx.amount_in_pence,
        0
      ) || 0
      const totalTransactions = transactions?.length || 0
      const activeStamps =
        (transactions?.reduce((sum, tx) => sum + tx.stamps_earned, 0) || 0) -
        (rewards?.reduce((sum, reward) => sum + reward.stamps_used, 0) || 0)
      const totalRewards = rewards?.length || 0

      return {
        totalRevenue,
        totalTransactions,
        activeStamps,
        totalRewards,
      }
    },
  })

  if (!user) {
    return null // or a loading spinner
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{((metrics?.totalRevenue || 0) / 100).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalTransactions || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Stamps</CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.activeStamps || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
              <Bitcoin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalRewards || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )
}