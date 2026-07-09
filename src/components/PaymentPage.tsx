import { useState } from 'react';
import { ChevronLeft, CreditCard, Zap, Loader2, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { Button } from './ui/button';
import { 
  subscribePackageDirect, 
  subscribePackageMoMo, 
  getPremiumStatus
} from '../../api/premiumApi';
import type {
  PremiumStatusResponse 
} from '../../api/premiumApi';

interface PaymentPageProps {
  selectedPackage: {
    id: string | number;
    name: string;
    price: number;
    durationDays: number;
    description: string | string[];
  };
  onCancel: () => void;
  onPaymentSuccess: (status: PremiumStatusResponse) => void;
}

export function PaymentPage({ selectedPackage, onCancel, onPaymentSuccess }: PaymentPageProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 'momo' | 'direct'
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const handleMoMoPayment = async () => {
    setActionLoading('momo');
    setMessage(null);
    try {
      const res = await subscribePackageMoMo(selectedPackage.id);
      if (res.data && res.data.payUrl) {
        window.location.href = res.data.payUrl;
      } else {
        setMessage({ text: 'Không lấy được link thanh toán từ cổng kết nối MoMo.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Khởi tạo giao dịch MoMo thất bại. Vui lòng thử lại sau.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDirectPayment = async () => {
    setActionLoading('direct');
    setMessage(null);
    try {
      await subscribePackageDirect(selectedPackage.id);
      setMessage({ text: 'Đăng ký gói Premium giả lập thành công! Tài khoản của bạn đã được kích hoạt.', type: 'success' });
      // Fetch new premium status and trigger success callback
      const statusRes = await getPremiumStatus();
      setTimeout(() => {
        onPaymentSuccess(statusRes.data);
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Kích hoạt trực tiếp thất bại. Vui lòng thử lại sau.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const features = typeof selectedPackage.description === 'string' 
    ? selectedPackage.description.split(',').map(f => f.trim())
    : selectedPackage.description;

  return (
    <div className="dark min-h-full bg-slate-950 text-white pb-16 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto py-6 flex items-center justify-between border-b border-white/5 mb-8">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-5 h-5" /> Quay lại chọn gói
        </button>
        <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/20 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-cyan-400/30" /> Cổng thanh toán bảo mật
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Package info summary */}
        <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(14,165,233,0.05),transparent)] pointer-events-none" />
          
          <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Hóa đơn đăng ký</h3>
          <h2 className="text-2xl font-black text-white mb-4">{selectedPackage.name}</h2>
          
          <div className="flex items-baseline gap-2 mb-6 border-b border-white/5 pb-6">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {formatPrice(selectedPackage.price)}
            </span>
            <span className="text-slate-400 text-sm">/{selectedPackage.durationDays} ngày</span>
          </div>

          <h4 className="text-sm font-semibold text-slate-300 mb-3">Quyền lợi gói cước:</h4>
          <ul className="space-y-3.5">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 mt-0.5 text-cyan-400 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment options selection */}
        <div className="md:col-span-7 bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-2xl font-black mb-2">Phương thức thanh toán</h2>
          <p className="text-slate-400 text-sm mb-6">
            Vui lòng lựa chọn hình thức thanh toán an toàn bên dưới để tiếp tục kích hoạt gói thành viên của bạn.
          </p>

          {message && (
            <div className={`p-4 rounded-xl border text-sm text-center mb-6 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            {/* MoMo payment button */}
            <button
              onClick={handleMoMoPayment}
              disabled={!!actionLoading}
              className="w-full bg-[#A50064] hover:bg-[#8F0057] text-white flex items-center justify-between p-6 rounded-2xl font-bold text-base shadow-lg transition-all duration-200 border-0 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg">
                  <img src="https://i.pinimg.com/736x/72/1e/b1/721eb1ec1b5bf1d229e74174affe469b.jpg" alt="MoMo" className="w-8 h-8 object-contain" />
                </div>
                <div className="text-left">
                  <div>Thanh toán qua Ví điện tử MoMo</div>
                  <div className="text-xs text-white/70 font-normal mt-0.5">Xác thực giao dịch an toàn, tức thì</div>
                </div>
              </div>
              {actionLoading === 'momo' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <CreditCard className="w-6 h-6 text-white/80" />
              )}
            </button>

            {/* Direct/trial option */}
            {/* <button
              onClick={handleDirectPayment}
              disabled={!!actionLoading}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center justify-between p-6 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
                <div className="text-left">
                  <div>Kích hoạt giả lập nhanh (Direct Subscribe)</div>
                  <div className="text-xs text-slate-400 font-normal mt-0.5">Thử nghiệm nhanh chóng, không tốn phí</div>
                </div>
              </div>
              {actionLoading === 'direct' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-slate-400" />
              )}
            </button> */}
          </div>

          <div className="mt-8 border-t border-white/5 pt-6 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Bằng việc tiến hành thanh toán, bạn đồng ý với Điều khoản sử dụng dịch vụ và chính sách bảo mật thông tin giao dịch của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
