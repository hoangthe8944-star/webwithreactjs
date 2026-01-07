import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Music2, ArrowRight } from 'lucide-react';
import { verifyEmail } from '../../api/authapi';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Trạng thái xác thực: loading | success | error
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang kết nối với máy chủ để xác thực...');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Không tìm thấy mã xác thực. Vui lòng kiểm tra lại link trong email của bạn.');
        return;
      }

      try {
        // Gọi API xác thực từ authapi.ts
        await verifyEmail(token);
        
        setStatus('success');
        setMessage('Tài khoản của bạn đã được kích hoạt thành công! Giờ đây bạn đã có thể tận hưởng âm nhạc không giới hạn.');
      } catch (error: any) {
        setStatus('error');
        // Lấy thông tin lỗi từ backend nếu có
        const errorMsg = error.response?.data || 'Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử đăng ký lại.';
        setMessage(errorMsg);
      }
    };

    // Tạo độ trễ nhẹ để trải nghiệm người dùng mượt mà hơn
    const timer = setTimeout(() => {
      performVerification();
    }, 1500);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Hiệu ứng nền Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 text-center">
        {/* Logo App */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Music2 className="text-white w-10 h-10" />
          </div>
        </div>

        {/* Trạng thái Loading */}
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-white">Đang xác thực</h2>
            <p className="text-slate-400">{message}</p>
          </div>
        )}

        {/* Trạng thái Thành công */}
        {status === 'success' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Thành công!</h2>
              <p className="text-slate-300 leading-relaxed">{message}</p>
            </div>
            <Link
              to="/"
              className="group flex items-center justify-center gap-2 w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/25"
            >
              Về trang chủ <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* Trạng thái Lỗi */}
        {status === 'error' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Xác thực thất bại</h2>
              <p className="text-slate-300 leading-relaxed">{message}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all border border-white/10"
              >
                Quay lại trang chủ
              </Link>
              <p className="text-xs text-slate-500">
                Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ hỗ trợ.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}