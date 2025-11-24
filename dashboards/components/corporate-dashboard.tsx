"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, DollarSign, ShoppingCart, Plus, Download } from "lucide-react"
import { CorporateSidebar } from "./corporate-sidebar"
import { CorporateOffers } from "./corporate-offers"
import { CorporateBranches } from "./corporate-branches"
import { DASHBOARD_COLORS, getChartColor } from "@/lib/colors"

const mockRedemptionTrend = [
  { date: "Mon", redemptions: 120, discounts: 24000 },
  { date: "Tue", redemptions: 150, discounts: 30000 },
  { date: "Wed", redemptions: 100, discounts: 20000 },
  { date: "Thu", redemptions: 180, discounts: 36000 },
  { date: "Fri", redemptions: 220, discounts: 44000 },
  { date: "Sat", redemptions: 250, discounts: 50000 },
  { date: "Sun", redemptions: 190, discounts: 38000 },
]

const mockBranchPerformance = [
  { branch: "Downtown", redemptions: 450, growth: "+12%" },
  { branch: "Mall Branch", redemptions: 380, growth: "+8%" },
  { branch: "Airport", redemptions: 320, growth: "+5%" },
  { branch: "University", redemptions: 290, growth: "-2%" },
]

const mockRedemptionTimeOfDay = [
  { time: "08:00", count: 12 },
  { time: "10:00", count: 45 },
  { time: "12:00", count: 120 },
  { time: "14:00", count: 150 },
  { time: "16:00", count: 90 },
  { time: "18:00", count: 180 },
  { time: "20:00", count: 110 },
  { time: "22:00", count: 60 },
]

const mockOfferPerformance = [
  { name: "Student Lunch Deal", redemptions: 1250, type: "top" },
  { name: "BOGO Coffee", redemptions: 980, type: "top" },
  { name: "Exam Week Special", redemptions: 850, type: "top" },
  { name: "Late Night Snack", redemptions: 120, type: "bottom" },
  { name: "Breakfast Combo", redemptions: 85, type: "bottom" },
]

export function CorporateDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const colors = DASHBOARD_COLORS("corporate")

  return (
    <div className="flex min-h-screen bg-background">
      <CorporateSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>Corporate Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage all branches and track payables</p>
          </div>

          {activeTab === "overview" && (
            <>
              {/* Key Metrics */}
              {/* Key Metrics - Financial & Customer Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Total Redemptions</span>
                      <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>2,260</div>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.primary }}>
                      <TrendingUp className="w-3 h-3" /> +12% MoM Growth
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Total Discounts Given</span>
                      <DollarSign className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>Rs. 452k</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all branches</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Avg. Discount / Order</span>
                      <DollarSign className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>Rs. 200</div>
                    <p className="text-xs text-muted-foreground mt-1">Per redemption</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Unique Students</span>
                      <Users className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>3,240</div>
                    <p className="text-xs text-muted-foreground mt-1">Avg. 0.7 redemptions/student</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {/* Charts Row 1: Redemption Analytics & Branch Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Redemption Analytics</CardTitle>
                    <CardDescription>Peak redemption hours (Time of Day)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mockRedemptionTimeOfDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="time" stroke={colors.mutedForeground} />
                        <YAxis stroke={colors.mutedForeground} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={colors.primary}
                          strokeWidth={2}
                          name="Redemptions"
                          dot={{ fill: colors.primary }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Branch Comparison</CardTitle>
                    <CardDescription>Top performing branches by redemption volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockBranchPerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
                        <XAxis type="number" stroke={colors.mutedForeground} />
                        <YAxis dataKey="branch" type="category" width={100} stroke={colors.mutedForeground} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="redemptions" fill={colors.primary} name="Redemptions" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Charts */}
              {/* Charts Row 2: Offer Performance & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Offer Performance</CardTitle>
                    <CardDescription>Top and least performing offers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockOfferPerformance.map((offer, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${offer.type === 'top' ? 'bg-green-100' : 'bg-red-100'}`}>
                              {offer.type === 'top' ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{offer.name}</p>
                              <p className="text-xs text-muted-foreground">{offer.type === 'top' ? 'Top Performing' : 'Needs Attention'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{ color: colors.primary }}>{offer.redemptions}</p>
                            <p className="text-xs text-muted-foreground">Redemptions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Redemption Distribution</CardTitle>
                    <CardDescription>By branch percentage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={mockBranchPerformance}
                          dataKey="redemptions"
                          nameKey="branch"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {mockBranchPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getChartColor("corporate", index)} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "offers" && <CorporateOffers />}

          {activeTab === "branches" && <CorporateBranches />}

          {activeTab === "reports" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle style={{ color: colors.primary }}>Reports & Export</CardTitle>
                  <CardDescription>Download detailed analytics reports</CardDescription>
                </div>
                <Button className="gap-2" style={{ backgroundColor: colors.primary }}>
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Reports functionality coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
