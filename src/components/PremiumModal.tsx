import { X, Check, Star, Zap, Users, Music } from 'lucide-react';
import { Button } from './ui/button';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Mini',
      price: '19.000đ',
      period: '/tuần',
      features: ['Nghe nhạc không quảng cáo', 'Tải xuống 30 bài hát', 'Chất lượng âm thanh chuẩn'],
      color: 'bg-blue-600',
      recommended: false
    },
    {
      name: 'Premium Cá nhân',
      price: '59.000đ',
      period: '/tháng',
      features: ['Nghe nhạc không quảng cáo', 'Tải xuống không giới hạn', 'Chất lượng âm thanh cao cấp', 'Nghe Offline mọi nơi'],
      color: 'bg-cyan-500',
      recommended: true
    },
    {
      name: 'Premium Gia đình',
      price: '99.000đ',
      period: '/tháng',
      features: ['Tối đa 6 tài khoản', 'Kiểm soát nội dung cho trẻ em', 'Playlist gia đình chung', 'Tất cả quyền lợi Premium'],
      color: 'bg-indigo-600',
      recommended: false
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 text-center border-b border-white/10 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-white/50 hover:text-white"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>
          
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Nâng cấp lên Premium
          </h2>
          <p className="text-slate-400">Trải nghiệm âm nhạc không giới hạn, không quảng cáo</p>
        </div>

        {/* Plans */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative rounded-xl border ${plan.recommended ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-white/10'} bg-white/5 p-6 flex flex-col`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    Phổ biến nhất
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.recommended ? 'text-cyan-400' : 'text-blue-400'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button className={`w-full ${plan.color} hover:opacity-90 text-white font-medium border-0`}>
                  Chọn gói này
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 border-t border-white/10 text-center text-xs text-slate-500">
          <p>Điều khoản và điều kiện áp dụng. 1 tháng miễn phí không khả dụng cho người dùng đã dùng thử Premium.</p>
        </div>
      </div>
    </div>
  );
}
