import { useState } from 'react';
import { User, Mail, Calendar, Shield, LogOut, Settings, Camera, ChevronRight, Lock, ShieldAlert, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { getCurrentUser, setAccountPassword, logout } from '../../api/authapi'; 

export function ProfilePage({ onLogout }: { onLogout: () => void }) {
  const user = getCurrentUser();
  console.log("Dữ liệu User hiện tại:", user); // Xem nó là user.id hay user._id
  // ✅ 1. Quản lý các View (Chế độ hiển thị)
  // 'main': Menu chính | 'password': Form đặt mật khẩu | 'edit': Form sửa profile
  const [activeView, setActiveView] = useState<'main' | 'password' | 'edit'>('main');

  // State cho Form mật khẩu
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Kiểm tra nếu là user Google chưa có pass (logic đã bàn trước đó)
  const needsPassword = user && (user as any).password === null;

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Mật khẩu không khớp!");
    setIsSubmitting(true);
    try {
      await setAccountPassword(newPassword);
      setSuccessMsg("Thiết lập mật khẩu thành công!");
      setTimeout(() => {
        setActiveView('main');
        window.location.reload(); // Reload để cập nhật lại dữ liệu user
      }, 2000);
    } catch (err) {
      alert("Lỗi khi lưu mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Header */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-blue-600 to-cyan-900 flex items-end p-6 sm:p-10">
        <div className="flex items-center gap-6 z-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-900 flex items-center justify-center border-4 border-cyan-500 shadow-2xl">
            <User size={48} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">{user?.username}</h1>
            <p className="text-cyan-200 opacity-80">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        
        {/* ================= VIEW 1: MENU CHÍNH ================= */}
        {activeView === 'main' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Cảnh báo nếu chưa có mật khẩu */}
            {needsPassword && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-amber-500" />
                  <span className="text-sm text-amber-200">Tài khoản Google này chưa có mật khẩu thủ công.</span>
                </div>
                <button onClick={() => setActiveView('password')} className="text-sm font-bold text-amber-500 hover:underline">Thiết lập ngay</button>
              </div>
            )}

            <div className="grid gap-4">
              {/* Nút Chỉnh sửa hồ sơ */}
              <button 
                onClick={() => setActiveView('edit')}
                className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center"><User className="text-cyan-400" /></div>
                  <div className="text-left">
                    <p className="font-bold">Chỉnh sửa hồ sơ</p>
                    <p className="text-xs text-gray-400">Thay đổi tên hiển thị và ảnh đại diện</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-600 group-hover:text-white" />
              </button>

              {/* Nút Cài đặt mật khẩu */}
              <button 
                onClick={() => setActiveView('password')}
                className="w-full p-5 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center"><Lock className="text-purple-400" /></div>
                  <div className="text-left">
                    <p className="font-bold">Mật khẩu & Bảo mật</p>
                    <p className="text-xs text-gray-400">{needsPassword ? "Chưa thiết lập mật khẩu" : "Thay đổi mật khẩu đăng nhập"}</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-600 group-hover:text-white" />
              </button>

              <button onClick={onLogout} className="w-full p-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl flex items-center justify-center gap-3 font-bold transition-all mt-4">
                <LogOut size={20} /> Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: FORM MẬT KHẨU ================= */}
        {activeView === 'password' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
              <ArrowLeft size={20} /> Quay lại
            </button>
            
            <form onSubmit={handleSetPassword} className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="text-cyan-400" /> {needsPassword ? "Thiết lập mật khẩu mới" : "Đổi mật khẩu"}
              </h2>
              
              {successMsg ? (
                 <div className="p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl text-center font-bold">{successMsg}</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 uppercase ml-2">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 outline-none mt-1"
                        placeholder="Tối thiểu 6 ký tự"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase ml-2">Xác nhận mật khẩu</label>
                      <input 
                        type="password" 
                        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 outline-none mt-1"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "LƯU MẬT KHẨU"}
                  </button>
                </>
              )}
            </form>
          </div>
        )}

        {/* ================= VIEW 3: CHỈNH SỬA HỒ SƠ ================= */}
        {activeView === 'edit' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
             <button onClick={() => setActiveView('main')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
              <ArrowLeft size={20} /> Quay lại
            </button>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
                <User size={48} className="mx-auto text-cyan-500 mb-4" />
                <p className="text-gray-300 italic">Tính năng cập nhật thông tin đang được phát triển...</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}