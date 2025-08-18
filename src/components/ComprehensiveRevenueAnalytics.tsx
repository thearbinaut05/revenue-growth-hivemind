
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Target,
  Zap,
  ArrowUpRight,
  PieChart,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

const ComprehensiveRevenueAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get comprehensive revenue data
      const [transactionsResponse, streamsResponse, transfersResponse] = await Promise.all([
        supabase.from('autonomous_revenue_transactions').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('autonomous_revenue_streams').select('*').eq('status', 'active'),
        supabase.from('autonomous_revenue_transfers').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      const transactions = transactionsResponse.data || [];
      const streams = streamsResponse.data || [];
      const transfers = transfersResponse.data || [];

      // Calculate analytics
      const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const last24Hours = transactions.filter(t => 
        new Date(t.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      const revenue24h = last24Hours.reduce((sum, t) => sum + Number(t.amount), 0);
      
      const last7Days = transactions.filter(t => 
        new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      const revenue7d = last7Days.reduce((sum, t) => sum + Number(t.amount), 0);

      // Revenue by strategy
      const revenueByStrategy = transactions.reduce((acc, t) => {
        const strategy = t.metadata?.strategy || 'unknown';
        acc[strategy] = (acc[strategy] || 0) + Number(t.amount);
        return acc;
      }, {});

      // Create time series data for chart
      const timeSeriesData = [];
      for (let i = 23; i >= 0; i--) {
        const date = new Date(Date.now() - i * 60 * 60 * 1000);
        const hourlyTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.created_at);
          return transactionDate >= date && transactionDate < new Date(date.getTime() + 60 * 60 * 1000);
        });
        
        timeSeriesData.push({
          time: date.getHours() + ':00',
          revenue: hourlyTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
          transactions: hourlyTransactions.length
        });
      }

      setAnalytics({
        totalRevenue,
        revenue24h,
        revenue7d,
        totalTransactions: transactions.length,
        activeStreams: streams.length,
        avgTransactionValue: totalRevenue / transactions.length || 0,
        revenueByStrategy,
        successfulTransfers: transfers.filter(t => t.status === 'completed').length,
        totalTransferred: transfers.filter(t => t.status === 'completed').reduce((sum, t) => sum + Number(t.amount), 0)
      });

      setRevenueHistory(timeSeriesData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center justify-center p-8">
          <Activity className="h-6 w-6 animate-spin mr-2" />
          <span>Loading comprehensive analytics...</span>
        </CardContent>
      </Card>
    );
  }

  const pieData = analytics?.revenueByStrategy ? Object.entries(analytics.revenueByStrategy).map(([strategy, amount]) => ({
    name: strategy.replace('_', ' ').toUpperCase(),
    value: Number(amount),
    percentage: ((Number(amount) / analytics.totalRevenue) * 100).toFixed(1)
  })) : [];

  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/30 to-green-800/30 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-400">
                  ${analytics?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-xs text-emerald-300">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {analytics?.totalTransactions || 0} transactions
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-800/30 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">24h Revenue</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${analytics?.revenue24h?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
            <div className="mt-2">
              <Progress 
                value={((analytics?.revenue24h || 0) / (analytics?.totalRevenue || 1)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-800/30 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Avg Transaction</p>
                <p className="text-2xl font-bold text-purple-400">
                  ${analytics?.avgTransactionValue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-600 text-xs">
                High-Value Transactions
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/30 to-red-800/30 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm">Active Streams</p>
                <p className="text-2xl font-bold text-orange-400">
                  {analytics?.activeStreams || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-xs text-orange-300">
                <Activity className="h-3 w-3 mr-1" />
                Maximum Profitability
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Revenue Trend (24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Revenue by Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Total Transferred</span>
              <span className="text-green-400 font-bold">
                ${analytics?.totalTransferred?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Successful Transfers</span>
              <Badge className="bg-green-600">
                {analytics?.successfulTransfers || 0}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">7-Day Revenue</span>
              <span className="text-blue-400 font-bold">
                ${analytics?.revenue7d?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Growth Rate</span>
              <div className="flex items-center text-green-400">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="font-bold">
                  {analytics?.revenue24h && analytics?.revenue7d 
                    ? (((analytics.revenue24h * 7) / analytics.revenue7d - 1) * 100).toFixed(1)
                    : '0'
                  }%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveRevenueAnalytics;
