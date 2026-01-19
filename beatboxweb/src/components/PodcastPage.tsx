import { Play, Clock, Heart, Share2, MoreHorizontal, Mic, Radio, Headphones, Cast, Users, Signal } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Podcast {
  id: string;
  title: string;
  host: string;
  category: string;
  cover: string;
  description: string;
  duration?: string;
  date?: string;
  viewers?: string;
  isLive?: boolean;
}

interface PodcastPageProps {
  onPlayPodcast?: (podcast: any) => void;
}

export function PodcastPage({ onPlayPodcast }: PodcastPageProps) {
  const categories = [
    { id: 'all', label: 'Tất cả', icon: Mic },
    { id: 'tech', label: 'Công nghệ', icon: Radio },
    { id: 'edu', label: 'Giáo dục', icon: Headphones },
    { id: 'ent', label: 'Giải trí', icon: Cast },
  ];

  const livePodcasts: Podcast[] = [
    {
      id: 'l1',
      title: 'Morning Coffee Live',
      host: 'Daily News Team',
      category: 'News',
      cover: 'https://images.unsplash.com/photo-1574672666068-07d0361329a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpbyUyMHN0dWRpb3xlbnwxfHx8fDE3NjQ0MTg1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Cập nhật tin tức buổi sáng và thảo luận trực tiếp.',
      viewers: '1.2k',
      isLive: true
    },
    {
      id: 'l2',
      title: 'Tech Talk Direct',
      host: 'Silicon Valley Insiders',
      category: 'Technology',
      cover: 'https://images.unsplash.com/photo-1593697972496-e8e62232a523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2RjYXN0JTIwbWljcm9waG9uZXxlbnwxfHx8fDE3NjQ0MTg2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Q&A trực tiếp về các xu hướng công nghệ mới nhất.',
      viewers: '850',
      isLive: true
    }
  ];

  const featuredPodcasts: Podcast[] = [
    {
      id: 'p1',
      title: 'The Daily',
      host: 'The New York Times',
      category: 'News',
      cover: 'https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXdzcGFwZXJ8ZW58MXx8fHwxNzY0NDEwNDg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Tin tức hàng ngày từ The New York Times.',
      duration: '25 min',
      date: 'Hôm nay'
    },
    {
      id: 'p2',
      title: 'TED Radio Hour',
      host: 'NPR',
      category: 'Education',
      cover: 'https://images.unsplash.com/photo-1478737270239-2f52b27fa34e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWR8ZW58MXx8fHwxNzY0NDEwNDg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Ý tưởng đáng lan truyền từ TED.',
      duration: '50 min',
      date: 'Hôm qua'
    },
    {
      id: 'p3',
      title: 'Syntax - Tasty Web Development Treats',
      host: 'Wes Bos & Scott Tolinski',
      category: 'Technology',
      cover: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmR8ZW58MXx8fHwxNzY0NDEwNDg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Podcast dành cho lập trình viên web.',
      duration: '65 min',
      date: '2 ngày trước'
    }
  ];

  const trendingPodcasts: Podcast[] = [
    {
      id: 't1',
      title: 'Stuff You Should Know',
      host: 'iHeartRadio',
      category: 'Education',
      cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwibm93bGVkZ2V8ZW58MXx8fHwxNzY0NDEwNDg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Tìm hiểu về mọi thứ trên thế giới.',
      duration: '45 min'
    },
    {
      id: 't2',
      title: 'Planet Money',
      host: 'NPR',
      category: 'Business',
      cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25leXxlbnwxfHx8fDE3NjQ0MTA0ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Kinh tế học giải thích thế giới.',
      duration: '20 min'
    },
    {
      id: 't3',
      title: 'Serial',
      host: 'This American Life',
      category: 'True Crime',
      cover: 'https://images.unsplash.com/photo-1453873419066-95622054fb95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnZlc3RpZ2F0aW9ufGVufDFrfHx8fDE3NjQ0MTA0ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Một câu chuyện được kể qua từng tập.',
      duration: '40 min'
    },
    {
      id: 't4',
      title: 'How I Built This',
      host: 'Guy Raz',
      category: 'Business',
      cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwfGVufDFrfHx8fDE3NjQ0MTA0ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Câu chuyện về những công ty nổi tiếng nhất thế giới.',
      duration: '60 min'
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold text-white">Podcast</h1>
        <p className="text-blue-200">Khám phá những câu chuyện thú vị và kiến thức bổ ích</p>
        
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                cat.id === 'all' 
                  ? 'bg-white text-blue-900 font-medium' 
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Now Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold text-white">Đang phát trực tiếp</h2>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {livePodcasts.map((podcast) => (
            <div 
              key={podcast.id}
              className="group relative bg-gradient-to-r from-red-900/40 to-black/40 rounded-xl overflow-hidden border border-red-500/20 hover:border-red-500/40 transition-all"
            >
              <div className="flex p-4 gap-4">
                <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-lg relative">
                  <ImageWithFallback
                    src={podcast.cover}
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Signal className="w-3 h-3" /> LIVE
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2 text-xs text-red-400 font-medium mb-1">
                    <Users className="w-3 h-3" />
                    {podcast.viewers} đang nghe
                  </div>
                  <h3 className="font-bold text-white text-xl mb-1">{podcast.title}</h3>
                  <p className="text-sm text-white/70 mb-3">{podcast.description}</p>
                  <Button className="w-fit h-9 bg-red-600 hover:bg-red-700 text-white border-0">
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Nghe ngay
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Nổi bật hôm nay</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPodcasts.map((podcast) => (
            <div 
              key={podcast.id}
              className="group relative bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg">
                  <Play className="w-5 h-5 fill-current ml-1" />
                </Button>
              </div>
              
              <div className="flex p-4 gap-4">
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                   <ImageWithFallback
                    src={podcast.cover}
                    alt={podcast.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="text-xs font-medium text-cyan-400 mb-1">{podcast.category}</div>
                  <h3 className="font-bold text-white truncate text-lg mb-1">{podcast.title}</h3>
                  <p className="text-sm text-blue-200 truncate mb-2">{podcast.host}</p>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {podcast.duration}
                    </span>
                    <span>•</span>
                    <span>{podcast.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Xu hướng</h2>
          <button className="text-sm text-blue-300 hover:text-white transition-colors">Xem tất cả</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {trendingPodcasts.map((podcast) => (
            <div 
              key={podcast.id}
              className="group space-y-3 cursor-pointer"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                 <ImageWithFallback
                  src={podcast.cover}
                  alt={podcast.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                  <Button size="icon" className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white shadow-xl hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">{podcast.title}</h3>
                <p className="text-sm text-blue-300 truncate">{podcast.host}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
