import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Expense, STORAGE_KEYS, getData, saveData, deleteData, getAppSettings, generateUUID } from '../utils/storage';

export default function Expenses() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('جنيه سوداني');
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  useEffect(() => {
    getAppSettings().then(s => setCurrency(s.currency));
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getData<Expense>(STORAGE_KEYS.EXPENSES);
    setExpenses(data);
  };

  const handleOpenModal = () => {
    setDescription('');
    setAmount('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount === '' || Number(amount) <= 0) return;

    const newExpense: Expense = {
      id: generateUUID(),
      description,
      amount: Number(amount),
      date: new Date().toISOString(),
    };

    await saveData<Expense>(STORAGE_KEYS.EXPENSES, newExpense);
    await loadData();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      await deleteData<Expense>(STORAGE_KEYS.EXPENSES, id);
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">المصروفات</h1>
          <button onClick={handleOpenModal} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Add" dir="ltr">
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">🧾</div>
              <p className="text-lg font-semibold">لا توجد مصروفات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice().reverse().map((expense) => (
                <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{expense.description}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{new Date(expense.date).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="mt-2 text-red-600 font-bold">
                      - {expense.amount} {currency}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(expense.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" dir="ltr">
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
                <h2 className="font-bold text-lg">إضافة مصروف جديد</h2>
                <button onClick={handleCloseModal} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">البيان / الوصف <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثال: فاتورة كهرباء، رواتب..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">المبلغ <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                  />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-[#115e59] text-white font-bold py-3 rounded-xl hover:bg-[#0f4c48] active:scale-[0.98] transition-all"
                  >
                    حفظ المصروف
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
