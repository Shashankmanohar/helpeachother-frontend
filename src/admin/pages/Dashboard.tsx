import {
  Users, UserCheck, UserX, Wallet, TrendingUp, Clock,
  Layers, CreditCard, Heart, ArrowUpRight, ArrowDownRight, BarChart3,
} from "lucide-react";
import { MetricCard } from "@admin/components/MetricCard";
import { dashboardMetrics, earningsChartData } from "@admin/lib/mock-data";
import { formatCurrency, formatDate } from "@admin/lib/formatters";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(dashboardMetrics);
  const [chartData, setChartData] = useState(earningsChartData);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/api/admin/dashboard');
        if (response.metrics) {
          setMetrics(response.metrics);
        }
        if (response.chartData) {
          setChartData(response.chartData);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const m = metrics;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 admin-theme min-h-screen p-1 sm:p-2 bg-background page-enter">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl tracking-tight">Dashboard</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">System overview & real-time metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
        <MetricCard title="Total Users" value={m.totalUsers} icon={Users} variant="primary" trend={{ value: 12, label: "this week" }} />
        <MetricCard title="Active Users" value={m.activeUsers} icon={UserCheck} variant="success" trend={{ value: 8, label: "today" }} />
        <MetricCard title="Inactive Users" value={m.inactiveUsers} icon={UserX} variant="warning" />
        <MetricCard title="Wallet Circulation" value={m.totalWalletCirculation} icon={Wallet} isCurrency variant="primary" trend={{ value: 15, label: "this month" }} />
        <MetricCard title="Earnings Distributed" value={m.totalEarningsDistributed} icon={TrendingUp} isCurrency variant="success" trend={{ value: 24, label: "this month" }} />
        <MetricCard title="Pending Withdrawals" value={m.pendingWithdrawals} icon={Clock} variant="warning" />
        <MetricCard title="Autopool Collections" value={m.totalAutopoolCollections} icon={Layers} isCurrency trend={{ value: 5, label: "today" }} />
        <MetricCard title="Payouts Processed" value={m.totalPayoutsProcessed} icon={CreditCard} isCurrency variant="success" trend={{ value: 12, label: "this week" }} />
        <MetricCard title="Marriage Claims" value={m.marriageClaimsPending} icon={Heart} variant="destructive" />
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 sm:gap-6">
          <div className="glass-card p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Earnings & Withdrawals
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} width={45} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', fontSize: '12px' }} formatter={(value: number) => [formatCurrency(value)]} />
                <Area type="monotone" dataKey="earnings" stroke="hsl(142, 71%, 45%)" fillOpacity={1} fill="url(#colorEarnings)" strokeWidth={3} />
                <Area type="monotone" dataKey="withdrawals" stroke="hsl(0, 72%, 51%)" fillOpacity={1} fill="url(#colorWithdrawals)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Monthly Volume
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} width={45} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', fontSize: '12px' }} formatter={(value: number) => [formatCurrency(value)]} />
                <Bar dataKey="earnings" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="withdrawals" fill="hsl(0, 72%, 51%)" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20">
          <div className="bg-primary/5 p-4 rounded-full mb-4">
            <BarChart3 className="h-10 w-10 text-primary/40" />
          </div>
          <p className="text-sm font-medium text-foreground">No data available yet</p>
          <p className="text-xs text-muted-foreground max-w-[200px] text-center mt-1">Charts will populate as transactions flow in from the backend</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
