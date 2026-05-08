import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getStory, getChapters, updateStoryRating, Story, Chapter, incrementStoryViews } from '../lib/db';
import { BookOpen, Star, Eye, List, User, Heart, CheckCircle2, Circle } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';
import AgeWarning from '../components/AgeWarning';
import { useAuth } from '../lib/AuthContext';
import { useReadingProgress } from '../lib/useReadingProgress';
import { isStoryConfirmed18, confirmStory18 } from '../lib/ageCheck';

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [showVoteOpts, setShowVoteOpts] = useState(false);
  const [hoverHeart, setHoverHeart] = useState(0);
  const { user } = useAuth();
  
  const { readChapters, toggleRead, markAllRead, unmarkAll } = useReadingProgress(story?.id);

  useEffect(() => {
    let active = true;
    if (id) {
      Promise.all([
        getStory(id),
        getChapters(id)
      ]).then(([storyData, chaptersData]) => {
        if (!active) return;
        setStory(storyData);
        setChapters(chaptersData);
        setLoading(false);

        // Check if story is 18+
        const isAdult = storyData?.categories?.some(c => c.name.includes('18+') || c.name.includes('🔞')) || storyData?.title.includes('🔞');
        const sessionConfirmed = storyData ? isStoryConfirmed18(storyData.id) : false;
        
        if (isAdult && !sessionConfirmed) {
          setShowWarning(true);
        }
      });
      incrementStoryViews(id).catch(console.error);
    }
    return () => { active = false; };
  }, [id]);

  const handleConfirmAge = () => {
    if (story) confirmStory18(story.id);
    setShowWarning(false);
  };

  const handleVote = async (score: number) => {
    if (!user) {
      alert("Vui lòng đăng nhập để vote!");
      return;
    }
    if (id) {
      // Optimistic update locally
      const currentRating = story?.rating || 0;
      const currentCount = story?.ratingCount || 0;
      let newRating = Math.max(4, ((currentRating * currentCount) + score) / (currentCount + 1));
      newRating = Math.round(newRating * 10) / 10;
      
      setStory(prev => prev ? { ...prev, rating: newRating, ratingCount: currentCount + 1 } : null);
      
      // Update remotely
      await updateStoryRating(id, score);
      setShowVoteOpts(false);
    }
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center text-leaf-600 dark:text-leaf-400 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm">Đang tải...</div>;
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center text-leaf-600 dark:text-leaf-400 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm">
        Truyện không tồn tại.
      </div>
    );
  }

  if (showWarning) {
    return <AgeWarning onConfirm={handleConfirmAge} />;
  }

  return (
    <main className="min-h-screen pb-20 transition-colors">
      <Helmet>
        <title>{`${story.title} - Dưới Mái Hiên`}</title>
        <meta name="description" content={story.synopsis?.substring(0, 160) || 'Đọc truyện trực tuyến.'} />
        {story.coverUrl && <meta property="og:image" content={story.coverUrl} />}
      </Helmet>
      {/* Story Header */}
      <div className="bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md border-b border-leaf-200 dark:border-leaf-700 shadow-sm transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 md:w-48 shrink-0 rounded-xl overflow-hidden shadow-sm mx-auto md:mx-0 border border-leaf-300 dark:border-leaf-600 bg-white/40 dark:bg-leaf-800/40">
              {story.coverUrl ? <img src={story.coverUrl} alt={story.title} className="w-full h-auto aspect-[3/4] object-cover" /> : <div className="w-full h-full bg-white/40 dark:bg-leaf-800/40"></div>}
            </div>
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-leaf-900 dark:text-leaf-50 mb-4 leading-tight">
                {story.title}
              </h1>
              <p className="text-leaf-600 dark:text-white text-sm font-medium mb-6 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4" /> {story.author}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-leaf-700 dark:text-white mb-6 bg-white/50 dark:bg-[#093365] backdrop-blur-sm px-5 py-2.5 rounded-full border border-leaf-200 dark:border-[#0470d5]">
                <span className="flex items-center gap-1.5 font-medium"><Star className="w-4 h-4 text-leaf-800 dark:text-white fill-leaf-800 dark:fill-white" /> {story.rating || 0}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-300 dark:bg-leaf-500"></span>
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {((story.views || 0) / 1000).toFixed(1)}K</span>
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-300 dark:bg-leaf-500"></span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {story.chapterCount || 0}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-300 dark:bg-leaf-500"></span>
                <span className={`font-medium ${story.status === 'Hoàn thành' ? 'text-leaf-800 dark:text-white' : 'text-leaf-600 dark:text-white'}`}>
                  {story.status}
                </span>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 w-full md:w-auto mt-2 relative">
                <Link to={`/story/${story.id}/read/${chapters?.[0]?.chapterNumber || 1}`} className="flex-1 min-w-[140px] md:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-3 bg-leaf-800 dark:bg-leaf-600 hover:bg-leaf-950 dark:hover:bg-leaf-500 text-white font-semibold rounded-full transition-colors shadow-lg shadow-leaf-800/20">
                  <BookOpen className="w-5 h-5" />
                  <span className="whitespace-nowrap">Đọc Từ Đầu</span>
                </Link>
                {chapters.length > 0 && (
                  <Link to={`/story/${story.id}/read/${chapters[chapters.length - 1].chapterNumber}`} className="flex-1 min-w-[140px] md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/70 dark:bg-[#016ece] backdrop-blur-md text-leaf-800 dark:text-white border border-leaf-300 dark:border-[#016ece] hover:bg-leaf-50 dark:hover:bg-[#016ece]/90 font-semibold rounded-full transition-colors">
                    <span className="whitespace-nowrap">Chương Mới</span>
                  </Link>
                )}
                <button onClick={() => setShowVoteOpts(!showVoteOpts)} className="flex-1 min-w-[140px] md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full transition-colors shadow-lg shadow-pink-500/20">
                  <Heart className="w-5 h-5 fill-white text-white shrink-0" />
                  <span className="whitespace-nowrap">Vote Truyện</span>
                </button>
                
                {showVoteOpts && (
                  <div className="absolute top-full left-0 md:left-auto mt-2 bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md border border-leaf-200 dark:border-leaf-600 rounded-2xl shadow-xl p-4 z-10 w-[240px]">
                    <div className="text-center font-semibold text-leaf-800 dark:text-leaf-200 mb-3 text-sm">Cho điểm truyện này</div>
                    <div className="flex items-center justify-center gap-2">
                       {[1, 2, 3, 4, 5].map(score => (
                         <button
                           key={score}
                           onMouseEnter={() => setHoverHeart(score)}
                           onMouseLeave={() => setHoverHeart(0)}
                           onClick={() => handleVote(score)}
                           className="transition-transform hover:scale-110"
                         >
                           <Heart className={`w-8 h-8 ${score <= (hoverHeart || 0) ? 'fill-pink-500 text-pink-500' : 'fill-transparent text-leaf-300 dark:text-leaf-500'}`} />
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        <div className="flex-[2]">
          

          <section className="mb-12 bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md p-8 rounded-3xl border border-leaf-200 dark:border-leaf-700 shadow-sm transition-colors">
            <h2 className="text-[15px] uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-white mb-6">
              Giới Thiệu
            </h2>
            <div className="prose prose-leaf text-leaf-700 dark:text-white font-sans leading-relaxed space-y-4 text-sm flex flex-col gap-2 dark:pt-0 dark:text-left dark:leading-[20.75px] dark:text-[14px]">
              {story.synopsis?.split('\n').map((para, i) => (
                <p key={i} className="dark:font-sans dark:text-[14px]">{para}</p>
              ))}
            </div>
          </section>

          <section className="bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md p-8 rounded-3xl border border-leaf-200 dark:border-leaf-700 shadow-sm transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-white">
                Danh Sách Chương
              </h2>
              <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-leaf-600 dark:text-white">
                <span>{readChapters.length}/{chapters.length} đã đọc</span>
                <div className="w-px h-3 bg-leaf-300 dark:bg-leaf-700"></div>
                {readChapters.length > 0 ? (
                  <button onClick={unmarkAll} className="hover:text-leaf-900 dark:hover:text-leaf-100 transition-colors">Bỏ Đánh Dấu</button>
                ) : (
                  <button onClick={() => markAllRead(chapters.map(c => c.id))} className="hover:text-leaf-900 dark:text-white dark:hover:text-leaf-100 transition-colors">Đánh Dấu Hết</button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapters.map(chapter => (
                <div key={chapter.id} className="relative group flex">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleRead(chapter.id);
                    }}
                    className="absolute left-0 top-0 bottom-0 px-3 z-10 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
                    title={readChapters.includes(chapter.id) ? 'Đã đọc' : 'Chưa đọc'}
                  >
                    {readChapters.includes(chapter.id) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 hover:text-green-600 transition-colors" />
                    ) : (
                      <Circle className="w-5 h-5 text-leaf-300 dark:text-leaf-600 hover:text-leaf-500 transition-colors" />
                    )}
                  </button>
                  <Link
                    to={`/story/${story.id}/read/${chapter.chapterNumber}`}
                    className={`pl-12 pr-4 py-3 rounded-xl hover:bg-leaf-50 dark:hover:bg-[#093365] border border-leaf-100 dark:border-white hover:border-leaf-300 dark:hover:border-[#0470d5] transition-all flex items-center gap-3 w-full ${readChapters.includes(chapter.id) ? 'text-leaf-500 dark:text-white/60 opacity-60' : 'text-leaf-900 dark:text-white'}`}
                  >
                    <span className={`font-serif italic text-lg w-8 ${readChapters.includes(chapter.id) ? 'text-leaf-300 dark:text-leaf-600' : 'text-leaf-500 dark:text-leaf-400'}`}>{(chapter.chapterNumber).toString().padStart(2, '0')}</span>
                    <span className="truncate text-sm font-medium">{chapter.title}</span>
                    {chapter.isLocked && <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Khóa</span>}
                  </Link>
                </div>
              ))}
              {chapters.length === 0 && (
                <div className="col-span-full py-8 text-center text-leaf-500 dark:text-leaf-400 text-sm">
                  Chưa có chương nào được cập nhật.
                </div>
              )}
            </div>
          </section>
          
          <CommentsSection storyId={story.id} uploaderId={story.uploaderId} />
        </div>
        
        <div className="flex-1 space-y-8">
          <div className="bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md rounded-3xl p-8 border border-leaf-200 dark:border-leaf-700 shadow-sm transition-colors">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-white mb-6">Về Tác Giả</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/40 dark:bg-leaf-800/40 flex items-center justify-center text-leaf-800 dark:text-leaf-300 border border-leaf-200 dark:border-leaf-700">
                <User className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-serif italic font-bold text-lg text-leaf-900 dark:text-white">{story.author}</div>
              </div>
            </div>
            {story.editor && (
              <div className="mt-4 pt-4 border-t border-leaf-100 dark:border-leaf-700">
                <div className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-white mb-2">Editor</div>
                <div className="font-serif italic font-medium text-leaf-900 dark:text-white">{story.editor}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
