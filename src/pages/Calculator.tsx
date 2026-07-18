import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Calculator() {
  const navigate = useNavigate();
  const [display, setDisplay] = useState('0');

  const handleNumber = (num: string) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };

  const handleOperator = (op: string) => {
    setDisplay(prev => prev + op);
  };

  const calculate = () => {
    try {
      // Safe evaluation for simple math
      const result = new Function('return ' + display)();
      setDisplay(String(result));
    } catch (e) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1000);
    }
  };

  const clear = () => setDisplay('0');

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    'C', '0', '=', '+'
  ];

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Back">
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">الآلة الحاسبة</h1>
          <div className="w-8"></div>
        </header>

        <main className="flex-1 flex flex-col p-5 bg-gray-100">
          <div className="flex-1 bg-white rounded-2xl shadow-inner mb-4 flex items-end justify-end p-6 border border-gray-200">
            <span className="text-5xl font-bold text-gray-800 break-all" dir="ltr">{display}</span>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {buttons.map((btn, idx) => {
              const isOp = ['/', '*', '-', '+'].includes(btn);
              const isEq = btn === '=';
              const isC = btn === 'C';
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isC) clear();
                    else if (isEq) calculate();
                    else if (isOp) handleOperator(btn);
                    else handleNumber(btn);
                  }}
                  className={`aspect-square rounded-2xl text-2xl font-bold transition-all active:scale-95 shadow-sm
                    ${isOp ? 'bg-[#115e59] text-white hover:bg-[#0f4c48]' : 
                      isEq ? 'bg-orange-500 text-white hover:bg-orange-600' : 
                      isC ? 'bg-red-500 text-white hover:bg-red-600' : 
                      'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'}`}
                  dir="ltr"
                >
                  {btn}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
