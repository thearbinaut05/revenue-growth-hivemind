import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RevenueDashboard from './pages/RevenueDashboard';
import CashOutPage from './pages/CashOutPage';
import FullAutomationPage from './pages/FullAutomationPage';

function NotFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <h1 className="text-2xl font-bold">404 Not Found</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Revenue System
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/cash-out" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Cash Out
                </Link>
                <Link 
                  to="/full-automation" 
                  className="bg-purple-600 text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Full Automation
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<RevenueDashboard />} />
            <Route path="/cash-out" element={<CashOutPage />} />
            <Route path="/full-automation" element={<FullAutomationPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
