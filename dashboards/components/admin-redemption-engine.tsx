"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { getRedemptionAnalytics, RedemptionAnalytics } from "@/lib/api-client"
import { Users, TrendingUp, Repeat, Gift, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

type VolumeView = "daily" | "weekly" | "monthly"

const VIEW_LABELS: Record<VolumeView, string> = {
  daily: "Daily (30 days)",
  weekly: "Weekly (12 weeks)",
  monthly: "Monthly (12 months)",
}

function formatDateLabel(date: string, view: VolumeView): string {
  if (view === "monthly") {
    // "YYYY-MM" → "Jan 25"
    const [year, month] = date.split("-")
    const d = new Date(Number(year), Number(month) - 1)
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }
  // "YYYY-MM-DD" → "Apr 30"
  const d = new Date(date + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-primary font-medium">{payload[0].value} redemptions</p>
      </div>
    )
  }
  return null
}

const HistogramTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-semibold mb-1">{label} redemption{label === "1" ? "" : "s"}</p>
        <p className="text-primary font-medium">{payload[0].value} users</p>
      </div>
    )
  }
  return null
}

export function AdminRedemptionEngine() {
  const colors = DASHBOARD_COLORS("admin")
  const [data, setData] = useState<RedemptionAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [volumeView, setVolumeView] = useState<VolumeView>("daily")

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const result = await getRedemptionAnalytics()
      setData(result)
    } catch (err) {
      console.error("Failed to load redemption analytics:", err)
      toast.error("Failed to load redemption analytics")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Failed to load redemption analytics</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    )
  }

  // --- Volume trend chart data ---
  const volumeData = data.volumeTrends[volumeView].map((d) => ({
    date: formatDateLabel(d.date, volumeView),
    count: d.count,
  }))

  // --- Histogram data ---
  const histogramData = data.behaviorHistogram.map((b) => ({
    bucket: b.bucket === "4+" ? "4+" : `${b.bucket}`,
    users: b.userCount,
  }))

  // --- Bonus stats ---
  const { totalBonusTriggers, uniqueStudentsTriggered, usersReturnedAfterBonus, conversionRate } =
    data.fifthBonusStats

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
          Redemption &amp; Behavioral Engine
        </h2>
        <p className="text-muted-foreground mt-1">
          Deep-dive into redemption patterns, user behavior, and loyalty loop performance
        </p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Unique Redeemers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Unique Redeemers</span>
              <Users className="w-4 h-4" style={{ color: colors.primary }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {data.uniqueRedeemers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Users with ≥1 verified redemption</p>
          </CardContent>
        </Card>

        {/* Total Bonus Triggers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>5th-Bonus Triggers</span>
              <Gift className="w-4 h-4" style={{ color: colors.primary }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {totalBonusTriggers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {uniqueStudentsTriggered.toLocaleString()} unique students
            </p>
          </CardContent>
        </Card>

        {/* Bonus Conversion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Post-Bonus Return Rate</span>
              <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {conversionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Redeemed again within 30 days of bonus
            </p>
          </CardContent>
        </Card>

        {/* 90-day Repeat Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>90-Day Repeat Rate</span>
              <Repeat className="w-4 h-4" style={{ color: colors.primary }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {data.repeatRates.find((r) => r.windowDays === 90)?.repeatRate ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Users who redeemed again within 90 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Volume Trends ── */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle style={{ color: colors.primary }}>Redemption Volume Trends</CardTitle>
            <CardDescription>{VIEW_LABELS[volumeView]}</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["daily", "weekly", "monthly"] as VolumeView[]).map((v) => (
              <Button
                key={v}
                size="sm"
                variant={volumeView === v ? "default" : "outline"}
                onClick={() => setVolumeView(v)}
                className="capitalize"
              >
                {v}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {volumeData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={colors.primary}
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Histogram + Repeat Rates ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Behavior Histogram */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: colors.primary }}>User Behavior Histogram</CardTitle>
            <CardDescription>How many redemptions each user has made</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={histogramData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(v) => (v === "4+" ? "4+" : `${v}`)}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  label={{ value: "Redemptions", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<HistogramTooltip />} />
                <Bar dataKey="users" fill={colors.primary} radius={[4, 4, 0, 0]} maxBarSize={72} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repeat Rate Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: colors.primary }}>Repeat Rate Monitoring</CardTitle>
            <CardDescription>Users who redeemed again after their first redemption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {data.repeatRates.map((stat) => (
              <div key={stat.windowDays} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{stat.windowDays}-Day Window</span>
                  <span className="font-bold text-lg" style={{ color: colors.primary }}>
                    {stat.repeatRate}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(stat.repeatRate, 100)}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.repeatCount.toLocaleString()} of {stat.totalRedeemers.toLocaleString()} users
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── 5th Bonus Tracking ── */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: colors.primary }}>5th-Redemption Bonus Tracking</CardTitle>
          <CardDescription>
            Monitor loyalty-bonus trigger events and their impact on continued engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Total Triggers</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                {totalBonusTriggers.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Unique Students</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                {uniqueStudentsTriggered.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Returned (30 days)</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                {usersReturnedAfterBonus.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                {conversionRate}%
              </p>
              <p className="text-[10px] text-muted-foreground">returned after bonus</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
