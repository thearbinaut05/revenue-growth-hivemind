
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, 
  Cpu, 
  Zap, 
  TrendingUp, 
  Play, 
  Pause,
  Plus,
  Activity
} from "lucide-react";

interface WorkerPool {
  id: string;
  worker_type: string;
  current_workers: number;
  max_workers: number;
  status: string;
  config: any;
}

interface Worker {
  id: string;
  worker_type: string;
  status: string;
  metrics: any;
  last_heartbeat: string;
}

const RevenueWorkerManager = () => {
  const [workerPools, setWorkerPools] = useState<WorkerPool[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkerData();
    const interval = setInterval(loadWorkerData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadWorkerData = async () => {
    try {
      const { data: poolsData } = await supabase
        .from('autonomous_revenue_worker_pool')
        .select('*');
      
      const { data: workersData } = await supabase
        .from('autonomous_revenue_workers')
        .select('*')
        .order('last_heartbeat', { ascending: false });
      
      setWorkerPools(poolsData || []);
      setWorkers(workersData || []);
    } catch (error) {
      console.error('Error loading worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scaleWorkers = async (poolId: string, action: 'up' | 'down') => {
    try {
      const pool = workerPools.find(p => p.id === poolId);
      if (!pool) return;

      const newCount = action === 'up' 
        ? Math.min(pool.current_workers + 1, pool.max_workers)
        : Math.max(pool.current_workers - 1, 0);

      // This would typically call a scaling function
      toast.success(`${action === 'up' ? 'Scaled up' : 'Scaled down'} ${pool.worker_type} workers`);
      loadWorkerData();
    } catch (error) {
      console.error('Error scaling workers:', error);
      toast.error('Failed to scale workers');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-6 w-6 animate-spin mr-2" />
        <span>Loading Worker Management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Worker Pool Management</h2>
          <p className="text-slate-400">Manage your autonomous revenue workforce</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Worker Pool
        </Button>
      </div>

      {/* Worker Pools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workerPools.map((pool) => (
          <Card key={pool.id} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white capitalize">
                  {pool.worker_type.replace('_', ' ')} Pool
                </CardTitle>
                <Badge variant={pool.status === 'active' ? 'default' : 'secondary'}>
                  {pool.status}
                </Badge>
              </div>
              <CardDescription className="text-slate-400">
                {pool.current_workers} / {pool.max_workers} workers active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Utilization</span>
                    <span className="text-white">
                      {Math.round((pool.current_workers / pool.max_workers) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(pool.current_workers / pool.max_workers) * 100} 
                    className="bg-slate-700"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => scaleWorkers(pool.id, 'up')}
                    disabled={pool.current_workers >= pool.max_workers}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Scale Up
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => scaleWorkers(pool.id, 'down')}
                    disabled={pool.current_workers <= 0}
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Scale Down
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Workers */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Active Workers ({workers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.slice(0, 9).map((worker) => (
              <div 
                key={worker.id} 
                className="bg-slate-700/50 p-4 rounded-lg border border-slate-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-white text-sm font-medium">
                      {worker.worker_type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge 
                    variant={worker.status === 'active' ? 'default' : 'secondary'}
                    className={worker.status === 'active' ? 'bg-green-600' : ''}
                  >
                    {worker.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tasks Completed</span>
                    <span className="text-white">
                      {worker.metrics?.tasks_completed || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revenue Generated</span>
                    <span className="text-green-400">
                      ${worker.metrics?.revenue_generated?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Heartbeat</span>
                    <span className="text-slate-300">
                      {new Date(worker.last_heartbeat).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueWorkerManager;
