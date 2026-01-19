import React from 'react';

interface TrackItem {
    coverUrl?: string;
    thumbnailUrl?: string;
    [key: string]: any;
}

interface PlaylistCoverProps {
    coverImage?: string | null;
    tracks?: TrackItem[] | any[];
    name?: string;
    className?: string;
}

const PlaylistCover: React.FC<PlaylistCoverProps> = ({
    coverImage,
    tracks = [],
    name = "Playlist",
    className = "w-full h-full"
}) => {
    const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop";

    // Hàm bổ trợ để chuyển ID Spotify thành URL thật hoặc trả về ảnh mặc định
    const formatImageUrl = (input: any): string => {
        if (!input || input === "null" || (typeof input === 'string' && input.trim() === "")) {
            return DEFAULT_IMAGE;
        }

        let url = "";
        if (typeof input === 'string') {
            url = input;
        } else {
            url = input.coverUrl || input.thumbnailUrl || "";
        }

        // Nếu là URL hợp lệ (có http)
        if (typeof url === 'string' && url.startsWith('http')) {
            return url;
        }

        // Nếu là ID của Spotify (chuỗi mã băm không có http)
        // Chúng ta nối thêm tiền tố của Spotify để nó trở thành URL hợp lệ
        if (typeof url === 'string' && url.length > 10) { 
            return `https://i.scdn.co/image/ab67616d0000b273${url}`;
        }

        return DEFAULT_IMAGE;
    };

    // 2. Logic hiển thị
    
    // TRƯỜNG HỢP 1: Có ảnh Cover chính của Playlist
    if (coverImage && coverImage.trim() !== "" && coverImage !== "null") {
        return (
            <div className={`${className} overflow-hidden rounded-md shadow-lg border border-white/10`}>
                <img
                    src={formatImageUrl(coverImage)} // ĐÃ SỬA: Dùng hàm formatImageUrl thay vì truyền trực tiếp
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                />
            </div>
        );
    }

    // TRƯỜNG HỢP 2: Không có cover chính, ghép 4 ảnh từ các bài hát
    if (tracks && tracks.length >= 4) {
        const displayTracks = tracks.slice(0, 4);
        return (
            <div className={`${className} grid grid-cols-2 grid-rows-2 overflow-hidden rounded-md shadow-lg border border-white/10 bg-black/20`}>
                {displayTracks.map((track, index) => (
                    <img
                        key={index}
                        src={formatImageUrl(track)} // ĐÃ SỬA: Dùng hàm formatImageUrl
                        alt={`track-${index}`}
                        className="w-full h-full object-cover border-[0.5px] border-white/5"
                        onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                    />
                ))}
            </div>
        );
    }

    // TRƯỜNG HỢP 3: Có ít hơn 4 bài hát, lấy ảnh bài đầu tiên
    if (tracks && tracks.length > 0) {
        return (
            <div className={`${className} overflow-hidden rounded-md shadow-lg border border-white/10`}>
                <img
                    src={formatImageUrl(tracks[0])} // ĐÃ SỬA: Dùng hàm formatImageUrl
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                />
            </div>
        );
    }

    // TRƯỜNG HỢP 4: Playlist trống
    return (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950 rounded-md shadow-lg border border-white/5`}>
            <span className="text-gray-500 text-xs text-center p-2 italic">
                Empty Playlist
            </span>
        </div>
    );
};

export default PlaylistCover;