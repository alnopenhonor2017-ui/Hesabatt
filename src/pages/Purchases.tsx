import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Purchase, Product, STORAGE_KEYS, getData, saveData, updateData, deleteData, getAppSettings, generateUUID } from '../utils/storage';

export default function Purchases() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('جنيه سوداني');
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [totalCost, setTotalCost] = useState<number | ''>('');

  useEffect(() => {
    getAppSettings().then(s => setCurrency(s.currency));
    loadData();
  }, []);

  const loadData = async () => {
    const [pur, prod] = await Promise.all([
      getData<Purchase>(STORAGE_KEYS.PURCHASES),
      getData<Product>(STORAGE_KEYS.PRODUCTS)
    ]);
    setPurchases(pur);
    setProducts(prod);
  };

  const handleOpenModal = () => {
    setProductId(products.length > 0 ? products[0].id : '');
    setQuantity('');
    setTotalCost('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity === '' || totalCost === '' || Number(quantity) <= 0) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const qty = Number(quantity);
    const cost = Number(totalCost);

    const newPurchase: Purchase = {
      id: generateUUID(),
      productId,
      supplierId: 'general',
      quantity: qty,
      totalCost: cost,
      date: new Date().toISOString(),
    };

    await saveData<Purchase>(STORAGE_KEYS.PURCHASES, newPurchase);
    await updateData<Product>(STORAGE_KEYS.PRODUCTS, productId, { quantity: product.quantity + qty });
    
    await loadData();
    handleCloseModal();
  };

  const handleDelete = async (purchase: Purchase) => {
    if (window.confirm('هل أنت متأكد من حذف عملية الشراء؟ (سيتم خصم الكمية من المخزن)')) {
      const product = products.find(p => p.id === purchase.productId);
      if (product) {
        await updateData<Product>(STORAGE_KEYS.PRODUCTS, product.id, { quantity: Math.max(0, product.quantity - purchase.quantity) });
      }
      await deleteData<Purchase>(STORAGE_KEYS.PURCHASES, purchase.id);
      await loadData();
    }
  };

  const getProductName = (id: string) => {
    const prod = products.find(p => p.id === id);
    return prod ? prod.name : 'منتج محذوف';
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">المشتريات</h1>
          <button onClick={handleOpenModal} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Add" dir="ltr">
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg font-semibold">لا توجد مشتريات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.slice().reverse().map((purchase) => (
                <div key={purchase.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{getProductName(purchase.productId)}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>الكمية: {purchase.quantity}</span>
                      <span>•</span>
                      <span>{new Date(purchase.date).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="mt-2 text-red-600 font-bold">
                      - {purchase.totalCost} {currency}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(purchase)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" dir="ltr">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        {isModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-[#115e59] px-4 py-3 flex justify-between items-center text-white">
                <h2 className="font-bold text-lg">إضافة فاتورة مشتريات</h2>
                <button onClick={handleCloseModal} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                {products.length === 0 && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                    يجب إضافة منتجات أولاً لتتمكن من شرائها.
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">المنتج <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    disabled={products.length === 0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] bg-white"
                  >
                    <option value="" disabled>اختر المنتج...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">الكمية <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">التكلفة الإجمالية <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={totalCost}
                      onChange={(e) => setTotalCost(e.target.value ? Number(e.target.value) : '')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={products.length === 0}
                    className="w-full bg-[#115e59] text-white font-bold py-3 rounded-xl hover:bg-[#0f4c48] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    تأكيد الشراء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
