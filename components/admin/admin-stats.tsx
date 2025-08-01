import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign } from "lucide-react"

export async function AdminStats() {
  // Simple stats data - in a real app, this would come from the database
  const stats = {
    totalRevenue: { value: 89500, change: 12.5 },
    totalBookings: { value: 1247, change: 8.3 },
    totalCustomers: { value: 892, change: 15.2 },
    conversionRate: { value: 85.5, change: 2.1 },
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.value.toLocaleString()}`,
      change: `${stats.totalRevenue.change >= 0 ? "+" : ""}${stats.totalRevenue.change}%`,
      changeType: stats.totalRevenue.change >= 0 ? "positive" : "negative",
      icon: DollarSign,
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.value.toLocaleString(),
      change: `${stats.totalBookings.change >= 0 ? "+" : ""}${stats.totalBookings.change}%`,
      changeType: stats.totalBookings.change >= 0 ? "positive" : "negative",
      icon: Calendar,
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.value.toLocaleString(),
      change: `${stats.totalCustomers.change >= 0 ? "+" : ""}${stats.totalCustomers.change}%`,
      changeType: stats.totalCustomers.change >= 0 ? "positive" : "negative",
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate.value}%`,
      change: `${stats.conversionRate.change >= 0 ? "+" : ""}${stats.conversionRate.change}%`,
      changeType: stats.conversionRate.change >= 0 ? "positive" : "negative",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-earth-600">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-earth-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-earth-900">{stat.value}</div>
            <div className="flex items-center mt-1">
              {stat.changeType === "positive" ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <p className={`text-xs ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from last month
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
