import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sale, Purchase, Expense, STORAGE_KEYS, getData, getAppSettings } from '../utils/storage';

export default function FinalReports() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('جنيه سوداني');
  
  const [totalSales, setTotalSales] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    getAppSettings().then(s => setCurrency(s.currency));
    
    const loadData = async () => {
      const [sales, purchases, expenses] = await Promise.all([
        getData<Sale>(STORAGE_KEYS.SALES),
        getData<Purchase>(STORAGE_KEYS.PURCHASES),
        getData<Expense>(STORAGE_KEYS.EXPENSES)
      ]);

      setTotalSales(sales.reduce((sum, sale) => sum + sale.totalAmount, 0));
      setTotalPurchases(purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0));
      setTotalExpenses(expenses.reduce((sum, expense) => sum + expense.amount, 0));
    };
    
    loadData();
  }, []);

  const netProfit = totalSales - totalPurchases - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">تقارير نهائية</h1>
          <div className="w-8"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          
          <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden ${netProfit >= 0 ? 'bg-gradient-to-br from-[#115e59] to-[#0f4c48]' : 'bg-gradient-to-br from-red-600 to-red-800'}`}>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <BarChart3 size={24} className="text-white/80" />
              <h2 className="text-white/90 font-medium">صافي الأرباح / الخسائر</h2>
            </div>
            <div className="text-4xl font-bold relative z-10" dir="ltr">
              {netProfit.toLocaleString('en-US')} <span className="text-xl font-normal">{currency}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <TrendingUp size={20} />
              </div>
              <p className="text-xs text-gray-500 font-medium">المبيعات</p>
              <p className="font-bold text-gray-800">{totalSales.toLocaleString('en-US')}</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <TrendingDown size={20} />
              </div>
              <p className="text-xs text-gray-500 font-medium">المشتريات</p>
              <p className="font-bold text-gray-800">{totalPurchases.toLocaleString('en-US')}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Receipt size={20} />
              </div>
              <p className="text-sm text-gray-600 font-medium">إجمالي المصروفات</p>
            </div>
            <p className="font-bold text-gray-800">{totalExpenses.toLocaleString('en-US')} {currency}</p>
          </div>

        </main>
      </div>
    </div>
  );
}
