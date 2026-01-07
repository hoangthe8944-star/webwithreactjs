import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Music2 } from 'lucide-react';
import { getMyProfile, setUserSession } from '../../api/authapi';

export function LoginSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            sessionStorage.setItem("accessToken", token);

            // Bây giờ TypeScript sẽ cho phép truyền token vào đây
            getMyProfile(token)
                .then((response) => {
                    setUserSession(response.data);
                    navigate("/");
                    window.location.reload();
                })
                .catch((err) => {
                    console.error("Lỗi đồng bộ:", err);
                    sessionStorage.clear();
                    navigate("/");
                });
        }
    }, [searchParams, navigate]); return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            {/* Hiệu ứng nền mờ chuyên nghiệp */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />

            <div className="relative z-10 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/20 animate-bounce">
                        <Music2 className="text-white w-12 h-12" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Xác thực thành công!
                    </h2>
                    <p className="text-slate-400">
                        Đang đồng bộ thư viện nhạc của bạn...
                    </p>
                </div>

                <div className="flex justify-center pt-4">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                </div>
            </div>
        </div>
    );
}