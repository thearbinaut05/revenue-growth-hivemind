
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3,
  Settings,
  ArrowUpRight,
  DollarSign,
  Activity,
  Loader2
} from "lucide-react";

interface OptimizationResult {
  type: string;
  impact: number;
  strategy: string;
  optimization_id: string;
}

const RevenueOptimizer = () => {
  const [optimizing, setOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<any>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationResult[]>([]);
  const [autoOptimize, setAutoOptimize] = useState(true);

  // Auto-optimization runs every 30 seconds for maximum profitability
  useEffect(() => {
    if (autoOptimize) {
      const interval = setInterval(runOptimization, 30000);
      return () => clearInterval(interval);
    }
  }, [autoOptimize]);

  useEffect(() => {
    loadOptimizationHistory();
  }, []);

  const loadOptimizationHistory = async () => {
    try {
      const { data } = await supabase
        .from('autonomous_revenue_optimization')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setOptimizationHistory(data || []);
      if (data && data.length > 0) {
        setLastOptimization(data[0]);
      }
    } catch (error) {
      console.error('Error loading optimization history:', error);
    }
  };

  const runOptimization = async () => {
    if (optimizing) return;
    
    setOptimizing(true);
    try {
      toast.info('🎯 Analyzing and optimizing revenue streams for maximum profitability...');
      
      const { data, error } = await supabase.functions.invoke('revenue-optimizer');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success(`✨ Revenue optimized! Estimated impact: +$${data.total_impact?.toFixed(2)}`);
        setLastOptimization(data);
        loadOptimizationHistory();
      } else {
        toast.error('Optimization failed');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to optimize revenue');
    } finally {
      setOptimizing(false);
    }
  };

  const totalImpact = optimizationHistory.reduce((sum, opt) => {
    return sum + (opt.performance_metrics?.impact || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Main Optimizer Control */}
      <Card className="bg-gradient-to-br from-emerald-900/20 to-green-800/20 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-2xl text-emerald-400 flex items-center">
            <Target className="h-8 w-8 mr-2" />
            Revenue Optimization Engine
          </CardTitle>
          <CardDescription className="text-emerald-200">
            AI-powered optimization for maximum profitability across all revenue streams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Control Panel */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div className="flex items-center space-x-4">
              <Button
                onClick={runOptimization}
                disabled={optimizing}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
              >
                {optimizing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {optimizing ? 'Optimizing...' : 'Optimize Revenue'}
              </Button>
              
              <Button
                onClick={() => setAutoOptimize(!autoOptimize)}
                variant={autoOptimize ? "default" : "outline"}
                className={autoOptimize ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Activity className="h-4 w-4 mr-2" />
                Auto-Optimize: {autoOptimize ? 'ON' : 'OFF'}
              </Button>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-400">
                +${totalImpact.toFixed(2)}
              </p>
              <p className="text-sm text-emerald-200">Total Revenue Impact</p>
            </div>
          </div>

          {/* Optimization Status */}
          {lastOptimization && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                  <div>
                    <p className="text-xs text-slate-400">Last Impact</p>
                    <p className="text-lg font-bold text-green-400">
                      +${lastOptimization.total_impact?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-blue-400 mr-2" />
                  <div>
                    <p className="text-xs text-slate-400">Optimizations</p>
                    <p className="text-lg font-bold text-blue-400">
                      {lastOptimization.optimizations?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-purple-400 mr-2" />
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <Badge className="bg-green-600">
                      {lastOptimization.applied ? 'Applied' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-Optimization Info */}
          {autoOptimize && (
            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-400 mr-3 animate-pulse" />
                <div>
                  <h4 className="text-blue-400 font-medium">Auto-Optimization Active</h4>
                  <p className="text-blue-200 text-sm">
                    System automatically optimizes every 30 seconds for maximum profitability
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization History */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Recent Optimizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {optimizationHistory.slice(0, 10).map((optimization, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-3"></div>
                  <div>
                    <p className="text-white font-medium capitalize">
                      {optimization.optimization_type?.replace('_', ' ') || 'General Optimization'}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {optimization.metadata?.strategy || 'Revenue optimization'} • 
                      {new Date(optimization.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">
                    +${optimization.performance_metrics?.impact?.toFixed(2) || '0.00'}
                  </p>
                  <Badge className="bg-green-600 text-xs">
                    {optimization.status || 'applied'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Strategies */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Active Optimization Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-lg border border-emerald-500/20">
              <h4 className="text-emerald-400 font-medium mb-2">Dynamic Pricing</h4>
              <p className="text-emerald-200 text-sm">
                Automatically adjusts pricing based on demand, competition, and market conditions
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg border border-blue-500/20">
              <h4 className="text-blue-400 font-medium mb-2">Worker Optimization</h4>
              <p className="text-blue-200 text-sm">
                Optimizes worker allocation and scaling for maximum efficiency and revenue
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
              <h4 className="text-purple-400 font-medium mb-2">Stream Multipliers</h4>
              <p className="text-purple-200 text-sm">
                Applies performance multipliers to high-performing revenue streams
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/20">
              <h4 className="text-orange-400 font-medium mb-2">Conversion Optimization</h4>
              <p className="text-orange-200 text-sm">
                Optimizes conversion funnels and user experience for maximum revenue
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueOptimizer;
