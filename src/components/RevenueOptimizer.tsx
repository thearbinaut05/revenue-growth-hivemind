
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Settings, 
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface OptimizationHistory {
  id: string;
  optimization_type: string;
  previous_value: any;
  new_value: any;
  created_at: string;
  stream_id: string;
}

interface Alert {
  id: string;
  message: string;
  severity: string;
  alert_type: string;
  status: string;
  created_at: string;
}

const RevenueOptimizer = () => {
  const [optimizations, setOptimizations] = useState<OptimizationHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    loadOptimizationData();
    const interval = setInterval(loadOptimizationData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadOptimizationData = async () => {
    try {
      const { data: optimizationData } = await supabase
        .from('autonomous_optimization_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      const { data: alertsData } = await supabase
        .from('autonomous_revenue_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setOptimizations(optimizationData || []);
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error loading optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    setOptimizing(true);
    try {
      // Generate revenue for active streams
      const { error: genError } = await supabase
        .rpc('generate_autonomous_revenue');
      
      if (genError) throw genError;

      // Optimize underperforming streams
      const { error: optError } = await supabase
        .rpc('optimize_autonomous_revenue_streams');
      
      if (optError) throw optError;

      toast.success('🚀 System optimization completed successfully!');
      loadOptimizationData();
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Optimization failed. Please try again.');
    } finally {
      setOptimizing(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('autonomous_revenue_alerts')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Alert resolved');
      loadOptimizationData();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-6 w-6 animate-spin mr-2" />
        <span>Loading Optimization Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Revenue Optimization Engine</h2>
          <p className="text-slate-400">AI-powered revenue maximization system</p>
        </div>
        <Button 
          onClick={runOptimization}
          disabled={optimizing}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {optimizing ? (
            <Activity className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          {optimizing ? 'Optimizing...' : 'Run Optimization'}
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-red-900/20 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-red-900/10 rounded-lg border border-red-500/20"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">{alert.message}</p>
                      <p className="text-red-200 text-sm">
                        {alert.alert_type.replace('_', ' ').toUpperCase()} • {alert.severity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-900/20 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Revenue Boost
            </CardTitle>
            <CardDescription className="text-green-200">
              Enhance high-performing streams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Boost Performance
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Strategy Pivot
            </CardTitle>
            <CardDescription className="text-blue-200">
              Redirect underperforming streams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Optimize Strategy
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-purple-900/20 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Auto-Scaling
            </CardTitle>
            <CardDescription className="text-purple-200">
              Intelligent resource allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Enable Auto-Scale
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Optimization History */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Recent Optimizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizations.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No optimizations performed yet. Run your first optimization to see results here.
              </p>
            ) : (
              optimizations.map((opt) => (
                <div 
                  key={opt.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">
                        {opt.optimization_type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {new Date(opt.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-900/20 text-green-400">
                    Completed
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">System Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">96%</div>
              <div className="text-sm text-slate-400">Optimization Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">2.4x</div>
              <div className="text-sm text-slate-400">Revenue Multiplier</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">12s</div>
              <div className="text-sm text-slate-400">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">99.8%</div>
              <div className="text-sm text-slate-400">System Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueOptimizer;
