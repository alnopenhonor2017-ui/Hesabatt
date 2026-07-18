import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Edit, Trash2, X, Barcode, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, Category, STORAGE_KEYS, getData, saveData, updateData, deleteData, getAppSettings } from '../utils/storage';

export default function Products() {
  const navigate = useNavigate();
  const { currency, lowStockThreshold } = getAppSettings();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Search and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | ''>(''); // Selling Price
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(''); // Purchase Price
  const [quantity, setQuantity] = useState<number | ''>('');
  const [barcode, setBarcode] = useState('');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(getData<Product>(STORAGE_KEYS.PRODUCTS));
    setCategories(getData<Category>(STORAGE_KEYS.CATEGORIES));
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setName(product.name);
      setCategoryId(product.categoryId);
      setPrice(product.price);
      setPurchasePrice(product.purchasePrice || '');
      setQuantity(product.quantity);
      setBarcode(product.barcode || '');
    } else {
      setEditingId(null);
      setName('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setPrice('');
      setPurchasePrice('');
      setQuantity('');
      setBarcode('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || price === '' || purchasePrice === '' || quantity === '') return;

    const productData = {
      name,
      categoryId,
      price: Number(price),
      purchasePrice: Number(purchasePrice),
      quantity: Number(quantity),
      barcode,
    };

    if (editingId) {
      updateData<Product>(STORAGE_KEYS.PRODUCTS, editingId, productData);
    } else {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      saveData<Product>(STORAGE_KEYS.PRODUCTS, newProduct);
    }
    
    loadData();
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteData<Product>(STORAGE_KEYS.PRODUCTS, id);
      loadData();
    }
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'صنف غير معروف';
  };

  // Filter and Sort Logic
  const filteredAndSortedProducts = products
    .filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.barcode && p.barcode.includes(searchQuery))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'lowest_qty') return a.quantity - b.quantity;
      if (sortBy === 'highest_price') return b.price - a.price;
      if (sortBy === 'lowest_price') return a.price - b.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        {/* Header */}
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">إدارة المنتجات</h1>
          <button onClick={() => handleOpenModal()} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Add" dir="ltr">
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          
          {/* Search and Sort Controls */}
          {products.length > 0 && (
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="بحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2 text-sm focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] bg-white"
              >
                <option value="newest">المضاف حديثاً</option>
                <option value="lowest_qty">الأقل كمية</option>
                <option value="highest_price">الأعلى قيمة</option>
                <option value="lowest_price">الأقل قيمة</option>
              </select>
            </div>
          )}

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-lg font-semibold">لا توجد منتجات مضافة</p>
              <p className="text-sm text-center mt-2">
                {categories.length === 0 
                  ? "يرجى إضافة 'أصناف' أولاً لتتمكن من إضافة المنتجات." 
                  : "اضغط على علامة (+) لإضافة منتج جديد"}
              </p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              لا توجد نتائج مطابقة للبحث
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedProducts.map((prod) => (
                <div key={prod.id} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{prod.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs">{getCategoryName(prod.categoryId)}</span>
                      <span>•</span>
                      <span>الكمية: <strong className={prod.quantity <= lowStockThreshold ? "text-red-500" : "text-gray-700"}>{prod.quantity}</strong>
                        {prod.quantity <= lowStockThreshold && (
                          <span className="inline-block animate-pulse text-red-500 mr-1 font-bold text-lg">⇣</span>
                        )}
                      </span>
                    </div>
                    <div className="mt-2 text-[#115e59] font-bold">
                      {prod.price} {currency}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2" dir="ltr">
                    <button onClick={() => handleOpenModal(prod)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(prod.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-[#115e59] px-4 py-3 flex justify-between items-center text-white">
                <h2 className="font-bold text-lg">{editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                <button onClick={handleCloseModal} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                
                {categories.length === 0 && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                    تنبيه: يجب إضافة "صنف" واحد على الأقل قبل إضافة المنتجات.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم المنتج <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الصنف <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={categories.length === 0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] bg-white disabled:bg-gray-100"
                  >
                    <option value="" disabled>اختر الصنف...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Row 1: Prices */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">سعر الشراء <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">سعر البيع <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                    />
                  </div>
                </div>

                {/* Row 2: Quantity & Barcode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">الكمية <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">الباركود</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Barcode size={18} className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={categories.length === 0}
                    className="w-full bg-[#115e59] text-white font-bold py-3 rounded-xl hover:bg-[#0f4c48] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    حفظ
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
