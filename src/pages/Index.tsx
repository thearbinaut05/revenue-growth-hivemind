
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  DollarSign, 
  Zap, 
  TrendingUp, 
  Users, 
  Activity,
  ArrowRight,
  Target,
  BarChart3
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-pink-800/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600/20 text-purple-300 border-purple-500/30">
              <Zap className="h-3 w-3 mr-1" />
              Autonomous Revenue System v2.0
            </Badge>
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Hyper-Intelligent
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {" "}Revenue Engine
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Deploy an autonomous workforce of AI agents that generate revenue 24/7 across multiple streams. 
              Watch your earnings multiply while our intelligent optimization algorithms maximize every opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/revenue-dashboard')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Launch Command Center
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20 text-lg px-8 py-4"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Unleash Your Revenue Potential
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Advanced AI-driven revenue generation with real-time optimization and autonomous scaling
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <DollarSign className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform" />
                <Badge variant="secondary" className="bg-green-900/20 text-green-400">
                  Active
                </Badge>
              </div>
              <CardTitle className="text-white text-xl">Multi-Stream Revenue</CardTitle>
              <CardDescription className="text-slate-400">
                Deploy multiple revenue streams simultaneously with intelligent load balancing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Ad Networks</span>
                  <span className="text-green-400">$847/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Affiliate Marketing</span>
                  <span className="text-green-400">$623/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Digital Products</span>
                  <span className="text-green-400">$394/day</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Activity className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform" />
                <Badge variant="secondary" className="bg-blue-900/20 text-blue-400">
                  Learning
                </Badge>
              </div>
              <CardTitle className="text-white text-xl">AI Optimization</CardTitle>
              <CardDescription className="text-slate-400">
                Machine learning algorithms continuously optimize performance and maximize ROI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Success Rate</span>
                  <span className="text-blue-400">94.7%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[94.7%]"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <Badge variant="secondary" className="bg-purple-900/20 text-purple-400">
                  Scaling
                </Badge>
              </div>
              <CardTitle className="text-white text-xl">Autonomous Workers</CardTitle>
              <CardDescription className="text-slate-400">
                Self-managing AI workforce that scales automatically based on demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">127</div>
                  <div className="text-xs text-slate-400">Active Workers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">24/7</div>
                  <div className="text-xs text-slate-400">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-orange-400 group-hover:scale-110 transition-transform" />
                <Badge variant="secondary" className="bg-orange-900/20 text-orange-400">
                  Growing
                </Badge>
              </div>
              <CardTitle className="text-white text-xl">Real-Time Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                Live performance metrics with predictive insights and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Revenue Growth</span>
                  <span className="text-orange-400">+127%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Efficiency Gain</span>
                  <span className="text-orange-400">+89%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform" />
                <Badge variant="secondary" className="bg-green-900/20 text-green-400">
                  Optimized
                </Badge>
              </div>
              <CardTitle className="text-white text-xl">Smart Targeting</CardTitle>
              <CardDescription className="text-slate-400">
                AI-powered audience targeting and market opportunity identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">2.4x</div>
                <div className="text-sm text-slate-400">Conversion Improvement</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-pink-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Zap className="h-8 w-8 text-pink-400 group-hover:scale-110 transition-transform" />
                <Badge variant="secondary" className="bg-pink-900/20 text-pink-400">
                  Instant
                </Badge>
              </div>
              <CardTitle className="text-white text-xl">Rapid Deployment</CardTitle>
              <CardDescription className="text-slate-400">
                Launch new revenue streams in seconds with pre-configured templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400 mb-1">3.2s</div>
                <div className="text-sm text-slate-400">Average Deploy Time</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to 10x Your Revenue?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join the autonomous revenue revolution and let AI work for you around the clock
          </p>
          <Button 
            onClick={() => navigate('/revenue-dashboard')}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-12 py-4"
          >
            <Rocket className="h-5 w-5 mr-2" />
            Start Earning Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
