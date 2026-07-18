import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category, STORAGE_KEYS, getData, saveData, updateData, deleteData } from '../utils/storage';

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Load data on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const data = getData<Category>(STORAGE_KEYS.CATEGORIES);
    setCategories(data);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setName(category.name);
      setDescription(category.description || '');
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateData<Category>(STORAGE_KEYS.CATEGORIES, editingId, { name, description });
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name,
        description,
        createdAt: new Date().toISOString(),
      };
      saveData<Category>(STORAGE_KEYS.CATEGORIES, newCategory);
    }
    
    loadCategories();
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      deleteData<Category>(STORAGE_KEYS.CATEGORIES, id);
      loadCategories();
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        {/* Header */}
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">إدارة الأصناف</h1>
          <button onClick={() => handleOpenModal()} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Add" dir="ltr">
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-lg font-semibold">لا توجد أصناف مضافة</p>
              <p className="text-sm">اضغط على علامة (+) لإضافة صنف جديد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{cat.name}</h3>
                    {cat.description && <p className="text-sm text-gray-500 mt-1">{cat.description}</p>}
                  </div>
                  <div className="flex gap-2" dir="ltr">
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={20} />
                    </button>
                    <button onClick={() => handleOpenModal(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={20} />
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
                <h2 className="font-bold text-lg">{editingId ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h2>
                <button onClick={handleCloseModal} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم الصنف <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                    placeholder="مثال: إلكترونيات، مواد غذائية..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الوصف (اختياري)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                    placeholder="وصف قصير للصنف..."
                    rows={3}
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-[#115e59] text-white font-bold py-3 rounded-xl hover:bg-[#0f4c48] active:scale-[0.98] transition-all">
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
