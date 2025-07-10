
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, DollarSign, TrendingUp, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🚀 Hyper Revenue Engine
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            AI-powered autonomous workforce generating real money 24/7. 
            Connected to Stripe for automatic bank transfers. Start earning now!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/revenue-dashboard">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4">
                <Rocket className="mr-2 h-5 w-5" />
                Launch Revenue Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                Real-Time Revenue Generation
              </CardTitle>
              <CardDescription className="text-slate-300">
                Multiple revenue streams running simultaneously with AI optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-slate-400 space-y-2">
                <li>• Ad Network Revenue</li>
                <li>• Affiliate Marketing</li>
                <li>• Digital Product Sales</li>
                <li>• API Usage Billing</li>
                <li>• Content Licensing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-green-400" />
                Automatic Bank Transfers
              </CardTitle>
              <CardDescription className="text-slate-300">
                Direct integration with Stripe for seamless money transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-slate-400 space-y-2">
                <li>• Stripe Integration</li>
                <li>• Auto Bank Transfers</li>
                <li>• Real-time Tracking</li>
                <li>• Transfer History</li>
                <li>• Secure & Reliable</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-400" />
                AI-Powered Optimization
              </CardTitle>
              <CardDescription className="text-slate-300">
                Intelligent system that maximizes profits automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-slate-400 space-y-2">
                <li>• Performance Analytics</li>
                <li>• Strategy Optimization</li>
                <li>• Worker Pool Management</li>
                <li>• Revenue Alerts</li>
                <li>• Auto-scaling</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/20 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Ready to Start Earning?
              </CardTitle>
              <CardDescription className="text-purple-200 text-lg">
                Your Stripe account is connected and ready. Start generating revenue now!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/revenue-dashboard">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg px-12 py-4">
                  <Zap className="mr-2 h-5 w-5" />
                  Activate Hyper Mode
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
