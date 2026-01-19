import axios from 'axios';

// --- CẤU HÌNH URL ---
// Sử dụng process.env để linh hoạt hơn giữa môi trường dev và production
const PUBLIC_URL = 'https://backend-jfn4.onrender.com/api/public';
const History_URL = 'https://backend-jfn4.onrender.com/api/songs';
const LYRICS_URL = 'https://backend-jfn4.onrender.com/api/v1/lyrics';
const HISTORY_URL = 'https://backend-jfn4.onrender.com/api/history';

// --- CẤU HÌNH URL ---
// const PUBLIC_URL = 'http://localhost:8081/api/public';
// const History_URL = 'http://localhost:8081/api/songs';
// const LYRICS_URL = 'http://localhost:8081/api/v1/lyrics';
// const HISTORY_URL = 'http://localhost:8081/api/history';


// ====================================================
// 1. TYPE DEFINITIONS (DTO)
// ====================================================

export interface Song {
    id: string;
    title: string;
    artistName: string;
    albumName: string;
    coverUrl: string;
    duration: number;
    streamUrl: string;
    status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
    viewCount: number;
    isExplicit: boolean;
    genre: string[];
}

// Cấu trúc trả về từ Backend (sau khi gọi LRCLIB)
export interface LyricsResponse {
    id: number;
    trackName: string;
    artistName: string;
    albumName: string;
    duration: number;
    plainLyrics: string;  // Lời bài hát dạng văn bản thuần
    syncedLyrics: string; // Lời bài hát dạng [00:12.34] để chạy chữ
}

export interface HistoryItem {
    id: string;
    userId: string;
    songId: string;
    playedAt: string; // ISO Date string
    songDetails: Song; // Thông tin chi tiết bài hát để hiển thị UI
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    color: string;
    imageUrl: string;
}
// ====================================================
// 2. API CALLS
// ====================================================

/**
 * Lấy danh sách nhạc Trending
 */
export const getTrendingSongs = (limit: number = 10) => {
    return axios.get<Song[]>(`${PUBLIC_URL}/songs/trending?limit=${limit}`, {
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
};

/**
 * Tìm kiếm bài hát công khai
 */
export const searchPublicSongs = (query: string) => {
    // ✅ SỬA LỖI: Đổi tên tham số từ "query" thành "q" để khớp với backend
    return axios.get<Song[]>(`${PUBLIC_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
};


/**
 * Lấy thông tin chi tiết bài hát VÀ tăng lượt nghe
 * (Backend đã gộp 2 chức năng này vào một endpoint /info)
 */
export const getSongInfoAndIncrementView = (songId: string) => {
    // Backend của bạn xử lý việc tăng view trong endpoint GET /info
    // Vì vậy, không cần hàm incrementViewCount riêng nữa.
    return axios.get<Song>(`${PUBLIC_URL}${songId}/info`, {
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
};

export const getAllPublicSongs = () => {
    return axios.get<Song[]>(`${PUBLIC_URL}/songs/all`, {
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
};
// export const getRecentlyPlayedSongs = () => {
//     const token = sessionStorage.getItem("accessToken");
//     console.log("Token hiện tại:", token); // Dòng này để debug

//     if (!token) {
//         console.warn("Chưa có token, không thể lấy lịch sử");
//         return Promise.reject("No token");
//     }

//     return axios.get(`${History_URL}/history/recent`, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "ngrok-skip-browser-warning": "true"
//         }
//     });
// };
// export const recordPlayback = (songId: string) => {
//     const token = sessionStorage.getItem("accessToken");

//     // Endpoint này là POST và không có body, chỉ cần URL
//     const fullUrl = `${History_URL}/${songId}/playback`;

//     // Chúng ta không quan tâm đến kết quả trả về, chỉ cần gọi là được
//     return axios.post(fullUrl, {}, { // Gửi một body rỗng {}
//         headers: {
//             "ngrok-skip-browser-warning": "true",
//             "Authorization": `Bearer ${token}`
//         }
//     });
// };

/**
 * Lấy lời bài hát từ Backend (Backend sẽ gọi LRCLIB)
 * @param track Tên bài hát
 * @param artist Tên nghệ sĩ
 * @param album Tên album (không bắt buộc)
 * @param duration Thời lượng bài hát tính bằng GIÂY (nên truyền để khớp 100%)
 */
export const getLyrics = (track: string, artist: string, album?: string, duration?: number) => {
    return axios.get<LyricsResponse>(LYRICS_URL, {
        params: {
            track: track,
            artist: artist,
            // album: album,
            duration: duration ? Math.floor(duration) : undefined // Chuyển về số nguyên nếu là số thực
        },
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
};
// ====================================================
// 3. HISTORY API CALLS
// ====================================================

/**
 * Ghi lại lượt nghe khi bài hát bắt đầu phát
 * @param songId ID của bài hát
 * @param userId ID của người dùng (lấy từ localStorage/context)
 */
export const recordSongPlay = (songId: string, userId: string) => {
    const token = sessionStorage.getItem("accessToken");
    return axios.post(`${HISTORY_URL}/${songId}`, {}, {
        headers: {
            "currentUserId": userId,
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
        }
    });
};

/**
 * Lấy danh sách 20 bài hát đã nghe gần đây nhất của người dùng
 * @param userId ID của người dùng
 */
export const getUserHistory = (userId: string) => {
    return axios.get<HistoryItem[]>(`${HISTORY_URL}/me`, {
        headers: {
            "currentUserId": userId,
            "ngrok-skip-browser-warning": "true"
        }
    });
};

/**
 * Xóa toàn bộ lịch sử nghe của người dùng
 * @param userId ID của người dùng
 */
export const clearUserHistory = (userId: string) => {
    return axios.delete(`${HISTORY_URL}/me`, {
        headers: {
            "currentUserId": userId,
            "ngrok-skip-browser-warning": "true"
        }
    });
};


export const getAllCategories = () => {
    return axios.get<Category[]>(`${PUBLIC_URL}/categories`, {
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    });
};