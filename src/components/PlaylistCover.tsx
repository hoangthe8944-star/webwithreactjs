import React from 'react';

interface TrackItem {
    thumbnailUrl?: string; // Hoặc đường dẫn ảnh từ Album
    [key: string]: any;    // Các thuộc tính khác nếu có
}

interface PlaylistCoverProps {
    coverImage?: string | null;
    tracks?: TrackItem[] | string[]; // Có thể nhận mảng Object hoặc mảng String URL
    name?: string;
    className?: string; // Để tùy chỉnh kích thước từ bên ngoài (ví dụ: "w-40 h-40")
}

const PlaylistCover: React.FC<PlaylistCoverProps> = ({
    coverImage,
    tracks = [],
    name = "Playlist",
    className = "w-full h-full"
}) => {
    const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop";

    // 1. Hàm lấy URL ảnh từ track (hỗ trợ cả mảng string hoặc mảng object)
    const getTrackImageUrl = (track: any): string => {
        if (typeof track === 'string') return track;
        return track?.thumbnailUrl || track?.album?.coverUrl || DEFAULT_IMAGE;
    };

    // 2. Logic hiển thị

    // TRƯỜNG HỢP 1: Có ảnh bìa do người dùng upload (Ưu tiên số 1)
    if (coverImage && coverImage.trim() !== "") {
        return (
            <div className={`${className} overflow-hidden rounded-md shadow-lg border border-gray-200`}>
                <img
                    src={coverImage}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                />
            </div>
        );
    }

    // TRƯỜNG HỢP 2: Không có ảnh bìa, nhưng có >= 4 bài hát (Hiện Grid 2x2)
    if (tracks && tracks.length >= 4) {
        const displayTracks = tracks.slice(0, 4);
        return (
            <div className={`${className} grid grid-cols-2 grid-rows-2 overflow-hidden rounded-md shadow-lg border border-gray-200 bg-gray-100`}>
                {displayTracks.map((track, index) => (
                    <img
                        key={index}
                        src={getTrackImageUrl(track)}
                        alt={`track-${index}`}
                        className="w-full h-full object-cover border-[0.5px] border-white/20"
                    />
                ))}
            </div>
        );
    }

    // TRƯỜNG HỢP 3: Có ít bài hát (< 4) nhưng không trống
    if (tracks && tracks.length > 0) {
        return (
            <div className={`${className} overflow-hidden rounded-md shadow-lg border border-gray-200`}>
                <img
                    src={getTrackImageUrl(tracks[0])}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // TRƯỜNG HỢP 4: Playlist trống hoàn toàn
    return (
        <div className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 rounded-md shadow-lg`}>
            <span className="text-gray-400 text-xs text-center p-2 italic">
                Empty Playlist
            </span>
        </div>
    );
};

export default PlaylistCover;