import React, { useState } from 'react';
import { 
  Menu, Plus, X, Edit, Users, Truck, Download, Upload, Trash2, 
  Settings as SettingsIcon, Globe, Printer, Info, Star, Share2, 
  Shield, HelpCircle, Phone, User 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const screens = [
  [
    { title: 'الأصناف', emoji: '📦', path: '/categories' },
    { title: 'المنتجات', emoji: '🛍️', path: '/products' },
    { title: 'المشتريات', emoji: '🛒', path: '/purchases' },
    { title: 'المبيعات', emoji: '💰', path: '/sales' },
    { title: 'المصروفات', emoji: '🧾', path: '/expenses' },
    { title: 'الصندوق', emoji: '🏦', path: '/cash-box' },
  ],
  [
    { title: 'الموردين', emoji: '🚚', path: '/suppliers' },
    { title: 'العملاء', emoji: '👥', path: '/clients' },
    { title: 'تقارير المخزن', emoji: '📋', path: '/inventory-reports' },
    { title: 'تقارير نهائية', emoji: '📊', path: '/final-reports' },
    { title: 'الإعدادات', emoji: '⚙️', path: '/settings' },
    { title: 'الآلة الحاسبة', emoji: '🧮', path: '/calculator' },
  ]
];

export default function Dashboard() {
  const [activeScreen, setActiveScreen] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartX - touchEndX > 50) {
      setActiveScreen(1);
    }
    if (touchEndX - touchStartX > 50) {
      setActiveScreen(0);
    }
  };

  const SidebarItem = ({ icon, text, onClick, textClassName = "text-gray-700", iconClassName = "text-gray-500" }: any) => (
    <button
      onClick={() => {
        if (onClick) onClick();
        setIsSidebarOpen(false);
      }}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-right"
    >
      <span className={iconClassName}>{icon}</span>
      <span className={`font-medium text-sm ${textClassName}`}>{text}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors" 
            aria-label="Menu" 
            dir="ltr"
          >
            <Menu size={28} />
          </button>
          
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">
            حسابات بلس - إدارة المخزن
          </h1>
          
          <button 
            onClick={() => navigate('/login')} 
            className="p-1 hover:bg-white/10 rounded-lg transition-colors" 
            aria-label="Account" 
            dir="ltr"
          >
            <User size={28} strokeWidth={2.5} />
          </button>
        </header>

        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{ transform: `translateX(${activeScreen === 0 ? '0%' : '100%'})` }}
          >
            {screens.map((screen, screenIndex) => (
              <div key={screenIndex} className="w-full flex-shrink-0 p-5">
                <div className="grid grid-cols-2 gap-4">
                  {screen.map((item, index) => {
                    return (
                      <button 
                        key={index}
                        onClick={() => navigate(item.path)}
                        className="aspect-square bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-sm active:scale-95 active:bg-gray-50 transition-all"
                      >
                        <div className="text-5xl drop-shadow-md pb-1">
                          {item.emoji}
                        </div>
                        <span className="text-gray-800 font-semibold text-sm sm:text-base">
                          {item.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>

        <div className="flex justify-center items-center gap-2 py-4 bg-gray-50">
          <button 
            onClick={() => setActiveScreen(0)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeScreen === 0 ? 'bg-[#115e59] w-6' : 'bg-gray-300'}`}
            aria-label="Screen 1"
          />
          <button 
            onClick={() => setActiveScreen(1)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeScreen === 1 ? 'bg-[#115e59] w-6' : 'bg-gray-300'}`}
            aria-label="Screen 2"
          />
        </div>

        <footer className="bg-[#115e59] text-white p-4 text-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button className="w-full text-sm font-medium hover:text-teal-100 transition-colors active:scale-[0.98]">
            مشاركة التطبيق صدقة لعل الله ينفعنا واياكم بها ، اضغط هنا
          </button>
        </footer>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Panel */}
        <div 
          className={`absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="bg-[#115e59] text-white p-4 flex items-center justify-between shadow-md">
            <h2 className="font-bold text-lg">القائمة الرئيسية</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-6">
            {/* Group 1 */}
            <div className="py-2">
              <SidebarItem icon={<Edit size={18}/>} text="تعديل فاتورة بيع" />
              <SidebarItem icon={<Edit size={18}/>} text="تعديل فاتورة شراء" />
              <SidebarItem icon={<Users size={18}/>} text="ذمم العملاء | تسديد" />
              <SidebarItem icon={<Truck size={18}/>} text="ذمم الموردين | تسديد" />
            </div>

            {/* Group 2 */}
            <div className="border-t border-gray-100 py-2">
              <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">البيانات</h3>
              <SidebarItem icon={<Download size={18}/>} text="إنشاء نسخة احتياطية" />
              <SidebarItem icon={<Upload size={18}/>} text="استعادة نسخة احتياطية" />
              <SidebarItem icon={<Trash2 size={18}/>} text="حذف بيانات" onClick={() => navigate('/settings')} textClassName="text-red-600" iconClassName="text-red-600" />
            </div>

            {/* Group 3 */}
            <div className="border-t border-gray-100 py-2">
              <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">الاعدادات</h3>
              <SidebarItem icon={<SettingsIcon size={18}/>} text="اعدادات النظام" onClick={() => navigate('/settings')} />
              <SidebarItem icon={<Globe size={18}/>} text="لغة التطبيق" />
              <SidebarItem icon={<Printer size={18}/>} text="الطباعة" />
            </div>

            {/* Group 4 */}
            <div className="border-t border-gray-100 py-2">
              <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">عن التطبيق</h3>
              <SidebarItem icon={<Info size={18}/>} text="عن التطبيق" />
              <SidebarItem icon={<Star size={18}/>} text="قيم التطبيق" />
              <SidebarItem icon={<Share2 size={18}/>} text="مشاركة التطبيق" />
              <SidebarItem icon={<Shield size={18}/>} text="سياسة الخصوصية" />
              <SidebarItem icon={<HelpCircle size={18}/>} text="المساعدة" />
              <SidebarItem icon={<Phone size={18}/>} text="تواصل معنا" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
