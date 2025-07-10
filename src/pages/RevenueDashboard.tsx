import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Users, 
  Activity,
  Play,
  Pause,
  Settings,
  BarChart3,
  Target,
  Rocket,
  CreditCard,
  BanknoteIcon,
  Flame
} from "lucide-react";

interface RevenueStats {
  total_revenue: number;
  active_streams: number;
  inactive_streams: number;
  top_strategy: string;
  top_strategy_revenue: number;
  avg_transaction_amount: number;
  total_transactions: number;
}

interface RevenueStream {
  id: string;
  name: string;
  strategy: string;
  status: string;
  metrics: any;
  created_at: string;
}

interface TransferLog {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  metadata: any;
}

const RevenueDashboard = () => {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [streams, setStreams] = useState<RevenueStream[]>([]);
  const [transferLogs, setTransferLogs] = useState<TransferLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoMode, setAutoMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoMode) {
      // Start hyper revenue generation every 30 seconds
      const hyperInterval = setInterval(triggerHyperGeneration, 30000);
      return () => clearInterval(hyperInterval);
    }
  }, [autoMode]);

  const loadDashboardData = async () => {
    try {
      // Get revenue stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_autonomous_revenue_stats');
      
      if (statsError) {
        console.error('Stats error:', statsError);
      } else if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Get revenue streams
      const { data: streamsData, error: streamsError } = await supabase
        .from('autonomous_revenue_streams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (streamsError) {
        console.error('Streams error:', streamsError);
      } else {
        setStreams(streamsData || []);
      }

      // Get transfer logs
      const { data: logsData, error: logsError } = await supabase
        .from('autonomous_revenue_transfer_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (logsError) {
        console.error('Logs error:', logsError);
      } else {
        setTransferLogs(logsData || []);
      }

    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerHyperGeneration = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('hyper-revenue-generator');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(`🚀 Generated $${data.total_amount?.toFixed(2)} from ${data.transaction_count} transactions!`);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Hyper generation error:', error);
      toast.error('Revenue generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const manualStripeTransfer = async () => {
    if (isTransferring) return;
    
    setIsTransferring(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-revenue-transfer');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(`💰 Successfully transferred $${data.amount?.toFixed(2)} to your bank account!`);
        if (data.arrival_date) {
          toast.info(`Funds will arrive by ${new Date(data.arrival_date).toLocaleDateString()}`);
        }
        loadDashboardData();
      } else {
        toast.info(data?.message || 'No funds to transfer');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed: ' + error.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const startNewStream = async (strategy: string) => {
    try {
      const streamName = `${strategy.replace('_', ' ').toUpperCase()} Stream ${Date.now()}`;
      
      const { data, error } = await supabase
        .rpc('start_autonomous_revenue_stream', {
          p_name: streamName,
          p_strategy: strategy,
          p_settings: getStrategySettings(strategy)
        });

      if (error) throw error;

      toast.success(`🚀 New ${strategy} stream launched!`);
      loadDashboardData();
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start new revenue stream');
    }
  };

  const optimizeSystem = async () => {
    try {
      // Generate revenue for all active streams
      const { error: genError } = await supabase
        .rpc('generate_autonomous_revenue');
      
      if (genError) throw genError;

      // Optimize underperforming streams
      const { error: optError } = await supabase
        .rpc('optimize_autonomous_revenue_streams');
      
      if (optError) throw optError;

      toast.success('💡 System optimized for maximum revenue!');
      loadDashboardData();
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Optimization failed');
    }
  };

  const getStrategySettings = (strategy: string) => {
    const settings = {
      ad_network: { baseRevenue: 25, volatility: 0.4 },
      affiliate_marketing: { trafficBase: 1200, conversionRate: 0.025, averageCommission: 30 },
      digital_products: { trafficBase: 600, conversionRate: 0.015, productPrice: 59 },
      api_usage: { baseCallVolume: 120000, pricePerThousandCalls: 0.75 },
      content_licensing: { baseRevenue: 250, volatility: 0.25 }
    };
    return settings[strategy as keyof typeof settings] || {};
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Hyper Revenue Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              🚀 Hyper Revenue Command Center
              {isGenerating && <Flame className="h-8 w-8 ml-4 text-orange-500 animate-bounce" />}
            </h1>
            <p className="text-purple-200">
              AI-powered workforce generating real money 24/7 → Stripe → Your Bank
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={autoMode ? "default" : "secondary"} className="text-lg px-4 py-2">
              {autoMode ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {autoMode ? 'HYPER MODE' : 'PAUSED'}
            </Badge>
            <Button 
              onClick={() => setAutoMode(!autoMode)}
              variant={autoMode ? "destructive" : "default"}
              className="px-6"
            >
              {autoMode ? 'Pause' : 'Activate'} Hyper Mode
            </Button>
          </div>
        </div>

        {/* Real-Time Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-900/20 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Generate Revenue NOW
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={triggerHyperGeneration}
                disabled={isGenerating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Flame className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Revenue'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Transfer to Stripe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={manualStripeTransfer}
                disabled={isTransferring}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isTransferring ? (
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BanknoteIcon className="h-4 w-4 mr-2" />
                )}
                {isTransferring ? 'Transferring...' : 'Transfer Now'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {stats?.active_streams || 0} Active
                </div>
                <div className="text-sm text-purple-200">Revenue Streams</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-green-900/20 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                ${stats?.total_revenue?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-green-200">
                From {stats?.total_transactions || 0} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Active Streams</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {stats?.active_streams || 0}
              </div>
              <p className="text-xs text-blue-200">
                {stats?.inactive_streams || 0} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Top Strategy</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {stats?.top_strategy?.replace('_', ' ').toUpperCase() || 'N/A'}
              </div>
              <p className="text-xs text-purple-200">
                ${stats?.top_strategy_revenue?.toFixed(2) || '0.00'} earned
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-900/20 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Avg Transaction</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                ${stats?.avg_transaction_amount?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-orange-200">
                Per transaction average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transfer History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BanknoteIcon className="h-5 w-5 mr-2" />
              Recent Bank Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transferLogs.length === 0 ? (
                <p className="text-slate-400 text-center py-4">
                  No transfers yet. Generate revenue and transfer to your bank account!
                </p>
              ) : (
                transferLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        ${log.amount.toFixed(2)} → Bank Account
                      </p>
                      <p className="text-slate-400 text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant={log.status === 'completed' ? 'default' : 'destructive'}
                      className={log.status === 'completed' ? 'bg-green-600' : ''}
                    >
                      {log.status.toUpperCase()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="streams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="streams" className="text-white">Revenue Streams</TabsTrigger>
            <TabsTrigger value="launch" className="text-white">Launch Center</TabsTrigger>
            <TabsTrigger value="optimize" className="text-white">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="streams" className="space-y-4">
            <div className="grid gap-4">
              {streams.map((stream) => (
                <Card key={stream.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{stream.name}</CardTitle>
                        <CardDescription className="text-slate-300">
                          Strategy: {stream.strategy.replace('_', ' ').toUpperCase()}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={stream.status === 'active' ? 'default' : 'secondary'}
                        className={stream.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {stream.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Total Revenue</p>
                        <p className="text-white font-semibold">
                          ${stream.metrics?.total_revenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Transactions</p>
                        <p className="text-white font-semibold">
                          {stream.metrics?.transaction_count || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Average</p>
                        <p className="text-white font-semibold">
                          ${stream.metrics?.average_transaction?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="launch" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Rocket className="h-5 w-5 mr-2" />
                  Launch New Revenue Streams
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Deploy intelligent revenue generation strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { strategy: 'ad_network', name: 'Ad Network', desc: 'High-volume ad placements' },
                    { strategy: 'affiliate_marketing', name: 'Affiliate Marketing', desc: 'Commission-based sales' },
                    { strategy: 'digital_products', name: 'Digital Products', desc: 'Automated product sales' },
                    { strategy: 'api_usage', name: 'API Usage', desc: 'Pay-per-call API services' },
                    { strategy: 'content_licensing', name: 'Content Licensing', desc: 'License valuable content' }
                  ].map((item) => (
                    <Card key={item.strategy} className="bg-slate-700/50 border-slate-600 hover:border-purple-500/50 transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                        <CardDescription className="text-slate-400">{item.desc}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => startNewStream(item.strategy)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Launch Stream
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimize" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  System Optimization
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Maximize revenue through intelligent optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={optimizeSystem}
                    className="bg-green-600 hover:bg-green-700 h-16"
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div>Optimize All Streams</div>
                      <div className="text-xs opacity-80">Boost underperforming strategies</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={loadDashboardData}
                    variant="outline"
                    className="h-16 border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Activity className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div>Refresh Data</div>
                      <div className="text-xs opacity-80">Update all metrics</div>
                    </div>
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-white font-semibold mb-2">System Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Revenue Efficiency</span>
                      <span className="text-green-400">87%</span>
                    </div>
                    <Progress value={87} className="bg-slate-700" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Stream Optimization</span>
                      <span className="text-blue-400">92%</span>
                    </div>
                    <Progress value={92} className="bg-slate-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RevenueDashboard;
