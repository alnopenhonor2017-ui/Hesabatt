import React, { useState } from 'react';
import { ArrowRight, User, Lock, ShieldQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Mode = 'login' | 'register' | 'forgot';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('ما هو اسم مدينتك التي ولدت فيها؟');
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper to generate a dummy email since Supabase requires email for auth
  const getDummyEmail = (user: string) => `${user.toLowerCase().replace(/\s+/g, '')}@hesabat.local`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: getDummyEmail(username),
          password: password,
        });
        if (signInError) throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        navigate('/');
      } 
      
      else if (mode === 'register') {
        if (!username || !password || !securityAnswer) throw new Error('يرجى تعبئة جميع الحقول');
        if (password.length < 6) throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

        const { error: signUpError } = await supabase.auth.signUp({
          email: getDummyEmail(username),
          password: password,
          options: {
            data: {
              username: username,
              security_question: securityQuestion,
              security_answer: securityAnswer,
            }
          }
        });
        if (signUpError) throw new Error('اسم المستخدم مسجل مسبقاً أو حدث خطأ');
        
        setSuccess('تم تسجيل الحساب بنجاح! جاري الدخول...');
        setTimeout(() => navigate('/'), 1500);
      }

      else if (mode === 'forgot') {
        if (!username || !securityAnswer || !password) throw new Error('يرجى تعبئة جميع الحقول');
        if (password.length < 6) throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

        // 1. التحقق من أن سؤال الأمان المختار يطابق المسجل في قاعدة البيانات
        const { data: correctQuestion, error: qError } = await supabase.rpc('get_security_question', { p_username: username });
        if (qError || !correctQuestion) throw new Error('اسم المستخدم غير موجود');
        
        if (correctQuestion !== securityQuestion) {
          throw new Error('سؤال الأمان المختار غير صحيح لهذا المستخدم');
        }

        // 2. التحقق من الإجابة وتغيير كلمة المرور
        const { data, error: rpcError } = await supabase.rpc('reset_password_with_security_question', {
          p_username: username,
          p_answer: securityAnswer,
          p_new_password: password
        });

        if (rpcError || !data) throw new Error('إجابة سؤال الأمان غير صحيحة');
        
        setSuccess('تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.');
        setMode('login');
        setPassword('');
        setSecurityAnswer('');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTitle = () => {
    if (mode === 'login') return 'تسجيل الدخول';
    if (mode === 'register') return 'حساب جديد';
    return 'استعادة كلمة المرور';
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center p-0 sm:p-4">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-[400px] bg-gray-50 sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative border-x-0 sm:border-x-[8px] sm:border-y-[16px] border-gray-900">
        
        <header className="bg-[#115e59] text-white px-4 py-4 flex items-center justify-between shadow-md z-10">
          <button 
            onClick={() => {
              if (mode !== 'login') setMode('login');
              else navigate('/');
            }} 
            className="p-1 hover:bg-white/10 rounded-lg transition-colors" 
            aria-label="Back"
          >
            <ArrowRight size={28} />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center tracking-wide">
            {renderTitle()}
          </h1>
          <div className="w-8"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 flex flex-col items-center justify-center">
          <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-[#115e59]">
                <User size={32} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 text-center font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 border border-green-100 text-center font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* حقل اسم المستخدم (مشترك في جميع الحالات) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">اسم المستخدم</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>
              </div>

              {/* حقل كلمة المرور (تسجيل الدخول وحساب جديد) */}
              {(mode === 'login' || mode === 'register') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                      placeholder="أدخل كلمة المرور"
                      dir="ltr"
                    />
                  </div>
                  {mode === 'login' && (
                    <div className="mt-2 text-left">
                      <button 
                        type="button" 
                        onClick={() => { setMode('forgot'); setError(''); setSuccess(''); setPassword(''); }}
                        className="text-sm text-[#115e59] font-medium hover:underline"
                      >
                        هل نسيت كلمة المرور؟
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* حقول سؤال الأمان والإجابة (حساب جديد واستعادة كلمة المرور) */}
              {(mode === 'register' || mode === 'forgot') && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">سؤال الأمان</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ShieldQuestion size={18} className="text-gray-400" />
                      </div>
                      <select 
                        value={securityQuestion}
                        onChange={(e) => setSecurityQuestion(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59] bg-white"
                      >
                        <option value="ما هو اسم مدينتك التي ولدت فيها؟">ما هو اسم مدينتك التي ولدت فيها؟</option>
                        <option value="ما هو اسم مدرستك الابتدائية؟">ما هو اسم مدرستك الابتدائية؟</option>
                        <option value="ما هو اسم حيوانك الأليف الأول؟">ما هو اسم حيوانك الأليف الأول؟</option>
                        <option value="ما هي سيارتك المفضلة؟">ما هي سيارتك المفضلة؟</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">إجابة سؤال الأمان</label>
                    <input 
                      type="text" 
                      required
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                      placeholder={mode === 'register' ? "أدخل الإجابة (تذكرها جيداً)" : "أدخل الإجابة"}
                    />
                  </div>
                </>
              )}

              {/* حقل كلمة المرور الجديدة (استعادة كلمة المرور فقط) */}
              {mode === 'forgot' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pr-10 pl-3 py-2.5 focus:outline-none focus:border-[#115e59] focus:ring-1 focus:ring-[#115e59]"
                      placeholder="أدخل كلمة المرور الجديدة"
                      dir="ltr"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-6 bg-[#115e59] text-white font-bold py-3 rounded-xl hover:bg-[#0f4c48] active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {loading ? 'جاري المعالجة...' : 
                 mode === 'login' ? 'دخول' : 
                 mode === 'register' ? 'إنشاء حساب' : 
                 'تعيين كلمة المرور'}
              </button>

            </form>

            {mode === 'login' && (
              <div className="mt-6 text-center border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600">
                  ليس لديك حساب؟{' '}
                  <button 
                    onClick={() => { setMode('register'); setError(''); setSuccess(''); setPassword(''); }}
                    className="text-[#115e59] font-bold hover:underline"
                  >
                    سجل الآن
                  </button>
                </p>
              </div>
            )}

            {(mode === 'register' || mode === 'forgot') && (
              <div className="mt-6 text-center border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600">
                  لديك حساب بالفعل؟{' '}
                  <button 
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); setPassword(''); }}
                    className="text-[#115e59] font-bold hover:underline"
                  >
                    تسجيل الدخول
                  </button>
                </p>
              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  );
}
