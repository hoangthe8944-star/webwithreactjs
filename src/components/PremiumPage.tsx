import { useState, useEffect } from 'react';
import { Check, Star, Zap, Loader2, CreditCard, ShieldCheck, Crown, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { 
  getPremiumPackages, 
  getPremiumStatus, 
  subscribePackageDirect, 
  subscribePackageMoMo, 
  cancelSubscription
} from '../../api/premiumApi';
import type {
  PremiumPackage,
  PremiumStatusResponse 
} from '../../api/premiumApi';

interface PremiumPageProps {
  onBackToHome: () => void;
  onStatusUpdate?: () => void;
}

export function PremiumPage({ onBackToHome, onStatusUpdate }: PremiumPageProps) {
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [status, setStatus] = useState<PremiumStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 'momo' | 'direct' | 'cancel'
  const [selectedPackage, setSelectedPackage] = useState<PremiumPackage | null>(null);
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
      color: 'from-blue-600 to-indigo-600',
      recommended: false
    },
    {
      id: 'personal',
      name: 'Premium Cá nhân',
      price: 59000,
      durationDays: 30,
      description: 'Nghe nhạc không quảng cáo, Chuyển bài không giới hạn, Mở khóa lời bài hát (Lyrics), Tăng tốc độ phát nhạc (Speedup), Âm thanh chất lượng cao',
      features: ['Nghe nhạc không quảng cáo', 'Chuyển bài không giới hạn', 'Mở khóa lời bài hát (Lyrics)', 'Tăng tốc độ phát nhạc (Speedup)', 'Chất lượng âm thanh cao cấp'],
      color: 'from-cyan-500 to-blue-500',
      recommended: true
    },
    {
      id: 'family',
      name: 'Premium Gia đình',
      price: 99000,
      durationDays: 30,
      description: 'Tối đa 5 tài khoản Premium, Tất cả quyền lợi Premium Cá nhân, Playlist gia đình chung, Kiểm soát nội dung cho trẻ em',
      features: ['Tối đa 5 tài khoản Premium', 'Đầy đủ quyền lợi Premium Cá nhân', 'Xem Lyrics & Speedup nhạc', 'Playlist gia đình chung', 'Kiểm soát nội dung cho trẻ em'],
      color: 'from-purple-600 to-pink-600',
      recommended: false
    }
  ];

  const fetchData = async () => {
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
  }, [isLoggedIn]);

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
        color: matched?.color || 'from-cyan-500 to-blue-500',
        recommended: matched?.recommended || pkg.name.toLowerCase().includes('cá nhân') || false
      };
    });
  };

  const displayPlans = getDisplayPlans();
  const isUserPremium = status?.isPremium || status?.premium || status?.active || false;

  const handleSelectPackage = (plan: any) => {
    if (!isLoggedIn) {
      setMessage({ text: 'Vui lòng đăng nhập để thực hiện nâng cấp tài khoản.', type: 'error' });
      return;
    }
    const pkg = packages.find(p => p.id === plan.id) || {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      description: plan.features.join(', ')
    };
    setSelectedPackage(pkg);
    // Scroll to check out section
    setTimeout(() => {
      document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDirectSubscribe = async (packageId: string | number) => {
    setActionLoading('direct');
    setMessage(null);
    try {
      await subscribePackageDirect(packageId);
      setMessage({ text: 'Đăng ký gói Premium thành công! Tài khoản của bạn đã được kích hoạt.', type: 'success' });
      setSelectedPackage(null);
      const statusRes = await getPremiumStatus();
      setStatus(statusRes.data);
      onStatusUpdate?.();
    } catch (err: any) {
      console.error(err);
      setMessage({ text: 'Kích hoạt gói cước thất bại. Vui lòng liên hệ hỗ trợ hoặc thử lại.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMoMoSubscribe = async (packageId: string | number) => {
    setActionLoading('momo');
    setMessage(null);
    try {
      const res = await subscribePackageMoMo(packageId);
      if (res.data && res.data.payUrl) {
        window.location.href = res.data.payUrl;
      } else {
        setMessage({ text: 'Không lấy được link thanh toán từ cổng MoMo.', type: 'error' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: 'Khởi tạo giao dịch MoMo thất bại. Vui lòng kiểm tra lại kết nối mạng.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy gia hạn gói Premium hiện tại? Bạn vẫn sẽ giữ nguyên quyền lợi đến hết thời gian thanh toán hiện tại.')) {
      return;
    }
    setActionLoading('cancel');
    setMessage(null);
    try {
      await cancelSubscription();
      setMessage({ text: 'Đã hủy gia hạn Premium thành công.', type: 'success' });
      const statusRes = await getPremiumStatus();
      setStatus(statusRes.data);
      onStatusUpdate?.();
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
    <div className="min-h-full bg-slate-950 text-white pb-16 px-4 md:px-8">
      {/* Back Header */}
      <div className="max-w-6xl mx-auto py-6 flex items-center justify-between border-b border-white/5 mb-8">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-5 h-5" /> Quét bài hát
        </button>
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/20 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-yellow-400/30" /> Trải nghiệm đỉnh cao
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-zinc-950 border border-white/10 p-8 md:p-12 mb-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(14,165,233,0.15),transparent)] pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Mở khóa sức mạnh của <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">Âm Nhạc Premium</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mb-6 leading-relaxed">
              Trải nghiệm âm thanh chất lượng không nén lossless, không quảng cáo làm phiền, tải nhạc nghe offline mọi lúc mọi nơi và nhiều đặc quyền hấp dẫn dành riêng cho bạn.
            </p>

            {/* Current Status */}
            {isLoggedIn ? (
              <div className="inline-flex items-center gap-3.5 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10">
                {isUserPremium ? (
                  <>
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="text-sm font-semibold text-emerald-400">
                        Hội viên Premium hoạt động ({status?.premiumType || status?.packageName || 'Gói hiện tại'})
                      </div>
                      {(status?.expiryDate || status?.premiumExpiresAt) && (
                        <div className="text-xs text-slate-400">
                          Hạn dùng đến: {new Date(status.expiryDate || status.premiumExpiresAt || '').toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-auto px-3 py-1.5 rounded-lg text-xs font-semibold ml-4"
                      onClick={handleCancelSubscription}
                      disabled={actionLoading === 'cancel'}
                    >
                      {actionLoading === 'cancel' ? 'Đang hủy...' : 'Hủy gia hạn'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                    <span className="text-sm font-medium text-slate-300">Bạn đang sử dụng tài khoản Standard miễn phí</span>
                  </>
                )}
              </div>
            ) : (
              <div className="text-sm text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl inline-block">
                Đăng nhập ngay để đăng ký trải nghiệm đặc quyền Premium.
              </div>
            )}
          </div>

          <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0 flex items-center justify-center bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/20 shadow-inner">
            <Crown className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-bounce" />
          </div>
        </div>

        {/* Message Notice */}
        {message && (
          <div className={`p-4 rounded-xl border text-sm text-center mb-8 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5' 
              : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-md shadow-red-500/5'
          }`}>
            {message.text}
          </div>
        )}

        {/* Loading / Packages list */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Đang kết nối hệ thống gói dịch vụ...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {displayPlans.map((plan) => {
              const isActivePlan = isUserPremium && 
                (status?.packageName?.toLowerCase() === plan.name.toLowerCase() || 
                 status?.premiumType?.toLowerCase() === plan.name.toLowerCase() ||
                 status?.packageId?.toString() === plan.id?.toString());
              
              return (
                <div 
                  key={plan.id}
                  className={`relative rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden ${
                    isActivePlan 
                      ? 'border-emerald-500 bg-emerald-950/10 shadow-xl shadow-emerald-500/5' 
                      : plan.recommended 
                        ? 'border-cyan-500/40 bg-gradient-to-b from-slate-900 to-slate-950/80 shadow-xl shadow-cyan-500/5 hover:-translate-y-1' 
                        : 'border-white/10 bg-gradient-to-b from-slate-900/40 to-slate-950/40 hover:-translate-y-1'
                  }`}
                >
                  {isActivePlan && (
                    <div className="bg-emerald-500 text-black text-xs font-black px-4 py-1.5 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Gói cước đang hoạt động
                    </div>
                  )}

                  {plan.recommended && !isActivePlan && (
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-black px-4 py-1.5 uppercase tracking-wider text-center">
                      Được đề xuất nhiều nhất
                    </div>
                  )}

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h3 className="text-2xl font-black text-white mb-3">{plan.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                          {typeof plan.price === 'number' ? formatPrice(plan.price) : plan.price}
                        </span>
                        <span className="text-slate-400 text-sm font-semibold">/{plan.durationDays} ngày</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                          <Check className={`w-5 h-5 mt-0.5 shrink-0 ${isActivePlan ? 'text-emerald-400' : plan.recommended ? 'text-cyan-400' : 'text-blue-400'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isActivePlan ? (
                      <Button 
                        onClick={handleCancelSubscription}
                        disabled={actionLoading === 'cancel'}
                        variant="outline"
                        className="w-full border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold rounded-2xl py-6"
                      >
                        {actionLoading === 'cancel' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Hủy gia hạn gói này'}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          onClick={() => handleMoMoSubscribe(plan.id)}
                          disabled={actionLoading === 'momo'}
                          className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-95 text-white font-bold rounded-2xl py-6 border-0 shadow-lg flex items-center justify-center gap-2`}
                        >
                          {actionLoading === 'momo' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              Thanh toán qua MoMo
                            </>
                          )}
                        </Button>
                        <div className="text-center">
                          <button
                            onClick={() => handleDirectSubscribe(plan.id)}
                            disabled={!!actionLoading}
                            className="text-xs text-slate-500 hover:text-cyan-400 font-semibold transition-colors bg-transparent border-0 cursor-pointer"
                          >
                            {actionLoading === 'direct' ? 'Đang kích hoạt...' : 'Kích hoạt thử nghiệm (Simulate)'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
