import { useEffect, useState } from "react";
import { Users, UserMinus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import followEndpoint from "../../api/followapi";
import { getCurrentUser } from "../../api/authapi";
import type { Artist } from "../../api/artistApi";

interface FollowArtist {
    id: string;
    targetId: string;
    targetName: string;
    targetAvatarUrl: string;
}

interface FollowingArtistsPageProps {
    onOpenArtist: (artist: Artist) => void;
}
export function FollowingArtistsPage({

    onOpenArtist,
}: FollowingArtistsPageProps) {
    console.log("FollowingArtistsPage render");
    const currentUser = getCurrentUser();
    const userId = currentUser?.id ?? "";

    const [artists, setArtists] = useState<FollowArtist[]>([]);
    const [loading, setLoading] = useState(true);

    const loadArtists = async () => {
        if (!userId) return;

        try {
            const res = await followEndpoint.getFollowing(userId, "ARTIST");
            setArtists(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArtists();
    }, []);

    const unfollow = async (artistId: string) => {
        try {
            await followEndpoint.unfollow(
                userId,
                artistId,
                "ARTIST"
            );

            setArtists((prev) =>
                prev.filter((a) => a.targetId !== artistId)
            );
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="p-10 text-center text-blue-300">
                Đang tải...
            </div>
        );
    }

    return (
        <div className="px-8 py-6">

            <div className="flex items-center gap-3 mb-8">
                <Users className="w-8 h-8 text-cyan-400" />
                <div>
                    <h2>Đang theo dõi</h2>
                    <p className="text-blue-300">
                        {artists.length} nghệ sĩ
                    </p>
                </div>
            </div>

            {artists.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    Bạn chưa theo dõi nghệ sĩ nào.
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {artists.map((artist) => (

                        <div
                            key={artist.id}
                            className="bg-blue-900/20 rounded-xl p-4 hover:bg-blue-900/40 transition-all"
                        >

                            <button
                                className="w-full"
                                onClick={() =>
                                    onOpenArtist({
                                        id: artist.targetId,
                                        name: artist.targetName,
                                        avatarUrl: artist.targetAvatarUrl,
                                        coverImageUrl: artist.targetAvatarUrl,
                                        followerCount: 0,
                                        verified: false,
                                        bio: ""
                                    } as Artist)
                                }                            >

                                <ImageWithFallback
                                    src={artist.targetAvatarUrl}
                                    alt={artist.targetName}
                                    className="w-full aspect-square rounded-xl object-cover mb-4"
                                />

                                <h3 className="text-lg font-semibold truncate">
                                    {artist.targetName}
                                </h3>

                                <p className="text-blue-300 text-sm">
                                    Nghệ sĩ
                                </p>

                            </button>

                            <button
                                onClick={() => unfollow(artist.targetId)}
                                className="mt-4 w-full flex justify-center items-center gap-2 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-all"
                            >
                                <UserMinus className="w-4 h-4" />
                                Bỏ theo dõi
                            </button>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}