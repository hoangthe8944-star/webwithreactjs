import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, LogOut, Settings, Camera, ChevronRight, Lock, ShieldAlert, CheckCircle2, Loader2, ArrowLeft, Sun, Moon, Palette, Check, Crown } from 'lucide-react';
import { getCurrentUser, setAccountPassword } from '../../api/authapi'; 
import { getPremiumStatus } from '../../api/premiumApi';

// Helper functions for cookies
const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const setCookie = (name: string, value: string, days = 365) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const applyTheme = (theme: string) => {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark', 'theme-default');
  if (theme === 'light') {
    root.classList.add('theme-light');
  } else if (theme === 'dark') {
    root.classList.add('theme-dark');
  } else {
    root.classList.add('theme-default');
  }
};

export function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const user = getCurrentUser();
  
  // State quản lý View
  const [activeView, setActiveView] = useState<'main' | 'password' | 'edit' | 'theme'>('main');
  const [currentTheme, setCurrentTheme] = useState<string>(getCookie('theme') || 'default');
  const [premiumStatus, setPremiumStatus] = useState<any>(null);
  const [loadingPremium, setLoadingPremium] = useState<boolean>(false);

  useEffect(() => {
    const fetchPremium = async () => {
      setLoadingPremium(true);
      try {
        const res = await getPremiumStatus();
        setPremiumStatus(res.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin Premium ở trang cá nhân:", err);
      } finally {
        setLoadingPremium(false);
      }
    };
    fetchPremium();
  }, []);

  // State Chỉnh sửa hồ sơ
  const [displayName, setDisplayName] = useState(user?.username || "");
  const [profileAccent, setProfileAccent] = useState(sessionStorage.getItem("profileAccent") || "cyan");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // State Cài đặt mật khẩu
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");

  const needsPassword = user && (user as any).password === null;

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Mật khẩu không khớp!");
    setIsSubmittingPassword(true);
    try {
      await setAccountPassword(newPassword);
      setPasswordSuccessMsg("Thiết lập mật khẩu thành công!");
      setTimeout(() => {
        setActiveView('main');
        window.location.reload(); 
      }, 2000);
    } catch (err) {
      alert("Lỗi khi lưu mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    // Giả lập lưu thành công và cập nhật Session
    setTimeout(() => {
      if (user) {
        user.username = displayName;
        sessionStorage.setItem("user", JSON.stringify(user));
      }
      sessionStorage.setItem("profileAccent", profileAccent);
      setProfileSuccessMsg("Cập nhật thông tin thành công!");
      setIsSavingProfile(false);
      
      setTimeout(() => {
        setProfileSuccessMsg("");
        setActiveView('main');
      }, 1500);
    }, 1000);
  };

  const selectTheme = (theme: string) => {
    setCurrentTheme(theme);
    setCookie('theme', theme);
    applyTheme(theme);
  };

  // Màu sắc chủ đạo (Accent Color) dựa trên cài đặt hồ sơ
  const accentColors: Record<string, { bg: string, text: string, border: string, from: string, to: string }> = {
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500', from: 'from-cyan-400', to: 'to-blue-500' },
    pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500', from: 'from-pink-400', to: 'to-rose-500' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500', from: 'from-emerald-400', to: 'to-teal-500' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500', from: 'from-yellow-400', to: 'to-orange-500' }
  };

  const currentAccent = accentColors[profileAccent] || accentColors.cyan;

  return (
    <div className="min-h-screen transition-colors duration-300 pb-16">
      {/* Hero Header Banner */}
      <div className={`relative h-64 sm:h-80 mb-200 bg-gradient-to-br ${currentAccent.from} ${currentAccent.to} flex items-end p-6 sm:p-10 overflow-hidden shadow-2xl`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] mb-200" />
        
        {/* Decorative elements */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full">
          <div className="relative group">
            <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-900/90 flex items-center justify-center border-4 ${currentAccent.border} shadow-[0_0_25px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-all duration-300 cursor-pointer`}>
              <User size={56} className={`${currentAccent.text} transition-transform duration-300 group-hover:rotate-12`} />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <Camera size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">{user?.username}</h1>
              {user?.roles?.includes('ROLE_ADMIN') && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-black uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-white/80 mt-1 font-medium">{user?.email}</p>
             <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
                {loadingPremium ? (
                  <span className="text-xs text-white/50">Đang kiểm tra gói cước...</span>
                ) : premiumStatus?.isPremium || premiumStatus?.premium || premiumStatus?.active ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-yellow-500/20 animate-pulse">
                    <Crown size={12} fill="currentColor" /> Premium ({premiumStatus?.premiumType || premiumStatus?.packageName || 'Gói hiện tại'})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                    Gói Standard
                  </span>
                )}
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10" style={{ marginTop: '3rem' }}>
        
        {/* ================= VIEW 1: MENU CHÍNH ================= */}
        {activeView === 'main' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Cảnh báo nếu chưa có mật khẩu */}
            {needsPassword && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-amber-500 shrink-0" />
                  <span className="text-sm text-amber-200 text-center sm:text-left">Tài khoản Google này chưa thiết lập mật khẩu đăng nhập trực tiếp.</span>
                </div>
                <button onClick={() => setActiveView('password')} className="text-sm font-bold text-amber-400 hover:text-amber-300 hover:underline shrink-0">Thiết lập ngay</button>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Nút Chỉnh sửa hồ sơ */}
              <button 
                onClick={() => setActiveView('edit')}
                className="p-6 bg-slate-900/30 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/50 rounded-3xl flex items-center justify-between transition-all duration-300 group hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                    <User className="text-cyan-400" size={28} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-white">Chỉnh sửa hồ sơ</p>
                    <p className="text-xs text-gray-400 mt-0.5">Thay đổi tên hiển thị và màu sắc giao diện</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              {/* Nút Cài đặt mật khẩu */}
              <button 
                onClick={() => setActiveView('password')}
                className="p-6 bg-slate-900/30 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 hover:bg-slate-900/50 rounded-3xl flex items-center justify-between transition-all duration-300 group hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="text-purple-400" size={28} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-white">Mật khẩu & Bảo mật</p>
                    <p className="text-xs text-gray-400 mt-0.5">{needsPassword ? "Chưa có mật khẩu" : "Thay đổi mật khẩu đăng nhập"}</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              {/* Nút Giao diện (Theme) */}
              <button 
                onClick={() => setActiveView('theme')}
                className="p-6 bg-slate-900/30 backdrop-blur-xl border border-white/5 hover:border-yellow-500/30 hover:bg-slate-900/50 rounded-3xl flex items-center justify-between transition-all duration-300 group hover:-translate-y-1 shadow-lg sm:col-span-2"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Settings className="text-yellow-400" size={28} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-white">Giao diện ứng dụng</p>
                    <p className="text-xs text-gray-400 mt-0.5">Cấu hình chế độ sáng tối (Lưu theo Cookie của bạn)</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Nút Đăng xuất */}
            <button 
              onClick={onLogout} 
              className="w-full mt-8 py-6 px-8 bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-600 hover:to-rose-600 border border-red-500/20 hover:border-red-500/40 text-red-500 hover:text-white rounded-2xl flex items-center justify-center gap-3 font-extrabold transition-all duration-300 shadow-lg hover:shadow-red-600/20 active:scale-[0.98] group hover:-translate-y-0.5"
            >
              <LogOut size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        )}

        {/* ================= VIEW 2: FORM MẬT KHẨU ================= */}
        {activeView === 'password' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-semibold transition-colors">
              <ArrowLeft size={20} /> Quay lại menu
            </button>
            
            <form onSubmit={handleSetPassword} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl space-y-6 shadow-2xl" style={{ padding: '2rem' }}>
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <Shield className="text-purple-400" /> {needsPassword ? "Thiết lập mật khẩu mới" : "Thay đổi mật khẩu"}
              </h2>
              
              {passwordSuccessMsg ? (
                 <div className="p-5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl text-center font-bold flex items-center justify-center gap-2 shadow-inner">
                   <CheckCircle2 size={20} /> {passwordSuccessMsg}
                 </div>
              ) : (
                <>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        className="w-full bg-black/30 border border-white/10 p-4 rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none mt-2 text-white transition-all"
                        placeholder="Tối thiểu 6 ký tự"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Xác nhận mật khẩu</label>
                      <input 
                        type="password" 
                        className="w-full bg-black/30 border border-white/10 p-4 rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none mt-2 text-white transition-all"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isSubmittingPassword}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-purple-600/30"
                  >
                    {isSubmittingPassword ? <Loader2 className="animate-spin" /> : "LƯU MẬT KHẨU MỚI"}
                  </button>
                </>
              )}
            </form>
          </div>
        )}

        {/* ================= VIEW 3: CHỈNH SỬA HỒ SƠ ================= */}
        {activeView === 'edit' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
             <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-semibold transition-colors">
              <ArrowLeft size={20} /> Quay lại menu
            </button>
            
            <form onSubmit={handleUpdateProfile} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl space-y-6 shadow-2xl" style={{ padding: '2rem' }}>
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <User className="text-cyan-400" /> Cập nhật hồ sơ cá nhân
              </h2>

              {profileSuccessMsg ? (
                 <div className="p-5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl text-center font-bold flex items-center justify-center gap-2 shadow-inner">
                   <CheckCircle2 size={20} /> {profileSuccessMsg}
                 </div>
              ) : (
                <>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Tên hiển thị</label>
                      <input 
                        type="text" 
                        className="w-full bg-black/30 border border-white/10 p-4 rounded-2xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none mt-2 text-white transition-all font-semibold"
                        placeholder="Nhập tên của bạn"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1 block mb-3">Màu sắc chủ đạo (Accent Color)</label>
                      <div className="grid grid-cols-4 gap-3">
                        {Object.entries(accentColors).map(([key, item]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setProfileAccent(key)}
                            className={`p-4 rounded-2xl border ${profileAccent === key ? `${item.border} bg-white/5` : 'border-white/5 bg-black/20 hover:bg-black/40'} flex flex-col items-center gap-2 transition-all`}
                          >
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${item.from} ${item.to}`} />
                            <span className="text-[10px] uppercase font-bold text-gray-400">{key}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={isSavingProfile}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-cyan-600/30"
                  >
                    {isSavingProfile ? <Loader2 className="animate-spin" /> : "LƯU THAY ĐỔI"}
                  </button>
                </>
              )}
            </form>
          </div>
        )}

        {/* ================= VIEW 4: CÀI ĐẶT GIAO DIỆN (THEME) ================= */}
        {activeView === 'theme' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-semibold transition-colors">
              <ArrowLeft size={20} /> Quay lại menu
            </button>
            
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl space-y-6 shadow-2xl" style={{ padding: '2rem' }}>
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <Palette className="text-yellow-400" /> Giao diện ứng dụng
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">Thay đổi chế độ hiển thị màu nền và màu chữ. Cài đặt này được lưu trữ độc lập trên trình duyệt của bạn thông qua cookie.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Mode mặc định */}
                <button 
                  onClick={() => selectTheme('default')}
                  className={`relative p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all duration-300 ${
                    currentTheme === 'default' 
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 shadow-xl' 
                      : 'border-white/5 bg-black/20 hover:bg-black/30 hover:border-white/10 text-gray-300'
                  }`}
                >
                  <div className="w-full h-24 bg-gradient-to-br from-blue-700 via-cyan-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                    <span className="text-white font-extrabold text-sm tracking-wider drop-shadow-md">Gradient</span>
                  </div>
                  <div className="flex items-center justify-between w-full px-2">
                    <span className="font-bold">Mặc định</span>
                    {currentTheme === 'default' && <Check size={18} className="text-yellow-400" />}
                  </div>
                </button>

                {/* Mode light */}
                <button 
                  onClick={() => selectTheme('light')}
                  className={`relative p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all duration-300 ${
                    currentTheme === 'light' 
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 shadow-xl' 
                      : 'border-white/5 bg-black/20 hover:bg-black/30 hover:border-white/10 text-gray-300'
                  }`}
                >
                  <div className="w-full h-24 bg-slate-100 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-slate-200">
                    <Sun size={32} className="text-yellow-500 animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between w-full px-2">
                    <span className="font-bold">Light Mode</span>
                    {currentTheme === 'light' && <Check size={18} className="text-yellow-400" />}
                  </div>
                </button>

                {/* Mode dark */}
                <button 
                  onClick={() => selectTheme('dark')}
                  className={`relative p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all duration-300 ${
                    currentTheme === 'dark' 
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 shadow-xl' 
                      : 'border-white/5 bg-black/20 hover:bg-black/30 hover:border-white/10 text-gray-300'
                  }`}
                >
                  <div className="w-full h-24 bg-slate-950 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-white/5">
                    <Moon size={32} className="text-indigo-400" />
                  </div>
                  <div className="flex items-center justify-between w-full px-2">
                    <span className="font-bold">Dark Mode</span>
                    {currentTheme === 'dark' && <Check size={18} className="text-yellow-400" />}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}