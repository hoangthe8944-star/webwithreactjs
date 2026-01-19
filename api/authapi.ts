import axios from "axios";

// --- CẤU HÌNH URL ---
const BASE_URL = "https://backend-jfn4.onrender.com/api/auth";
const USER_URL = "https://backend-jfn4.onrender.com/api/users";

// ====================================================
// const BASE_URL = "http://localhost:8081/api/auth";
// const USER_URL = "http://localhost:8081/api/users";


/**
 * ✅ ĐƯỜNG DẪN ĐĂNG NHẬP GOOGLE
 * Quan trọng: Không gọi qua Axios. Dùng window.location.href = GOOGLE_AUTH_URL
 */
export const GOOGLE_AUTH_URL = "https://backend-jfn4.onrender.com/oauth2/authorization/google";
// export const GOOGLE_AUTH_URL = "http://localhost:8081/oauth2/authorization/google";

// ====================================================
// 1. TYPE DEFINITIONS (INTERFACES)
// ====================================================

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Interface này khớp với JwtResponse bên Backend
export interface JwtResponse {
  token: string;
  id: string;
  username: string;
  email: string;
  roles: string[];
  isVerified: boolean;      // Trạng thái xác thực email
  linkedEmails?: string[];  // Danh sách email phụ
}

// ====================================================
// 2. API CALLS (XỬ LÝ ĐĂNG NHẬP/ĐĂNG KÝ)
// ====================================================

const config = {
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420"
  },
  withCredentials: true
};

/**
 * Đăng ký tài khoản mới (Trả về thông báo yêu cầu check mail)
 */
export const registerUser = (data: RegisterRequest) =>
  axios.post(`${BASE_URL}/register`, data, config);

/**
 * Xác thực email (Gọi từ trang VerifyPage)
 */
export const verifyEmail = (token: string) =>
  axios.get(`${BASE_URL}/verify?token=${token}`, config);

/**
 * Đăng nhập thủ công bằng Email/Password
 */
export const loginUser = (data: LoginRequest) =>
  axios.post<JwtResponse>(`${BASE_URL}/login`, data, config);

/**
 * Yêu cầu liên kết thêm email phụ (Cần JWT)
 */
export const requestLinkEmail = (newEmail: string) => {
  const token = getAccessToken();
  return axios.post(`${BASE_URL}/link-request?newEmail=${newEmail}`, {}, {
    headers: {
      ...config.headers,
      "Authorization": `Bearer ${token}`
    }
  });
};

/**
 * Lấy thông tin chi tiết người dùng hiện tại (Profile)
 * Thường gọi sau khi Login Google thành công để lấy Username/Roles
 */
export const getMyProfile = (explicitToken?: string) => {
  // Nếu có token truyền vào thì dùng luôn, nếu không thì lấy từ sessionStorage
  const token = explicitToken || sessionStorage.getItem("accessToken");

  return axios.get<JwtResponse>(`${USER_URL}/me`, {
    headers: {
      "Authorization": `Bearer ${token}`, 
      "ngrok-skip-browser-warning": "69420"
    }
  });
};
// ====================================================
// 3. SESSION MANAGEMENT (SESSION STORAGE)
// ====================================================

/**
 * Lưu thông tin đăng nhập vào Session (Mất khi đóng Tab)
 */
export const setUserSession = (data: JwtResponse) => {
  if (data.token) sessionStorage.setItem("accessToken", data.token);
  sessionStorage.setItem("user", JSON.stringify(data));
};

/**
 * Lấy token từ Session
 */
export const getAccessToken = () => {
  return sessionStorage.getItem("accessToken");
};

/**
 * Lấy object User hiện tại
 */
export const getCurrentUser = (): JwtResponse | null => {
  const userStr = sessionStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Kiểm tra nhanh trạng thái Verified
 */
export const checkIsVerified = (): boolean => {
  const user = getCurrentUser();
  // Nếu là Admin thì mặc định true, nếu là User thì check field isVerified
  if (user?.roles.includes('ROLE_ADMIN')) return true;
  return user ? user.isVerified : false;
};

/**
 * Đăng xuất
 */
export const logout = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("user");
};


export const setAccountPassword = (password: string) => {
  const token = getAccessToken();
  return axios.post(`${BASE_URL}/set-password`, 
    { password }, 
    { headers: { "Authorization": `Bearer ${token}` } }
  );
};