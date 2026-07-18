import React, { useState, useEffect } from 'react';
import { ArrowRight, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, STORAGE_KEYS, getData, getAppSettings } from '../utils/storage';

export default function InventoryReports() {
  const navigate = useNavigate();
  const { currency, lowStockThreshold } = getAppSettings();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getData<Product>(STORAGE_KEYS.PRODUCTS));
  }, []);

  const totalInventoryValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">تقارير المخزن</h1>
          <div className="w-8"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-[#115e59] to-[#0f4c48] rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <Package size={24} className="text-teal-100" />
              <h2 className="text-teal-100 font-medium">إجمالي قيمة المخزون</h2>
            </div>
            <div className="text-3xl font-bold relative z-10" dir="ltr">
              {totalInventoryValue.toLocaleString('en-US')} <span className="text-lg font-normal">{currency}</span>
            </div>
            <div className="mt-4 text-sm text-teal-100 relative z-10">
              إجمالي القطع المتوفرة: {totalItems} قطعة
            </div>
          </div>

          <h3 className="font-bold text-gray-700 mb-3 px-1">تفاصيل المنتجات المتوفرة:</h3>
          
          {products.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">لا توجد منتجات في المخزن</div>
          ) : (
            <div className="space-y-3">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800">{prod.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">الكمية: <span className={prod.quantity <= lowStockThreshold ? "text-red-500 font-bold" : ""}>{prod.quantity}</span></p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#115e59]">{(prod.price * prod.quantity).toLocaleString('en-US')} {currency}</p>
                    <p className="text-xs text-gray-400 mt-1">{prod.price} / للقطعة</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
