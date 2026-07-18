import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client, STORAGE_KEYS, getData, saveData, updateData, deleteData, getAppSettings } from '../utils/storage';

const getPhonePrefix = (currency: string) => {
  if (currency.includes('سوداني')) return '+249';
  if (currency.includes('ريال')) return '+966';
  if (currency.includes('درهم')) return '+971';
  if (currency.includes('مصري')) return '+20';
  if (currency.includes('دولار')) return '+1';
  if (currency.includes('يورو')) return '+49';
  return '';
};

export default function Clients() {
  const navigate = useNavigate();
  const { currency } = getAppSettings();
  const phonePrefix = getPhonePrefix(currency);

  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(getData<Client>(STORAGE_KEYS.CLIENTS));
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingId(client.id);
      setName(client.name);
      setPhone(client.phone);
    } else {
      setEditingId(null);
      setName('');
      setPhone('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalPhone = phone.trim();
    if (finalPhone && !finalPhone.startsWith('+') && phonePrefix) {
      const cleanPhone = finalPhone.startsWith('0') ? finalPhone.substring(1) : finalPhone;
      finalPhone = phonePrefix + cleanPhone;
    }

    if (editingId) {
      updateData<Client>(STORAGE_KEYS.CLIENTS, editingId, { name, phone: finalPhone });
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        name,
        phone: finalPhone,
        createdAt: new Date().toISOString(),
      };
      saveData<Client>(STORAGE_KEYS.CLIENTS, newClient);
    }
    
    loadData();
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteData<Client>(STORAGE_KEYS.CLIENTS, id);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">العملاء</h1>
          <button onClick={() => handleOpenModal()} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Add" dir="ltr">
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-lg font-semibold">لا يوجد عملاء</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <div key={client.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{client.name}</h3>
                    {client.phone && <p className="text-sm text-gray-500 mt-1" dir="ltr">{client.phone}</p>}
                  </div>
                  <div className="flex gap-2" dir="ltr">
                    <button onClick={() => handleDelete(client.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={20} />
                    </button>
                    <button onClick={() => handleOpenModal(client)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {isModalOpen && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-[#115e59] px-4 py-3 flex justify-between items-center text-white">
                <h2 className="font-bold text-lg">{editingId ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
                <button onClick={handleCloseModal} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم العميل <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">رقم الهاتف</label>
                  <div className="relative flex items-center" dir="ltr">
                    {!phone.startsWith('+') && phonePrefix && (
                      <span className="absolute left-3 text-gray-400 select-none pointer-events-none">{phonePrefix}</span>
                    )}
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full border border-gray-300 rounded-lg pr-3 py-2 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] ${!phone.startsWith('+') && phonePrefix ? 'pl-14' : 'pl-3'}`}
                      dir="ltr"
                    />
                  </div>
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
