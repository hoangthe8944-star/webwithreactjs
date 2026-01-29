import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api/live"
});

// Tự động gắn JWT vào mọi request
api.interceptors.request.use((config) => {
  // ĐỔI THÀNH sessionStorage để khớp với App.tsx
  const token = sessionStorage.getItem("accessToken"); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const liveApi = {
  // Chỉ nhận vào chuỗi title đơn giản
  startLive: (title: string) => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) throw new Error("User chưa đăng nhập");

    const user = JSON.parse(userStr);

    return api.post("/start", null, {
      params: {
        hostId: user.id,          
        hostName: user.username,
        title: title // title ở đây là chuỗi "admin đang phát live"
      }
    });
  },

  endLive: (roomId: string) => api.post(`/end/${roomId}`),
  getActiveRooms: () => api.get("/active"),
  getZegoToken: (userId: string) => api.get(`/zego-token`, { params: { userId } })
};