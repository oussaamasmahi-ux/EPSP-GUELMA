import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, Clock, User, Stethoscope, MapPin, Building, 
  Settings, LogIn, Plus, Trash2, X, Search, Share2, 
  Map, Siren, Edit3, Save, RotateCcw, ChevronUp, AlertCircle, Sun, Moon
} from 'lucide-react';

// --- Types ---
interface Specialist {
  id: string;
  day: string;
  specialty: string;
  name: string;
  shift: string;
  clinicName: string;
  originalInstitution: string;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
}

// --- Constants ---
const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ADMIN_PIN = "2024";

const EMERGENCY_NUMBERS = [
  { label: 'الحماية المدنية', phone: '1021' },
  { label: 'الأمن الوطني', phone: '1548' },
  { label: 'الدرك الوطني', phone: '1055' }
];

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Specialists State
  const [specialists, setSpecialists] = useState<Specialist[]>(() => {
    const saved = localStorage.getItem('epsp_specialists');
    return saved ? JSON.parse(saved) : [];
  });

  // Clinics State
  const [clinics, setClinics] = useState<Clinic[]>(() => {
    const saved = localStorage.getItem('epsp_clinics');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showClinicManager, setShowClinicManager] = useState(false);
  
  const [editingSpecialistId, setEditingSpecialistId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Specialist>>({
    day: DAYS[0],
    specialty: '',
    name: '',
    shift: '',
    clinicName: '',
    originalInstitution: ''
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem('epsp_specialists', JSON.stringify(specialists));
  }, [specialists]);

  useEffect(() => {
    localStorage.setItem('epsp_clinics', JSON.stringify(clinics));
  }, [clinics]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Update clock & scroll listener
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleAdminLogin = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setPinInput('');
    } else {
      alert('رمز الدخول غير صحيح! يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSaveSpecialist = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSpecialistId) {
      setSpecialists(specialists.map(s => s.id === editingSpecialistId ? { ...s, ...formData as Specialist } : s));
      setEditingSpecialistId(null);
    } else {
      setSpecialists([...specialists, { ...formData as Specialist, id: Date.now().toString() }]);
    }
    setFormData({ day: selectedDay, specialty: '', name: '', shift: '', clinicName: '', originalInstitution: '' });
  };

  const handleShare = async (spec: Specialist) => {
    const text = `معلومات الطبيب الأخصائي:\nد. ${spec.name}\nالتخصص: ${spec.specialty}\nالمكان: ${spec.clinicName}\nاليوم: ${spec.day}\nالفترة: ${spec.shift}\n\nتطبيق المؤسسة العمومية للصحة الجوارية قالمة`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'معلومات الطبيب المناوب', text });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('تم نسخ المعلومات للحافظة بنجاح!');
    }
  };

  const startEditing = (spec: Specialist) => {
    setEditingSpecialistId(spec.id);
    setFormData(spec);
    document.getElementById('admin-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const removeSpecialist = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الجدول؟')) {
      setSpecialists(specialists.filter(s => s.id !== id));
      if (editingSpecialistId === id) setEditingSpecialistId(null);
    }
  };

  const filteredSpecialists = useMemo(() => {
    let result = specialists.filter(s => s.day === selectedDay);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.specialty.toLowerCase().includes(q) || 
        s.clinicName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [specialists, selectedDay, searchQuery]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'} selection:bg-teal-500/30`}>
      <div className="medical-bg">
        <div className={`blob w-[30rem] h-[30rem] top-0 right-0 ${isDarkMode ? 'opacity-10' : 'opacity-20'}`}></div>
        <div className={`blob w-[25rem] h-[25rem] bottom-0 left-0 bg-blue-400 ${isDarkMode ? 'opacity-5' : 'opacity-10'}`}></div>
      </div>

      {/* Header */}
      <header className={`p-3 md:px-8 flex justify-between items-center backdrop-blur-2xl sticky top-0 z-50 border-b shadow-xl transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="absolute inset-0 bg-teal-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-12 h-12 md:w-16 md:h-16 overflow-hidden rounded-full border-2 border-teal-500 bg-white flex items-center justify-center p-1 shadow-lg">
              <img 
                src="https://raw.githubusercontent.com/username/repo/main/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/822/822118.png"; }}
              />
            </div>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-teal-500 uppercase tracking-tighter">EPSP GUELMA</h1>
            <p className={`text-[10px] md:text-[11px] opacity-70 font-bold leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>م.ع.ص.ج قالمة</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-2xl transition-all shadow-lg active:scale-90 ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-700'}`}
            title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => isAdminMode ? setIsAdminMode(false) : setShowAdminLogin(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-black text-sm active:scale-95 ${isAdminMode ? 'bg-red-500 text-white' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20'}`}
          >
            {isAdminMode ? <><X className="w-4 h-4" /> خروج</> : <><LogIn className="w-4 h-4" /> الإدارة</>}
          </button>
        </div>
      </header>

      {/* Emergency Marquee */}
      <div className="bg-red-600/90 backdrop-blur-md text-white py-2.5 overflow-hidden shadow-2xl relative z-40 border-y border-red-500/50">
        <div className="flex whitespace-nowrap animate-marquee gap-16 font-black text-sm uppercase items-center">
          <span className="flex items-center gap-3 bg-red-700 px-4 py-1 rounded-full"><Siren className="w-4 h-4 animate-pulse" /> أرقام الطوارئ:</span>
          {EMERGENCY_NUMBERS.concat(EMERGENCY_NUMBERS).map((num, i) => (
            <a key={i} href={`tel:${num.phone}`} className="hover:text-yellow-300 transition-colors flex items-center gap-3 group">
              <span className="opacity-80 group-hover:opacity-100">{num.label}:</span>
              <span className="text-xl tracking-widest bg-white/10 px-3 rounded-lg border border-white/10">{num.phone}</span>
            </a>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Welcome Section */}
        <section className="mb-24 text-center animate-fade-in flex flex-col items-center">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-teal-500/20 blur-[100px] rounded-full scale-150"></div>
            <div className="relative p-3 rounded-full bg-gradient-to-tr from-teal-600 via-blue-500 to-teal-400 shadow-3xl">
              <div className={isDarkMode ? "bg-slate-900 rounded-full p-4" : "bg-white rounded-full p-4"}>
                <img 
                  src="https://raw.githubusercontent.com/username/repo/main/logo.png" 
                  alt="Logo" 
                  className="w-44 h-44 md:w-60 md:h-60 object-contain rounded-full"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/822/822118.png"; }}
                />
              </div>
            </div>
          </div>
          
          <h2 className={`text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-teal-500 via-blue-400 to-teal-300 bg-clip-text text-transparent drop-shadow-2xl`}>
            صحتكم أمانة
          </h2>
          <p className={`text-xl md:text-2xl font-bold mb-14 leading-relaxed max-w-4xl mx-auto ${isDarkMode ? 'text-slate-300 opacity-80' : 'text-slate-700'}`}>
            البوابة الرقمية للمؤسسة العمومية للصحة الجوارية بقالمة، دليلك الشامل لمعرفة الأطباء المختصين المناوبين في كافة العيادات التابعة للمؤسسة.
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            <div className={`p-7 rounded-[2.5rem] shadow-2xl border flex items-center gap-6 min-w-[280px] transition-all group ${isDarkMode ? 'bg-slate-800/60 border-slate-700 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-500'}`}>
              <div className="bg-blue-500/10 p-5 rounded-2xl text-blue-500 group-hover:rotate-12 transition-transform">
                <Clock className="w-10 h-10" />
              </div>
              <div className="text-right">
                <div className="text-xs opacity-50 font-black mb-1">الوقت الآن</div>
                <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentTime.toLocaleTimeString('ar-DZ')}</div>
              </div>
            </div>
            <div className={`p-7 rounded-[2.5rem] shadow-2xl border flex items-center gap-6 min-w-[280px] transition-all group ${isDarkMode ? 'bg-slate-800/60 border-slate-700 hover:border-teal-500/30' : 'bg-white border-slate-200 hover:border-teal-500'}`}>
              <div className="bg-teal-500/10 p-5 rounded-2xl text-teal-500 group-hover:rotate-12 transition-transform">
                <Calendar className="w-10 h-10" />
              </div>
              <div className="text-right">
                <div className="text-xs opacity-50 font-black mb-1">تاريخ اليوم</div>
                <div className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {currentTime.toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialists Schedule */}
        <section className={`rounded-[4rem] p-8 md:p-14 shadow-3xl border mb-24 relative overflow-hidden group transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/60 border-slate-800 backdrop-blur-3xl' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full"></div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-10 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-5">
                <div className="bg-teal-600 p-4 rounded-3xl shadow-2xl shadow-teal-600/30">
                  <Stethoscope className="text-white w-10 h-10" />
                </div>
                <h3 className={`text-4xl md:text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>جدول المناوبات</h3>
              </div>
              <p className={`text-lg font-bold pr-4 border-r-4 border-teal-500 ${isDarkMode ? 'text-slate-400 opacity-60' : 'text-slate-500'}`}>
                اختر اليوم لعرض المختصين المتاحين
              </p>
            </div>

            <div className="relative w-full lg:w-[400px]">
              <input 
                type="text" 
                placeholder="ابحث باسم الطبيب أو التخصص..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border-2 p-6 pr-16 rounded-3xl outline-none transition-all font-black shadow-inner ${isDarkMode ? 'bg-slate-950/50 border-slate-800 focus:border-teal-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-teal-500 text-slate-900'}`}
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-teal-600 w-7 h-7" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-16 justify-center">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-8 py-4 rounded-2xl text-lg font-black transition-all border-2 active:scale-90 ${selectedDay === day 
                  ? 'bg-teal-600 text-white border-teal-600 shadow-2xl shadow-teal-600/30 scale-105' 
                  : isDarkMode ? 'bg-slate-800/40 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white' : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-teal-500 hover:text-teal-600'}`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredSpecialists.length > 0 ? (
              filteredSpecialists.map((spec, index) => (
                <div 
                  key={spec.id} 
                  className={`group/card relative p-8 rounded-[3rem] border hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50 hover:border-teal-500/50' : 'bg-slate-50 border-slate-200 hover:border-teal-500'}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex justify-between items-start mb-8">
                    <span className="bg-teal-500/10 text-teal-500 px-5 py-2 rounded-2xl text-[11px] font-black border border-teal-500/20 uppercase tracking-widest">
                      {spec.specialty}
                    </span>
                    <button onClick={() => handleShare(spec)} className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-teal-400 hover:bg-teal-400/10' : 'bg-white text-slate-400 hover:text-teal-600 border border-slate-100'}`}>
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h4 className={`text-2xl font-black mb-8 flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center text-teal-500 shadow-inner">
                       <User className="w-7 h-7" />
                    </div>
                    <span>د. {spec.name}</span>
                  </h4>

                  <div className="space-y-4">
                    <div className={`flex items-center gap-4 p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800/50' : 'bg-white border-slate-100'}`}>
                      <Clock className="w-6 h-6 text-teal-500" />
                      <div>
                        <div className="text-[10px] opacity-40 font-black uppercase tracking-tighter">الفترة</div>
                        <div className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>{spec.shift}</div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-4 p-5 rounded-3xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800/50' : 'bg-white border-slate-100'}`}>
                      <MapPin className="w-6 h-6 text-blue-500" />
                      <div>
                        <div className="text-[10px] opacity-40 font-black uppercase tracking-tighter">المكان</div>
                        <div className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>{spec.clinicName}</div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-4 p-5 rounded-3xl border ${isDarkMode ? 'bg-teal-500/10 border-teal-500/10 text-teal-400' : 'bg-teal-50 border-teal-100 text-teal-600'}`}>
                      <Building className="w-6 h-6" />
                      <div>
                        <div className="text-[10px] opacity-40 font-black uppercase tracking-tighter">المؤسسة الأصلية</div>
                        <div className="font-black">{spec.originalInstitution}</div>
                      </div>
                    </div>
                  </div>

                  {isAdminMode && (
                    <div className="absolute -top-3 -left-3 flex gap-3">
                       <button onClick={() => startEditing(spec)} className="bg-blue-600 p-4 rounded-full shadow-xl hover:scale-110 transition-transform border-4 border-slate-950"><Edit3 className="w-5 h-5 text-white"/></button>
                       <button onClick={() => removeSpecialist(spec.id)} className="bg-red-500 p-4 rounded-full shadow-xl hover:scale-110 transition-transform border-4 border-slate-950"><Trash2 className="w-5 h-5 text-white"/></button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center animate-fade-in">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-dashed ${isDarkMode ? 'bg-slate-800/20 border-slate-700 text-slate-600' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                  <AlertCircle className="w-16 h-16" />
                </div>
                <p className={`text-3xl font-black mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>لا توجد نتائج مطابقة</p>
                <p className={`text-lg font-bold max-w-md mx-auto ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>تأكد من كتابة الاسم بشكل صحيح أو جرب البحث عن تخصص آخر.</p>
              </div>
            )}
          </div>
        </section>

        {/* Admin Section */}
        {isAdminMode && (
          <div className="space-y-16 animate-slide-up mb-32">
            <section className={`p-10 md:p-14 rounded-[3.5rem] shadow-3xl border-4 relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-teal-500/50' : 'bg-white border-teal-500/20'}`}>
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-blue-500"></div>
               <div className="flex justify-between items-center mb-12">
                  <h3 className={`text-4xl font-black flex items-center gap-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Map className="text-teal-500 w-12 h-12" /> إدارة الهياكل الصحية
                  </h3>
                  <button onClick={() => setShowClinicManager(!showClinicManager)} className="bg-teal-600 px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-3 active:scale-95 text-white">
                    {showClinicManager ? <><X /> إغلاق</> : <><Plus /> إضافة عيادة</>}
                  </button>
               </div>
               
               {showClinicManager && (
                 <form className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 p-10 rounded-[3rem] border animate-scale-in ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`} onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    setClinics([...clinics, { id: 'c'+Date.now(), name: fd.get('name') as string, address: fd.get('address') as string }]);
                    (e.target as HTMLFormElement).reset();
                 }}>
                    <input name="name" placeholder="اسم العيادة" className={`p-6 rounded-2xl border-2 outline-none font-bold shadow-inner ${isDarkMode ? 'bg-slate-800 border-transparent focus:border-teal-500 text-white' : 'bg-white border-slate-100 focus:border-teal-500 text-slate-900'}`} required />
                    <input name="address" placeholder="العنوان" className={`p-6 rounded-2xl border-2 outline-none font-bold shadow-inner ${isDarkMode ? 'bg-slate-800 border-transparent focus:border-teal-500 text-white' : 'bg-white border-slate-100 focus:border-teal-500 text-slate-900'}`} required />
                    <button type="submit" className="md:col-span-2 bg-teal-500 text-white font-black py-6 rounded-2xl hover:bg-teal-400 text-2xl shadow-2xl transition-all">تأكيد الإضافة</button>
                 </form>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clinics.map(c => (
                    <div key={c.id} className={`p-7 rounded-[2rem] flex justify-between items-center border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-500 text-white' : 'bg-slate-50 border-slate-200 hover:border-teal-500'}`}>
                       <div className="flex flex-col gap-1">
                          <span className="font-black text-xl">{c.name}</span>
                          <span className="text-sm opacity-50 font-bold">{c.address}</span>
                       </div>
                       <button onClick={() => setClinics(clinics.filter(cl => cl.id !== c.id))} className="text-red-500 p-4 hover:bg-red-500/10 rounded-2xl transition-all"><Trash2 /></button>
                    </div>
                  ))}
               </div>
            </section>

            <section id="admin-form" className={`p-10 md:p-16 rounded-[4rem] shadow-3xl border-4 transition-all duration-700 ${editingSpecialistId ? 'bg-blue-950 border-blue-500' : 'bg-teal-950/50 border-teal-500/30'} text-white`}>
               <div className="flex justify-between items-center mb-14">
                  <div className="flex items-center gap-6">
                    <div className={`${editingSpecialistId ? 'bg-blue-500' : 'bg-teal-500'} p-5 rounded-[2rem] shadow-2xl`}>
                      {editingSpecialistId ? <Edit3 className="w-10 h-10" /> : <Plus className="w-10 h-10" />}
                    </div>
                    <h3 className="text-4xl font-black">{editingSpecialistId ? 'تعديل جدول المناوبة' : 'إضافة مناوبة طبية'}</h3>
                  </div>
                  {editingSpecialistId && (
                    <button onClick={() => { setEditingSpecialistId(null); setFormData({ day: selectedDay, specialty: '', name: '', shift: '', clinicName: '', originalInstitution: '' }); }} className="bg-white/10 px-6 py-3 rounded-xl flex items-center gap-2 font-black hover:bg-white/20 transition-all">
                      <RotateCcw className="w-5 h-5" /> إلغاء
                    </button>
                  )}
               </div>

               <form className="grid grid-cols-1 md:grid-cols-3 gap-10" onSubmit={handleSaveSpecialist}>
                  <div className="space-y-4">
                    <label className="text-xs font-black opacity-50 mr-4 uppercase">اليوم</label>
                    <select value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-[1.5rem] outline-none focus:border-white/30 text-white font-black appearance-none">
                      {DAYS.map(d => <option key={d} value={d} className="text-slate-900">{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black opacity-50 mr-4 uppercase">العيادة</label>
                    <select value={formData.clinicName} onChange={(e) => setFormData({...formData, clinicName: e.target.value})} className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-[1.5rem] outline-none focus:border-white/30 text-white font-black appearance-none" required>
                      <option value="" className="text-slate-400">اختر العيادة...</option>
                      {clinics.map(c => <option key={c.id} value={c.name} className="text-slate-900">{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black opacity-50 mr-4 uppercase">التخصص</label>
                    <input value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} placeholder="مثلاً: طب الأطفال" className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-[1.5rem] outline-none focus:border-white/30 text-white font-bold" required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black opacity-50 mr-4 uppercase">اسم الطبيب</label>
                    <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="الاسم واللقب" className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-[1.5rem] outline-none focus:border-white/30 text-white font-bold" required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black opacity-50 mr-4 uppercase">ساعات العمل</label>
                    <input value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} placeholder="08:00 - 16:30" className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-[1.5rem] outline-none focus:border-white/30 text-white font-bold" required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black opacity-50 mr-4 uppercase">المقر الأصلي</label>
                    <input value={formData.originalInstitution} onChange={(e) => setFormData({...formData, originalInstitution: e.target.value})} placeholder="المكان الدائم لعمل الطبيب" className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-[1.5rem] outline-none focus:border-white/30 text-white font-bold" required />
                  </div>
                  
                  <button type="submit" className={`md:col-span-3 mt-10 p-7 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-5 transition-all shadow-3xl border-b-8 active:scale-95 ${editingSpecialistId ? 'bg-blue-600 border-blue-800' : 'bg-teal-500 border-teal-700'}`}>
                    {editingSpecialistId ? <><Save /> حفظ التغييرات</> : <><Plus /> إضافة للقائمة</>}
                  </button>
               </form>
            </section>
          </div>
        )}
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl animate-fade-in">
          <div className="bg-slate-900 p-12 rounded-[4rem] w-full max-w-lg shadow-[0_0_100px_rgba(20,184,166,0.15)] animate-scale-in border-4 border-slate-800 relative">
            <button onClick={() => setShowAdminLogin(false)} className="absolute -top-6 -left-6 bg-slate-800 p-4 rounded-full shadow-2xl border border-slate-700 hover:rotate-90 transition-transform text-white"><X /></button>
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-teal-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-teal-500">
                 <Settings className="w-12 h-12 animate-spin-slow" />
              </div>
              <h3 className="text-4xl font-black mb-4 text-white">الدخول للإدارة</h3>
              <p className="opacity-50 text-lg font-bold text-slate-400">الرجاء إدخال الرمز السري للمسؤول</p>
            </div>
            
            <div className="space-y-10">
              <input 
                type="password" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="****"
                className="w-full text-center text-5xl tracking-[0.8em] p-8 rounded-[2.5rem] bg-slate-950 border-4 border-transparent focus:border-teal-500 outline-none font-black text-white shadow-inner"
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                autoFocus
              />
              <button onClick={handleAdminLogin} className="w-full py-8 bg-teal-600 text-white rounded-[2.5rem] font-black text-2xl hover:bg-teal-700 shadow-3xl transition-all active:scale-95">تأكيد الدخول</button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll Top */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="fixed bottom-10 right-10 bg-teal-600 p-5 rounded-full shadow-2xl z-50 animate-bounce hover:bg-teal-500 text-white">
          <ChevronUp className="w-8 h-8" />
        </button>
      )}

      {/* Footer */}
      <footer className={`p-20 text-center border-t mt-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-10">
           <img 
              src="https://raw.githubusercontent.com/username/repo/main/logo.png" 
              alt="Logo" 
              className={`w-32 h-32 transition-all duration-700 ${isDarkMode ? 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100' : 'opacity-80 hover:opacity-100'}`}
              onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/822/822118.png"; }}
           />
           <div className="space-y-3">
             <p className="font-black text-3xl text-teal-500 tracking-tight">المؤسسة العمومية للصحة الجوارية قالمة</p>
             <p className={`text-lg font-bold opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>الجمهورية الجزائرية الديمقراطية الشعبية - وزارة الصحة</p>
           </div>
           <div className="flex flex-col items-center gap-3">
             <p className="text-sm font-bold opacity-30 text-slate-500">© {new Date().getFullYear()} كافة الحقوق محفوظة للمؤسسة</p>
             <p className={`text-[11px] font-black tracking-[0.3em] uppercase transition-opacity cursor-default ${isDarkMode ? 'opacity-50 text-slate-400 hover:opacity-100' : 'opacity-60 text-slate-500 hover:opacity-100'}`}>صمم من طرف OSEYVET</p>
           </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(80px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }
        .animate-fade-in { animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-up { animation: slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .animate-spin-slow { animation: spin 6s linear infinite; }
        .medical-bg { pointer-events: none; }
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: ${isDarkMode ? '#020617' : '#f8fafc'}; }
        ::-webkit-scrollbar-thumb { background: #14b8a6; border-radius: 20px; border: 3px solid ${isDarkMode ? '#020617' : '#f8fafc'}; }
        select option { background-color: #0f172a; color: white; padding: 15px; }
        @media (max-width: 768px) {
          .animate-marquee { animation-duration: 25s; }
        }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);