"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import React from "react";

interface AnalyticsChartsProps {
  totalRevenue: number;
  totalBookings: string | number;
  totalCustomers: number;
  topToursWithDetails: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    createdAt: Date;
    _sum: { finalAmount: number };
  }>;
  bookingsByMonth: Array<{
    createdAt: Date;
    _count: { id: number };
  }>;
}

export default function AnalyticsCharts({
  totalRevenue,
  totalBookings,
  totalCustomers,
  topToursWithDetails,
  revenueByMonth,
  bookingsByMonth
}: AnalyticsChartsProps) {
  // Process chart data
  const revenueChartData = revenueByMonth.map((r) => ({
    month: new Date(r.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' }),
    revenue: Number(r._sum.finalAmount || 0)
  }));

  const bookingsChartData = bookingsByMonth.map((b) => ({
    month: new Date(b.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' }),
    bookings: Number(b._count.id || 0)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Bookings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bookingsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 
