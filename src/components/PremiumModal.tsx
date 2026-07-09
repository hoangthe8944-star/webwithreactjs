import { useState, useEffect } from 'react';
import { X, Check, Star, Zap, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { 
  getPremiumPackages, 
  getPremiumStatus, 
  cancelSubscription
} from '../../api/premiumApi';
import type {
  PremiumPackage,
  PremiumStatusResponse 
} from '../../api/premiumApi';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage: (pkg: any) => void;
}

export function PremiumModal({ isOpen, onClose, onSelectPackage }: PremiumModalProps) {
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [status, setStatus] = useState<PremiumStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 'cancel'
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isLoggedIn = !!sessionStorage.getItem('accessToken');

  const staticFallbacks = [
    {
      id: 'mini',
      name: 'Mini',
      price: 19000,
      durationDays: 7,
      description: 'Nghe nhạc không quảng cáo, Tua nhạc & Chuyển bài hát (Tối đa 30 lần/ngày), Chất lượng âm thanh chuẩn',
      features: ['Nghe nhạc không quảng cáo', 'Tua nhạc & Chuyển bài hát', 'Tối đa 30 lần chuyển bài/ngày', 'Chất lượng âm thanh chuẩn'],
      color: 'bg-blue-600',
      recommended: false
    },
    {
      id: 'personal',
      name: 'Premium Cá nhân',
      price: 59000,
      durationDays: 30,
      description: 'Nghe nhạc không quảng cáo, Chuyển bài không giới hạn, Mở khóa lời bài hát (Lyrics), Tăng tốc độ phát nhạc (Speedup), Âm thanh chất lượng cao',
      features: ['Nghe nhạc không quảng cáo', 'Chuyển bài không giới hạn', 'Mở khóa lời bài hát (Lyrics)', 'Tăng tốc độ phát nhạc (Speedup)', 'Chất lượng âm thanh cao cấp'],
      color: 'bg-cyan-500',
      recommended: true
    },
    {
      id: 'family',
      name: 'Premium Gia đình',
      price: 99000,
      durationDays: 30,
      description: 'Tối đa 5 tài khoản Premium, Tất cả quyền lợi Premium Cá nhân, Playlist gia đình chung, Kiểm soát nội dung cho trẻ em',
      features: ['Tối đa 5 tài khoản Premium', 'Đầy đủ quyền lợi Premium Cá nhân', 'Xem Lyrics & Speedup nhạc', 'Playlist gia đình chung', 'Kiểm soát nội dung cho trẻ em'],
      color: 'bg-indigo-600',
      recommended: false
    }
  ];

  const fetchData = async () => {
    if (!isOpen) return;
    setLoading(true);
    setMessage(null);
    try {
      if (isLoggedIn) {
        const [pkgRes, statusRes] = await Promise.all([
          getPremiumPackages().catch(() => ({ data: [] })),
          getPremiumStatus().catch(() => ({ data: { isPremium: false } as PremiumStatusResponse }))
        ]);
        
        setPackages(pkgRes.data);
        setStatus(statusRes.data);
      } else {
        setPackages([]);
        setStatus(null);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Premium:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOpen, isLoggedIn]);

  if (!isOpen) return null;

  const getDisplayPlans = () => {
    if (!packages || packages.length === 0) {
      return staticFallbacks;
    }

    return packages.map((pkg) => {
      const matched = staticFallbacks.find(
        (sf) => sf.name.toLowerCase().includes(pkg.name.toLowerCase()) || 
                pkg.name.toLowerCase().includes(sf.name.toLowerCase())
      );

      const features = pkg.description 
        ? pkg.description.split(',').map(f => f.trim())
        : (matched?.features || ['Quyền lợi Premium']);

      return {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        durationDays: pkg.durationDays,
        features: features,
        color: matched?.color || 'bg-cyan-500',
        recommended: matched?.recommended || pkg.name.toLowerCase().includes('cá nhân') || false
      };
    });
  };

  const displayPlans = getDisplayPlans();
  const isUserPremium = status?.isPremium || status?.premium || status?.active || false;

  const handleSelectPackage = (plan: any) => {
    if (!isLoggedIn) {
      setMessage({ text: 'Vui lòng đăng nhập để nâng cấp Premium.', type: 'error' });
      return;
    }
    const pkg = packages.find(p => p.id === plan.id) || {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      description: plan.features.join(', ')
    };
    onSelectPackage(pkg);
    onClose();
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy gia hạn gói Premium hiện tại?')) {
      return;
    }
    setActionLoading('cancel');
    setMessage(null);
    try {
      await cancelSubscription();
      setMessage({ text: 'Đã hủy gia hạn Premium thành công.', type: 'success' });
      const statusRes = await getPremiumStatus();
      setStatus(statusRes.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Hủy đăng ký thất bại. Vui lòng thử lại sau.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-950 border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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

          {/* User Status Bar */}
          {isLoggedIn && (
            <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              {isUserPremium ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">
                    Bạn đang là Premium ({status?.premiumType || status?.packageName || 'Gói hiện tại'})
                  </span>
                  {(status?.expiryDate || status?.premiumExpiresAt) && (
                    <span className="text-xs text-slate-400">
                      Hạn dùng: {new Date(status.expiryDate || status.premiumExpiresAt || '').toLocaleDateString('vi-VN')}
                    </span>
                  )}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300 h-auto p-0 font-normal text-xs ml-2"
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                  >
                    {actionLoading === 'cancel' ? 'Đang hủy...' : 'Hủy gói'}
                  </Button>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                  <span className="text-sm text-slate-300">Tài khoản Standard</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg border text-sm text-center ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Đang tải gói dịch vụ...</p>
          </div>
        ) : (
          /* Plans List */
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayPlans.map((plan) => {
                const isActivePlan = isUserPremium && 
                  (status?.packageName?.toLowerCase() === plan.name.toLowerCase() || 
                   status?.premiumType?.toLowerCase() === plan.name.toLowerCase() ||
                   status?.packageId?.toString() === plan.id?.toString());
                
                const activePrice = status?.price || 0;
                const isLowerOrEqual = isUserPremium && plan.price <= activePrice;
                
                return (
                  <div 
                    key={plan.id}
                    className={`relative rounded-xl border ${
                      isActivePlan 
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                        : isLowerOrEqual
                          ? 'border-white/5 bg-white/5 opacity-50'
                          : plan.recommended 
                            ? 'border-cyan-500/50 bg-white/5 shadow-lg shadow-cyan-500/10' 
                            : 'border-white/10 bg-white/5'
                    } p-6 flex flex-col`}
                  >
                    {isActivePlan ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Gói của bạn
                      </div>
                    ) : plan.recommended && !isLowerOrEqual ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                        Phổ biến nhất
                      </div>
                    ) : null}

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-white">{typeof plan.price === 'number' ? formatPrice(plan.price) : plan.price}</span>
                        <span className="text-slate-400 text-sm mb-1">/{plan.durationDays} ngày</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isActivePlan ? 'text-emerald-400' : plan.recommended ? 'text-cyan-400' : 'text-blue-400'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isActivePlan ? (
                      <Button 
                        onClick={handleCancelSubscription}
                        disabled={actionLoading === 'cancel'}
                        className="w-full bg-red-950/50 hover:bg-red-900 border border-red-500/30 hover:border-red-500 text-red-200 font-medium"
                      >
                        {actionLoading === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hủy đăng ký'}
                      </Button>
                    ) : isLowerOrEqual ? (
                      <Button 
                        disabled
                        className="w-full bg-slate-800 text-slate-500 cursor-not-allowed font-medium border-0"
                      >
                        Đang dùng gói cao hơn
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSelectPackage(plan)}
                        className={`w-full ${plan.color} hover:opacity-90 text-white font-medium border-0`}
                      >
                        Chọn gói này
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 bg-white/5 border-t border-white/10 text-center text-xs text-slate-500">
          <p>Điều khoản và điều kiện áp dụng. Hỗ trợ kết nối thanh toán bảo mật.</p>
        </div>
      </div>
    </div>
  );
}
