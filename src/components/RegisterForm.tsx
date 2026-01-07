import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Music, AlertCircle } from "lucide-react";
import { registerUser, setUserSession, type JwtResponse, type RegisterRequest } from "../../api/authapi";

// Import CSS riêng
import "../register.css";
import { useNavigate } from "react-router-dom";

interface RegisterFormProps {
    onRegisterSuccess: (token: string) => void;
    onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // ✅ Hàm xử lý xác thực Google
    const handleGoogleAuth = () => {
        // Đường dẫn đến endpoint OAuth2 trên Backend của bạn
        window.location.href = "https://backend-jfn4.onrender.com/oauth2/authorization/google";
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");

        if (password !== confirmPassword) {
            setErrorMessage("Mật khẩu xác nhận không khớp!");
            return;
        }
        setIsLoading(true);

        try {
            const requestData: RegisterRequest = {
                username,
                email,
                password,
                roles: ["USER"]
            };

            // 1. Gọi API đăng ký
            const response = await registerUser(requestData);
            const data: JwtResponse = response.data;

            if (!data.token) throw new Error("Không nhận được token từ hệ thống.");

            // 2. Lưu phiên đăng nhập vào sessionStorage (Tắt tab là mất)
            // Lưu ý: Đảm bảo authapi.ts của bạn dùng sessionStorage
            setUserSession(data);

            // 3. Thông báo cho App.tsx cập nhật state token
            onRegisterSuccess(data.token);

            // 4. ✅ LỐI ĐI TỐT NHẤT: Về trang chủ ngay
            alert("Đăng ký thành công! Chào mừng bạn đến với BeatBox.");
            navigate("/"); 
            window.location.reload(); // Reload nhẹ để header cập nhật tên User

        } catch (error: any) {
            console.error("Register error:", error);
            const msg = error.response?.data?.message || error.response?.data || "Đăng ký thất bại.";
            setErrorMessage(msg);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="rp-wrapper">
            <div className="rp-container">
                <div className="rp-bg-image"></div>
                <div className="rp-bg-overlay"></div>

                <div className="rp-card">
                    <div className="rp-header">
                        <div className="rp-logo-circle">
                            <Music color="white" size={24} />
                        </div>
                        <div className="rp-header-text">
                            <h1 className="rp-title">
                                Đăng <span>Ký</span>
                            </h1>
                            <p className="rp-subtitle">Tạo tài khoản mới</p>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="rp-error-box">
                            <AlertCircle size={16} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="rp-input-group">
                            <label className="rp-label">Tên hiển thị</label>
                            <div className="rp-input-wrapper">
                                <User className="rp-icon-left" />
                                <input
                                    type="text"
                                    className="rp-input-field"
                                    placeholder="Họ Tên"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="rp-input-group">
                            <label className="rp-label">Email</label>
                            <div className="rp-input-wrapper">
                                <Mail className="rp-icon-left" />
                                <input
                                    type="email"
                                    className="rp-input-field"
                                    placeholder="email@vidu.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="rp-input-group">
                            <label className="rp-label">Mật khẩu</label>
                            <div className="rp-input-wrapper">
                                <Lock className="rp-icon-left" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="rp-input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="rp-icon-btn-right"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="rp-input-group">
                            <label className="rp-label">Nhập lại Mật khẩu</label>
                            <div className="rp-input-wrapper">
                                <Lock className="rp-icon-left" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="rp-input-field"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button type="submit" className="rp-submit-btn" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="rp-spin" size={16} />
                                    <span>Đang xử lý...</span>
                                </>
                            ) : (
                                "Đăng Ký Ngay"
                            )}
                        </button>
                    </form>

                    {/* ✅ PHẦN THÊM MỚI: Dấu gạch ngang "Hoặc" */}
                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Hoặc</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    {/* ✅ PHẦN THÊM MỚI: Nút Google */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '12px',
                            backgroundColor: 'white',
                            color: '#1e293b',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '14px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            border: 'none',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            style={{ width: '20px', height: '20px' }}
                        />
                        Tiếp tục với Google
                    </button>

                    <div className="rp-footer">
                        Đã có tài khoản?
                        <button onClick={onSwitchToLogin} className="rp-link">
                            Đăng nhập
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}