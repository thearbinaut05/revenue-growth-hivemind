
import React from 'react';
import ComprehensiveCashOut from '@/components/ComprehensiveCashOut';

const CashOutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">💰 Comprehensive Cash Out</h1>
          <p className="text-slate-300">Transfer all your USD earnings to your bank account or PayPal</p>
        </div>

        {/* Cash Out Component */}
        <ComprehensiveCashOut />
      </div>
    </div>
  );
};

export default CashOutPage;
