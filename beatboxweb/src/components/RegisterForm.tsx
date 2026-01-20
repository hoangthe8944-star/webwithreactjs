import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Music, AlertCircle, ArrowLeft } from "lucide-react";
import { registerUser, type RegisterRequest } from "../../api/authapi";
import "../register.css";
import axios from "axios";
import { API_BASE } from "../../api/authapi";

interface RegisterFormProps {
    onRegisterSuccess: (token: string) => void;
    onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otp, setOtp] = useState("");

    // Cấu hình URL linh hoạt (Sửa theo môi trường bạn đang chạy)

    const handleGoogleAuth = () => {
        window.location.href = `${API_BASE}/oauth2/authorization/google`;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage("Mật khẩu xác nhận không khớp!");
            return;
        }

        setErrorMessage("");
        setIsLoading(true);
        try {
            await registerUser({ username, email, password });
            alert("Mã OTP đã được gửi về email của bạn!");
            setIsOtpStep(true);
        } catch (error: any) {
            console.error("Register error:", error);
            let msg = "Đăng ký thất bại.";
            if (error.response?.data) {
                msg = typeof error.response.data === 'string'
                    ? error.response.data
                    : (error.response.data.message || msg);
            }
            setErrorMessage(String(msg));
        } finally {
            setIsLoading(false); // Quan trọng: dừng xoay nút khi xong
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            setErrorMessage("Vui lòng nhập đủ 6 chữ số!");
            return;
        }

        setErrorMessage("");
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/api/auth/verify-otp`, {
                email: email,
                otp: otp
            });

            alert("Xác thực thành công!");
            onRegisterSuccess(response.data.token);
        } catch (error: any) {
            setErrorMessage(error.response?.data || "Mã OTP sai hoặc hết hạn!");
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
                                {isOtpStep ? "Xác " : "Đăng "}
                                <span>{isOtpStep ? "Thực" : "Ký"}</span>
                            </h1>
                            <p className="rp-subtitle">
                                {isOtpStep ? "Nhập mã OTP từ email" : "Tạo tài khoản mới"}
                            </p>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="rp-error-box">
                            <AlertCircle size={16} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {!isOtpStep ? (
                        <>
                            <form onSubmit={handleSubmit}>
                                <div className="rp-input-group">
                                    <label className="rp-label">Tên hiển thị</label>
                                    <div className="rp-input-wrapper">
                                        <User className="rp-icon-left" />
                                        <input
                                            type="text" className="rp-input-field" placeholder="Họ Tên"
                                            value={username} onChange={(e) => setUsername(e.target.value)}
                                            required disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="rp-input-group">
                                    <label className="rp-label">Email</label>
                                    <div className="rp-input-wrapper">
                                        <Mail className="rp-icon-left" />
                                        <input
                                            type="email" className="rp-input-field" placeholder="email@vidu.com"
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                            required disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="rp-input-group">
                                    <label className="rp-label">Mật khẩu</label>
                                    <div className="rp-input-wrapper">
                                        <Lock className="rp-icon-left" />
                                        <input
                                            type={showPassword ? "text" : "password"} className="rp-input-field"
                                            placeholder="••••••••" value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required disabled={isLoading}
                                        />
                                        <button
                                            type="button" className="rp-icon-btn-right"
                                            onClick={() => setShowPassword(!showPassword)}
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
                                            type={showPassword ? "text" : "password"} className="rp-input-field"
                                            placeholder="••••••••" value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="rp-submit-btn" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="rp-spin" size={16} /> : "Đăng Ký Ngay"}
                                </button>
                            </form>

                            {/* Chỉ hiện Google và "Hoặc" ở bước đăng ký */}
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
                                Đã có tài khoản? <button onClick={onSwitchToLogin} className="rp-link">Đăng nhập</button>
                            </div>
                        </>
                    ) : (
                        /* GIAO DIỆN NHẬP OTP */
                        <div className="text-center py-4">
                            <p className="mb-6 text-slate-400 text-sm">
                                Chúng tôi đã gửi mã 6 chữ số đến <br />
                                <strong className="text-white">{email}</strong>
                            </p>

                            <input
                                type="text" maxLength={6}
                                className="rp-otp-input" // Hãy thêm CSS cho class này (spacing, font-size lớn)
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                placeholder="000000"
                                autoFocus
                            />

                            <button onClick={handleVerifyOtp} className="rp-submit-btn mt-8" disabled={isLoading}>
                                {isLoading ? <Loader2 className="rp-spin" size={16} /> : "Xác Nhận & Hoàn Tất"}
                            </button>

                            <button
                                onClick={() => setIsOtpStep(false)}
                                className="flex items-center justify-center gap-2 w-full mt-6 text-slate-400 hover:text-white transition-colors text-sm"
                            >
                                <ArrowLeft size={14} /> Quay lại sửa thông tin
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


