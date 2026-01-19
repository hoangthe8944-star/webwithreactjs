import axios from 'axios';

// Các URL gốc của Backend
const PUBLIC_ARTIST_URL = 'https://backend-jfn4.onrender.com/api/public/artists';
const MGMT_ARTIST_URL = 'https://backend-jfn4.onrender.com/api/artist';
const PUBLIC_SONG_URL = 'https://backend-jfn4.onrender.com/api/public';
const PUBLIC_ALBUM_URL = 'https://backend-jfn4.onrender.com/api/public';

// const PUBLIC_ARTIST_URL = 'http://localhost:8081/api/public/artists';
// const MGMT_ARTIST_URL = 'http://localhost:8081/api/artist';
// const PUBLIC_SONG_URL = 'http://localhost:8081/api/public';
// const PUBLIC_ALBUM_URL = 'http://localhost:8081/api/public';

// Cấu hình Header cho các request công khai
const publicConfig = { 
    headers: { "ngrok-skip-browser-warning": "true" } 
};

// Helper để lấy Header bảo mật cho các thao tác quản lý
const getAuthHeaders = (userId?: string) => {
    const token = sessionStorage.getItem("accessToken");
    return {
        headers: {
            "Authorization": `Bearer ${token}`,
            "currentUserId": userId || "",
            "ngrok-skip-browser-warning": "true"
        }
    };
};

// ====================================================
// 1. ENDPOINT LẤY DỮ LIỆU THẬT (PUBLIC)
// ====================================================

// ✅ [MỚI] Lấy danh sách bài hát của nghệ sĩ
export const getSongsByArtist = (artistId: string) => 
    axios.get(`${PUBLIC_SONG_URL}/songs/artists/${artistId}`, publicConfig);

// ✅ [MỚI] Lấy danh sách album của nghệ sĩ
export const getAlbumsByArtist = (artistId: string) => 
    axios.get(`${PUBLIC_ALBUM_URL}/albums/artists/${artistId}`, publicConfig);
// Lấy danh sách tất cả nghệ sĩ
export const getAllArtists = () => 
    axios.get(PUBLIC_ARTIST_URL, publicConfig);

// Lấy chi tiết hồ sơ nghệ sĩ
export const getPublicArtistProfile = (id: string) => 
    axios.get(`${PUBLIC_ARTIST_URL}/${id}`, publicConfig);

// Lọc nghệ sĩ theo thể loại
export const getArtistsByGenre = (slug: string) => 
    axios.get(`${PUBLIC_ARTIST_URL}/genre/${slug}`, publicConfig);

// Tìm kiếm nghệ sĩ theo tên
export const searchArtists = (q: string) => 
    axios.get(`${PUBLIC_ARTIST_URL}/search`, { params: { q }, ...publicConfig });


// ====================================================
// 2. ENDPOINT QUẢN LÝ (PRIVATE - YÊU CẦU TOKEN)
// ====================================================

// Nghệ sĩ tự lấy hồ sơ của mình để sửa
export const getCurrentArtistProfile = (userId: string) => 
    axios.get(`${MGMT_ARTIST_URL}/me`, getAuthHeaders(userId));

// Nghệ sĩ cập nhật thông tin cá nhân
export const updateArtistProfile = (userId: string, data: any) => 
    axios.put(`${MGMT_ARTIST_URL}/me`, data, getAuthHeaders(userId));

// Admin tạo nghệ sĩ mới
export const createArtistByAdmin = (userId: string, artistName: string) => 
    axios.post(`${MGMT_ARTIST_URL}/admin/create`, null, { 
        params: { userId, artistName }, 
        ...getAuthHeaders() 
    });