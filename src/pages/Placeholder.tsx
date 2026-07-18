import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlaceholderProps {
  title: string;
}

export default function Placeholder({ title }: PlaceholderProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        {/* Top Navigation Bar with Back Button */}
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button 
            onClick={() => navigate('/')} 
            className="p-1 hover:bg-white/10 rounded-lg transition-colors" 
            aria-label="Back"
          >
            {/* ArrowRight is used because in RTL (Right-to-Left), the back arrow points to the right */}
            <ArrowRight size={28} />
          </button>
          
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">
            {title}
          </h1>
          
          <button className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Add" dir="ltr">
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </header>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto p-5 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-500 font-medium">هذه الصفحة قيد الإنشاء</p>
            <p className="text-gray-400 text-sm mt-2">سيتم برمجتها في المراحل القادمة</p>
            
            <button 
              onClick={() => navigate('/')}
              className="mt-8 bg-[#115e59] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#0f4c48] transition-colors active:scale-95"
            >
              العودة للرئيسية
            </button>
          </div>
        </main>

      </div>
    </div>
  );
}
