import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Trash2, X, Minus, ShoppingCart, Printer, MessageCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sale, Product, Client, CartItem, STORAGE_KEYS, getData, saveData, updateData, deleteData, getAppSettings } from '../utils/storage';

const getPhonePrefix = (currency: string) => {
  if (currency.includes('سوداني')) return '+249';
  if (currency.includes('ريال')) return '+966';
  if (currency.includes('درهم')) return '+971';
  if (currency.includes('مصري')) return '+20';
  if (currency.includes('دولار')) return '+1';
  if (currency.includes('يورو')) return '+49';
  return '';
};

export default function Sales() {
  const navigate = useNavigate();
  const { currency, banks } = getAppSettings();
  const phonePrefix = getPhonePrefix(currency);
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Modals State
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState<Sale | null>(null);
  
  // POS Form State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'bank'>('cash');
  const [bankName, setBankName] = useState(banks.length > 0 ? banks[0].name : '');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSales(getData<Sale>(STORAGE_KEYS.SALES));
    setProducts(getData<Product>(STORAGE_KEYS.PRODUCTS));
    setClients(getData<Client>(STORAGE_KEYS.CLIENTS));
  };

  // --- POS Logic ---
  const handleOpenPos = () => {
    setCart([]);
    setSelectedProductId(products.length > 0 ? products[0].id : '');
    setClientType('existing');
    setSelectedClientId('');
    setNewClientName('');
    setNewClientPhone('');
    setPaymentMethod('cash');
    setBankName(banks.length > 0 ? banks[0].name : '');
    setIsPosModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (product.quantity <= 0) {
      alert('هذا المنتج غير متوفر في المخزن حالياً!');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === selectedProductId);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert('لا توجد كمية كافية في المخزن!');
          return prev;
        }
        return prev.map(item => item.productId === selectedProductId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty > product.quantity) {
          alert('لا توجد كمية كافية في المخزن!');
          return item;
        }
        if (newQty <= 0) return item; // Handled by remove button
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('عربة التسوق فارغة!');
      return;
    }

    // Determine Client Info
    let finalClientName = 'عميل نقدي';
    let finalClientPhone = '';

    if (clientType === 'existing' && selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        finalClientName = client.name;
        finalClientPhone = client.phone;
      }
    } else if (clientType === 'new') {
      if (newClientName.trim()) finalClientName = newClientName.trim();
      
      let typedPhone = newClientPhone.trim();
      if (typedPhone && !typedPhone.startsWith('+') && phonePrefix) {
        const cleanPhone = typedPhone.startsWith('0') ? typedPhone.substring(1) : typedPhone;
        finalClientPhone = phonePrefix + cleanPhone;
      } else {
        finalClientPhone = typedPhone;
      }
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      items: cart,
      totalAmount: cartTotal,
      date: new Date().toISOString(),
      clientName: finalClientName,
      clientPhone: finalClientPhone,
      paymentMethod: paymentMethod,
      bankName: paymentMethod === 'bank' ? bankName : undefined,
    };

    // Save Sale
    saveData<Sale>(STORAGE_KEYS.SALES, newSale);
    
    // Deduct from Inventory
    cart.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      if (product) {
        updateData<Product>(STORAGE_KEYS.PRODUCTS, product.id, { quantity: product.quantity - cartItem.quantity });
      }
    });
    
    loadData();
    setIsPosModalOpen(false);
    setInvoiceModalData(newSale); // Show invoice immediately after sale
  };

  const handleDelete = (sale: Sale) => {
    if (window.confirm('هل أنت متأكد من حذف الفاتورة؟ (سيتم إرجاع الكميات للمخزن)')) {
      // Return to Inventory
      if (sale.items) {
        sale.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            updateData<Product>(STORAGE_KEYS.PRODUCTS, product.id, { quantity: product.quantity + item.quantity });
          }
        });
      } else if (sale.productId && sale.quantity) {
        // Legacy support
        const product = products.find(p => p.id === sale.productId);
        if (product) {
          updateData<Product>(STORAGE_KEYS.PRODUCTS, product.id, { quantity: product.quantity + sale.quantity });
        }
      }
      
      deleteData<Sale>(STORAGE_KEYS.SALES, sale.id);
      loadData();
    }
  };

  // --- Invoice Helpers ---
  const getProductName = (id: string) => {
    const prod = products.find(p => p.id === id);
    return prod ? prod.name : 'منتج محذوف';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = (sale: Sale) => {
    let text = `*فاتورة مبيعات - حسابات بلس*\n`;
    text += `رقم الفاتورة: #${sale.id.slice(-6)}\n`;
    text += `التاريخ: ${new Date(sale.date).toLocaleDateString('ar-SA')}\n`;
    text += `العميل: ${sale.clientName || 'عميل نقدي'}\n`;
    text += `طريقة الدفع: ${sale.paymentMethod === 'bank' ? 'تحويل بنكي' : sale.paymentMethod === 'credit' ? 'آجل' : 'نقدي'}\n\n`;
    text += `*المنتجات:*\n`;
    
    if (sale.items) {
      sale.items.forEach(item => {
        text += `- ${item.name} (الكمية: ${item.quantity}) = ${item.price * item.quantity} ${currency}\n`;
      });
    } else if (sale.productId) { // Legacy
      text += `- ${getProductName(sale.productId)} (الكمية: ${sale.quantity}) = ${sale.totalAmount} ${currency}\n`;
    }
    
    text += `\n*الإجمالي: ${sale.totalAmount} ${currency}*`;

    const phone = sale.clientPhone ? sale.clientPhone.replace(/\+/g, '') : '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4 print:bg-white print:p-0">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900 print:border-none print:shadow-none print:h-auto print:max-w-none print:rounded-none">
        
        {/* Header - Hidden in Print */}
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10 print:hidden">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">المبيعات</h1>
          <button onClick={handleOpenPos} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Add" dir="ltr">
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </header>

        {/* Main List - Hidden in Print */}
        <main className="flex-1 overflow-y-auto p-4 print:hidden">
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-lg font-semibold">لا توجد مبيعات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.slice().reverse().map((sale) => (
                <div key={sale.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setInvoiceModalData(sale)}>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <FileText size={18} className="text-[#115e59]" />
                      {sale.items ? `فاتورة متعددة (${sale.items.length} أصناف)` : getProductName(sale.productId!)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{sale.clientName || 'عميل نقدي'}</span>
                      <span>•</span>
                      <span>{new Date(sale.date).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="mt-2 text-[#115e59] font-bold">
                      + {sale.totalAmount} {currency}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(sale); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" dir="ltr">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* POS Modal (Add Sale) */}
        {isPosModalOpen && (
          <div className="absolute inset-0 bg-gray-50 z-40 flex flex-col print:hidden animate-in slide-in-from-bottom-full duration-300 overflow-x-hidden max-w-full">
            <div className="bg-[#115e59] px-4 py-4 flex justify-between items-center text-white shadow-md">
              <h2 className="font-bold text-lg flex items-center gap-2"><ShoppingCart size={20}/> نقطة البيع (POS)</h2>
              <button onClick={() => setIsPosModalOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Client Section */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-3 text-sm">بيانات العميل</h3>
                <div className="flex gap-2 mb-3 bg-gray-100 p-1 rounded-lg">
                  <button type="button" onClick={() => setClientType('existing')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${clientType === 'existing' ? 'bg-white shadow-sm text-[#115e59]' : 'text-gray-500'}`}>عميل مسجل</button>
                  <button type="button" onClick={() => setClientType('new')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${clientType === 'new' ? 'bg-white shadow-sm text-[#115e59]' : 'text-gray-500'}`}>عميل جديد / نقدي</button>
                </div>
                
                {clientType === 'existing' ? (
                  <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#115e59]">
                    <option value="">اختر عميلاً...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="اسم العميل (اختياري)" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#115e59]" />
                    <div className="relative flex items-center" dir="ltr">
                      {!newClientPhone.startsWith('+') && phonePrefix && (
                        <span className="absolute left-3 text-gray-400 select-none pointer-events-none text-sm">{phonePrefix}</span>
                      )}
                      <input 
                        type="tel" 
                        placeholder="رقم الجوال (اختياري)" 
                        value={newClientPhone} 
                        onChange={(e) => setNewClientPhone(e.target.value)} 
                        className={`w-full border border-gray-300 rounded-lg pr-3 py-2 text-sm focus:outline-none focus:border-[#115e59] ${!newClientPhone.startsWith('+') && phonePrefix ? 'pl-14' : 'pl-3'}`} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Section */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-3 text-sm">طريقة الدفع</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(['cash', 'credit', 'bank'] as const).map(method => (
                    <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`py-2 text-sm font-medium rounded-lg border transition-all ${paymentMethod === method ? 'bg-[#115e59] text-white border-[#115e59]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {method === 'cash' ? 'نقدي' : method === 'credit' ? 'آجل' : 'تحويل بنكي'}
                    </button>
                  ))}
                </div>
                {paymentMethod === 'bank' && (
                  <select value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#115e59] mt-2">
                    {banks.length === 0 && <option value="">لا توجد بنوك مضافة</option>}
                    {banks.map(bank => <option key={bank.id} value={bank.name}>{bank.name}</option>)}
                  </select>
                )}
              </div>

              {/* Add Product Section */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-3 text-sm">إضافة منتجات للفاتورة</h3>
                <div className="flex gap-2">
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#115e59]">
                    {products.length === 0 && <option value="">لا توجد منتجات</option>}
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} {currency}) - المتاح: {p.quantity}</option>)}
                  </select>
                  <button type="button" onClick={handleAddToCart} disabled={products.length === 0} className="bg-[#115e59] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#0f4c48] active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap flex-shrink-0">
                    إضافة
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              {cart.length > 0 && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-3 text-sm">محتويات الفاتورة</h3>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.productId} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 truncate">{item.price} {currency} للوحدة</p>
                        </div>
                        <div className="flex items-center gap-3" dir="ltr">
                          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <button type="button" onClick={() => updateCartQuantity(item.productId, -1)} className="p-1.5 hover:bg-gray-200 text-gray-600"><Minus size={16}/></button>
                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                            <button type="button" onClick={() => updateCartQuantity(item.productId, 1)} className="p-1.5 hover:bg-gray-200 text-gray-600"><Plus size={16}/></button>
                          </div>
                          <p className="font-bold text-[#115e59] text-sm w-16 text-right flex-shrink-0">{item.price * item.quantity}</p>
                          <button type="button" onClick={() => removeFromCart(item.productId)} className="text-red-500 p-1 flex-shrink-0"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* POS Footer (Total & Save) */}
            <div className="bg-white p-4 border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-600">الإجمالي الكلي:</span>
                <span className="font-bold text-2xl text-[#115e59]" dir="ltr">{cartTotal} {currency}</span>
              </div>
              <button type="button" onClick={handleSaveSale} disabled={cart.length === 0} className="w-full bg-[#115e59] text-white font-bold py-3.5 rounded-xl hover:bg-[#0f4c48] active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                <FileText size={20} /> حفظ وإصدار الفاتورة
              </button>
            </div>
          </div>
        )}

        {/* Invoice Modal (View/Print/Share) */}
        {invoiceModalData && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:static print:bg-white print:p-0 print:block">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full print:max-w-none print:rounded-none">
              
              {/* Invoice Header Actions - Hidden in Print */}
              <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-200 print:hidden">
                <h2 className="font-bold text-gray-700 text-sm">عرض الفاتورة</h2>
                <button onClick={() => setInvoiceModalData(null)} className="hover:bg-gray-200 p-1 rounded-md transition-colors text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {/* Printable Invoice Area */}
              <div className="p-6 overflow-y-auto flex-1 bg-white" id="printable-invoice">
                <div className="text-center mb-6 border-b border-gray-200 pb-4">
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">حسابات بلس</h1>
                  <p className="text-gray-500 text-sm">فاتورة مبيعات ضريبية مبسطة</p>
                </div>
                
                <div className="space-y-2 mb-6 text-sm text-gray-700">
                  <div className="flex justify-between"><span className="text-gray-500">رقم الفاتورة:</span> <span className="font-bold" dir="ltr">#{invoiceModalData.id.slice(-6)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">التاريخ:</span> <span className="font-bold">{new Date(invoiceModalData.date).toLocaleString('ar-SA')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">العميل:</span> <span className="font-bold">{invoiceModalData.clientName || 'عميل نقدي'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">طريقة الدفع:</span> <span className="font-bold">{invoiceModalData.paymentMethod === 'bank' ? `تحويل بنكي (${invoiceModalData.bankName})` : invoiceModalData.paymentMethod === 'credit' ? 'آجل' : 'نقدي'}</span></div>
                </div>

                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="border-b-2 border-gray-800 text-gray-700">
                      <th className="text-right py-2">المنتج</th>
                      <th className="text-center py-2">الكمية</th>
                      <th className="text-left py-2">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceModalData.items ? (
                      invoiceModalData.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 text-right">{item.name}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-left font-bold" dir="ltr">{item.price * item.quantity}</td>
                        </tr>
                      ))
                    ) : (
                      // Legacy Support
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-right">{getProductName(invoiceModalData.productId!)}</td>
                        <td className="py-2 text-center">{invoiceModalData.quantity}</td>
                        <td className="py-2 text-left font-bold" dir="ltr">{invoiceModalData.totalAmount}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="border-t-2 border-gray-800 pt-4 flex justify-between items-center mb-8">
                  <span className="font-bold text-lg text-gray-800">الإجمالي الكلي:</span>
                  <span className="font-bold text-2xl text-gray-900" dir="ltr">{invoiceModalData.totalAmount} <span className="text-sm font-normal">{currency}</span></span>
                </div>

                <div className="text-center text-gray-400 text-xs">
                  شكراً لتعاملكم معنا
                </div>
              </div>

              {/* Invoice Footer Actions - Hidden in Print */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 print:hidden">
                <button onClick={handlePrint} className="flex-1 bg-gray-800 text-white font-bold py-2.5 rounded-xl hover:bg-gray-700 transition-colors flex justify-center items-center gap-2">
                  <Printer size={18} /> طباعة
                </button>
                <button onClick={() => handleWhatsApp(invoiceModalData)} className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl hover:bg-green-600 transition-colors flex justify-center items-center gap-2">
                  <MessageCircle size={18} /> واتساب
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
