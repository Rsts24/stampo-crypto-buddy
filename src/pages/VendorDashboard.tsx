import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Coffee, Bitcoin, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format, subMonths } from "date-fns"
import GiveStampCard from "@/components/vendor/GiveStampCard"
import { STAMP_VALIDITY_MONTHS } from "@/lib/rewards"

interface DashboardMetrics {
  totalRevenue: number
  totalTransactions: number
  activeStamps: number
  totalRewards: number
  revenueSharing: {
    totalShared: number
    activeParticipants: number
  }
}

export default function VendorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  const { data: vendorId } = useQuery({
    queryKey: ["vendorId", user?.id],
    enabled: !!user?.id,
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
    enabled: !!vendorId,
    queryFn: async () => {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount_in_pence, stamps_earned, created_at")
        .eq("vendor_id", vendorId)

      // Stamps this shop has given out that haven't expired yet
      const { count: stampsGiven } = await supabase
        .from("stamps")
        .select("id", { count: "exact", head: true })
        .eq("vendor_id", vendorId)
        .gte("collected_at", subMonths(new Date(), STAMP_VALIDITY_MONTHS).toISOString())

      const { data: rewards } = await supabase
        .from("rewards")
        .select("*")
        .eq("vendor_id", vendorId)

      const { data: cryptoRewards } = await supabase
        .from("rewards")
        .select("*")
        .eq("vendor_id", vendorId)
        .in("type", ["crypto", "both"])
        .not("crypto_amount_in_pence", "is", null)

      const totalRevenue = transactions?.reduce(
        (sum, tx) => sum + tx.amount_in_pence,
        0
      ) || 0
      
      const totalTransactions = transactions?.length || 0
      
      const activeStamps = stampsGiven ?? 0
      
      const totalRewards = rewards?.length || 0

      const totalShared = cryptoRewards?.reduce(
        (sum, reward) => sum + (reward.crypto_amount_in_pence || 0),
        0
      ) || 0

      const activeParticipants = new Set(
        cryptoRewards?.map((reward) => reward.customer_id)
      ).size

      return {
        totalRevenue,
        totalTransactions,
        activeStamps,
        totalRewards,
        revenueSharing: {
          totalShared,
          activeParticipants,
        },
      }
    },
  })

  if (!user) {
    return null
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {format(new Date(), "MMM d, yyyy HH:mm")}
          </p>
        </div>
        {vendorId ? (
          <GiveStampCard vendorId={vendorId} />
        ) : (
          <p className="text-sm text-muted-foreground">
            We couldn't find a shop linked to this account, so you can't give stamps yet.
          </p>
        )}
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
              <p className="text-xs text-muted-foreground mt-1">
                From {metrics?.totalTransactions || 0} transactions
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
                Given out in the last {STAMP_VALIDITY_MONTHS} months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Shared</CardTitle>
              <Bitcoin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{((metrics?.revenueSharing.totalShared || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                With {metrics?.revenueSharing.activeParticipants || 0} participants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rewards Issued</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalRewards || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total rewards claimed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )
}