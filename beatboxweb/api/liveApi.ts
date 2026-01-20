import axios from 'axios';

// const API_BASE = "https://backend-jfn4.onrender.com/api/live";
const API_BASE = "http://localhost:8081/api/live";

// Tạo một bản sao axios riêng cho Live
const liveClient = axios.create({
    baseURL: API_BASE,
});

// Tự động thêm Token vào Header cho mọi yêu cầu
liveClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const liveApi = {
    // Lấy danh sách phòng đang live
    getActiveRooms: async () => {
        const res = await liveClient.get("/active", {
            headers: { "ngrok-skip-browser-warning": "true" }
        });
        return res.data;
    },

    // Báo cho backend bắt đầu live
    startLive: async (roomData: { roomId: string; hostId: string; hostName: string; roomTitle: string }) => {
        return await liveClient.post("/start", roomData);
    },

    // Báo cho backend kết thúc live
    endLive: async (roomId: string) => {
        return await liveClient.post(`/end/${roomId}`);
    }
};