import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, Music, AlertCircle } from "lucide-react";
import { loginUser, type JwtResponse, type LoginRequest, setUserSession } from "./../../api/authapi";

// IMPORT FILE CSS MỚI TẠO
import "../login.css";

interface LoginFormProps {
  onLoginSuccess: (token: string) => void;
  onSwitchToRegister?: () => void; // Dấu ? nghĩa là optional
}

export function LoginForm({ onLoginSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // ✅ Hàm xử lý Đăng nhập Google (Dùng window.location.href để tránh lỗi CORS)
  const handleGoogleAuth = () => {
    window.location.href = "https://backend-jfn4.onrender.com/oauth2/authorization/google";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const requestData: LoginRequest = { email, password };
      const response = await loginUser(requestData);
      const data: JwtResponse = response.data;

      if (!data.token) throw new Error("Token missing");

      let userRoles = data.roles || (data as any).role || [];
      if (!Array.isArray(userRoles)) userRoles = [userRoles];

      setUserSession({ ...data, roles: userRoles });
      onLoginSuccess(data.token);

      if (userRoles.includes("ROLE_ADMIN")) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response) {
        // ✅ Xử lý thêm thông báo nếu tài khoản chưa xác thực (dành cho đăng ký thủ công)
        if (error.response.status === 403) {
            setErrorMessage("Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư!");
        } else if (error.response.status === 401) {
          setErrorMessage("Email hoặc mật khẩu không đúng.");
        } else {
          setErrorMessage(error.response.data.message || "Đăng nhập thất bại.");
        }
      } else if (error.request) {
        setErrorMessage("Không thể kết nối đến máy chủ.");
      } else {
        setErrorMessage("Lỗi hệ thống.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lp-wrapper">
      <div className="lp-container">
        <div className="lp-bg-image"></div>
        <div className="lp-bg-overlay"></div>

        <div className="lp-card">
          <div className="lp-header">
            <div className="lp-logo-circle">
              <Music color="white" size={40} />
            </div>
            <h1 className="lp-title">
              Stream<span>Music</span>
            </h1>
            <p className="lp-subtitle">Kết nối âm nhạc của bạn</p>
          </div>

          {errorMessage && (
            <div className="lp-error-box">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="lp-input-group">
              <label className="lp-label">Email</label>
              <div className="lp-input-wrapper">
                <Mail className="lp-icon-left" />
                <input
                  type="text"
                  className="lp-input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="lp-input-group">
              <label className="lp-label">Mật khẩu</label>
              <div className="lp-input-wrapper">
                <Lock className="lp-icon-left" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="lp-input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="lp-icon-btn-right"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="lp-spin" size={20} />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                "Đăng nhập ngay"
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

          <div className="lp-footer" style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            Chưa có tài khoản? 
            <button 
              onClick={onSwitchToRegister} 
              className="lp-link" 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#22d3ee', fontWeight: 'bold', marginLeft: '5px' }}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}