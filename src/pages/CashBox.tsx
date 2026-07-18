import React, { useState, useEffect } from 'react';
import { ArrowRight, Wallet, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sale, Purchase, Expense, STORAGE_KEYS, getData, getAppSettings } from '../utils/storage';

export default function CashBox() {
  const navigate = useNavigate();
  const { currency } = getAppSettings();
  
  const [totalSales, setTotalSales] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const sales = getData<Sale>(STORAGE_KEYS.SALES);
    const purchases = getData<Purchase>(STORAGE_KEYS.PURCHASES);
    const expenses = getData<Expense>(STORAGE_KEYS.EXPENSES);

    setTotalSales(sales.reduce((sum, sale) => sum + sale.totalAmount, 0));
    setTotalPurchases(purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0));
    setTotalExpenses(expenses.reduce((sum, expense) => sum + expense.amount, 0));
  }, []);

  const currentBalance = totalSales - totalPurchases - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">الصندوق</h1>
          <div className="w-8"></div> {/* Placeholder to balance the header */}
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          
          {/* Main Balance Card */}
          <div className="bg-gradient-to-br from-[#115e59] to-[#0f4c48] rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full translate-x-8 translate-y-8"></div>
            
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <Wallet size={24} className="text-teal-100" />
              <h2 className="text-teal-100 font-medium">الرصيد الحالي</h2>
            </div>
            <div className="text-4xl font-bold relative z-10" dir="ltr">
              {currentBalance.toLocaleString('en-US')} <span className="text-xl font-normal">{currency}</span>
            </div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 gap-4">
            
            {/* Sales Summary */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <TrendingUp size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">إجمالي المبيعات (وارد)</p>
                <p className="text-xl font-bold text-gray-800">+{totalSales.toLocaleString('en-US')} {currency}</p>
              </div>
            </div>

            {/* Purchases Summary */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <TrendingDown size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">إجمالي المشتريات (صادر)</p>
                <p className="text-xl font-bold text-gray-800">-{totalPurchases.toLocaleString('en-US')} {currency}</p>
              </div>
            </div>

            {/* Expenses Summary */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Receipt size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">إجمالي المصروفات (صادر)</p>
                <p className="text-xl font-bold text-gray-800">-{totalExpenses.toLocaleString('en-US')} {currency}</p>
              </div>
            </div>

          </div>

        </main>

      </div>
    </div>
  );
}
