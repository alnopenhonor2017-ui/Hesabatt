import React, { useState, useEffect } from 'react';
import { ArrowRight, Trash2, ShieldAlert, Cog, Landmark, Plus, Edit, X, Database, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppSettings, Bank, getAppSettings, saveAppSettings } from '../utils/storage';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  
  // Bank Modal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    saveAppSettings(settings);
  }, [settings]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, currency: e.target.value }));
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? Number(e.target.value) : 0;
    setSettings(prev => ({ ...prev, lowStockThreshold: val }));
  };

  // --- Banks Logic ---
  const handleOpenBankModal = (bank?: Bank) => {
    if (bank) {
      setEditingBankId(bank.id);
      setBankName(bank.name);
    } else {
      setEditingBankId(null);
      setBankName('');
    }
    setIsBankModalOpen(true);
  };

  const handleCloseBankModal = () => {
    setIsBankModalOpen(false);
    setEditingBankId(null);
    setBankName('');
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) return;

    if (editingBankId) {
      setSettings(prev => ({
        ...prev,
        banks: prev.banks.map(b => b.id === editingBankId ? { ...b, name: bankName } : b)
      }));
    } else {
      const newBank: Bank = { id: Date.now().toString(), name: bankName };
      setSettings(prev => ({ ...prev, banks: [...prev.banks, newBank] }));
    }
    handleCloseBankModal();
  };

  const handleDeleteBank = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البنك؟')) {
      setSettings(prev => ({
        ...prev,
        banks: prev.banks.filter(b => b.id !== id)
      }));
    }
  };

  const handleClearData = () => {
    const confirm1 = window.confirm('تحذير: هل أنت متأكد من رغبتك في مسح جميع البيانات؟ لا يمكن التراجع عن هذه الخطوة.');
    if (confirm1) {
      const confirm2 = window.confirm('تأكيد نهائي: سيتم مسح جميع الأصناف، المنتجات، المبيعات، المشتريات، والمصروفات. هل تريد الاستمرار؟');
      if (confirm2) {
        localStorage.clear();
        alert('تم مسح جميع البيانات بنجاح.');
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">الإعدادات</h1>
          <div className="w-8"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* General Settings */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-[#115e59] mb-4">
              <Cog size={24} />
              <h2 className="font-bold text-lg">إعدادات عامة</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">العملة الافتراضية</label>
                <select 
                  value={settings.currency} 
                  onChange={handleCurrencyChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] bg-white"
                >
                  <option value="جنيه سوداني">جنيه سوداني (SDG)</option>
                  <option value="ريال">ريال سعودي (SAR)</option>
                  <option value="دولار">دولار أمريكي (USD)</option>
                  <option value="يورو">يورو (EUR)</option>
                  <option value="درهم">درهم إماراتي (AED)</option>
                  <option value="جنيه مصري">جنيه مصري (EGP)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">تنبيه نقص المخزون (أقل من أو يساوي)</label>
                <input 
                  type="number" 
                  min="0"
                  value={settings.lowStockThreshold}
                  onChange={handleThresholdChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                />
              </div>
            </div>
          </div>

          {/* Banks Management */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[#115e59]">
                <Landmark size={24} />
                <h2 className="font-bold text-lg">إدارة البنوك</h2>
              </div>
              <button onClick={() => handleOpenBankModal()} className="p-1.5 bg-[#115e59] text-white hover:bg-[#0f4c48] rounded-lg transition-colors">
                <Plus size={20} />
              </button>
            </div>
            
            {settings.banks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">لا توجد بنوك مضافة</p>
            ) : (
              <div className="space-y-2">
                {settings.banks.map(bank => (
                  <div key={bank.id} className="flex justify-between items-center p-3 border border-gray-100 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-800 text-sm">{bank.name}</span>
                    <div className="flex gap-2" dir="ltr">
                      <button onClick={() => handleDeleteBank(bank.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <button onClick={() => handleOpenBankModal(bank)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cloud Database Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-blue-600 mb-4">
              <Database size={24} />
              <h2 className="font-bold text-lg">قاعدة البيانات السحابية</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              التطبيق يعمل حالياً بنظام التخزين المحلي (بدون إنترنت). لإنشاء جداول قاعدة بيانات حقيقية ومزامنة بياناتك عبر الأجهزة، يرجى ربط حساب Supabase.
            </p>
            <button 
              onClick={() => alert('يرجى ربط حساب Supabase الخاص بك من خلال واجهة Dualite أولاً لنتمكن من إنشاء الجداول وربط التطبيق بقاعدة البيانات السحابية.')}
              className="w-full bg-blue-50 text-blue-600 border border-blue-200 font-bold py-3 rounded-xl hover:bg-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Cloud size={20} />
              إعداد قاعدة البيانات (Supabase)
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <ShieldAlert size={24} />
              <h2 className="font-bold text-lg">منطقة الخطر</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              استخدم هذا الخيار إذا كنت ترغب في تصفير التطبيق بالكامل والبدء من جديد. سيتم حذف كافة السجلات المالية والمنتجات نهائياً.
            </p>
            <button 
              onClick={handleClearData}
              className="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-xl hover:bg-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              مسح جميع البيانات
            </button>
          </div>

          <div className="text-center text-gray-400 text-sm mt-10">
            <p>إصدار التطبيق 1.0.0</p>
            <p>تم التطوير بواسطة حسابات بلس</p>
          </div>

        </main>

        {/* Bank Modal */}
        {isBankModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-[#115e59] px-4 py-3 flex justify-between items-center text-white">
                <h2 className="font-bold text-lg">{editingBankId ? 'تعديل البنك' : 'إضافة بنك جديد'}</h2>
                <button onClick={handleCloseBankModal} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveBank} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم البنك <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
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
