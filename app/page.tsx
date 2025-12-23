"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Users, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeUsers: 0,
    totalProducts: 0,
    activeNow: 0,
    recentOrders: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats({
            ...data,
            totalRevenue: Number(data.totalRevenue) || 0,
            activeUsers: Number(data.activeUsers) || 0,
            totalProducts: Number(data.totalProducts) || 0,
            activeNow: Number(data.activeNow) || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        {/* Optional Date/Action buttons can go here */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-full">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">₹{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Users</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.activeUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Total users</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-full">
              <Package className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">In Inventory</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Now</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-full">
              <Activity className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">+{stats.activeNow}</div>
            <p className="text-xs text-gray-500 mt-1">Since last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4 shadow-sm border-gray-200/60 transition-all hover:shadow-md h-full"> {/* Increased height utility not really needed if content fills it */}
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-gray-50/50 rounded-lg m-6 border border-dashed text-gray-400">
            <p>Chart Visualization Placeholder</p>
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3 shadow-sm border-gray-200/60 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <p className="text-sm text-gray-500">
              You made {stats.recentOrders.length} sales today.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {order.User?.name?.[0] || 'G'}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-900">{order.User?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">Order #{order.id}</p>
                      </div>
                    </div>
                    <div className="font-medium text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      +₹{parseFloat(order.totalAmount).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center italic">No recent orders found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
