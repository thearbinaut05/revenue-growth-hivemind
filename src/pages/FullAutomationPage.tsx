
import React from 'react';
import FullAutomationController from '@/components/FullAutomationController';

const FullAutomationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">🤖 Full Database USD Automation</h1>
          <p className="text-slate-300">
            Automatically transfer ALL USD from every database table to your external accounts
          </p>
        </div>

        {/* Main Controller */}
        <FullAutomationController />
      </div>
    </div>
  );
};

export default FullAutomationPage;
