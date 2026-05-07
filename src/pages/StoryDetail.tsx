import { useParams, Link } from 'react-router-dom';
import { getStoryById, getChaptersByStoryId } from '../lib/data';
import { BookOpen, Star, Eye, List, User } from 'lucide-react';

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const story = getStoryById(id || '');
  const chapters = getChaptersByStoryId(id || '');

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center text-leaf-600 dark:text-[#6e8573]">
        Truyện không tồn tại.
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 transition-colors">
      {/* Story Header */}
      <div className="bg-white dark:bg-[#162019] border-b border-leaf-200 dark:border-[#233529] shadow-sm transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 md:w-48 shrink-0 rounded-xl overflow-hidden shadow-sm mx-auto md:mx-0 border border-leaf-300 dark:border-[#2a3f31] bg-leaf-100 dark:bg-[#1d2b21]">
              <img src={story.coverUrl} alt={story.title} className="w-full h-auto aspect-[3/4] object-cover" />
            </div>
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-leaf-900 dark:text-leaf-50 mb-4 leading-tight">
                {story.title}
              </h1>
              <p className="text-leaf-600 dark:text-[#6e8573] text-sm font-medium mb-6 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4" /> {story.author}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-leaf-700 dark:text-leaf-300 mb-6 bg-leaf-50 dark:bg-[#0f1712] px-5 py-2.5 rounded-full border border-leaf-200 dark:border-[#233529]">
                <span className="flex items-center gap-1.5 font-medium"><Star className="w-4 h-4 text-leaf-800 dark:text-[#A8D5BA] fill-leaf-800 dark:fill-[#A8D5BA]" /> {story.rating}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-300 dark:bg-[#3E5242]"></span>
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {(story.views / 1000).toFixed(1)}K</span>
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-300 dark:bg-[#3E5242]"></span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {story.chapterCount}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-300 dark:bg-[#3E5242]"></span>
                <span className={`font-medium ${story.status === 'Hoàn thành' ? 'text-leaf-800 dark:text-[#A8D5BA]' : 'text-leaf-600 dark:text-[#6e8573]'}`}>
                  {story.status}
                </span>
              </div>

              <div className="flex gap-4 w-full md:w-auto mt-2">
                <Link to={`/story/${story.id}/read/1`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-leaf-800 dark:bg-[#4A7C59] hover:bg-leaf-950 dark:hover:bg-[#3E5242] text-white font-semibold rounded-full transition-colors shadow-lg shadow-leaf-800/20">
                  <BookOpen className="w-5 h-5" />
                  Đọc Từ Đầu
                </Link>
                {chapters.length > 0 && (
                  <Link to={`/story/${story.id}/read/${chapters[chapters.length - 1].chapterNumber}`} className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-transparent text-leaf-800 dark:text-leaf-200 border border-leaf-300 dark:border-[#2a3f31] hover:bg-leaf-50 dark:hover:bg-[#1d2b21] font-semibold rounded-full transition-colors">
                    Chương Mới
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        <div className="flex-[2]">
          <section className="mb-12 bg-white dark:bg-[#162019] p-8 rounded-3xl border border-leaf-200 dark:border-[#233529] shadow-sm transition-colors">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-[#6e8573] mb-6">
              Giới Thiệu
            </h2>
            <div className="prose prose-leaf text-leaf-700 dark:text-leaf-300 font-sans leading-relaxed space-y-4 text-sm">
              {story.description.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-[#162019] p-8 rounded-3xl border border-leaf-200 dark:border-[#233529] shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-[#6e8573]">
                Danh Sách Chương
              </h2>
              <span className="text-xs text-leaf-600 dark:text-[#6e8573] font-semibold uppercase tracking-widest">{chapters.length} chương</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapters.map(chapter => (
                <Link
                  key={chapter.id}
                  to={`/story/${story.id}/read/${chapter.chapterNumber}`}
                  className="px-4 py-3 rounded-xl hover:bg-leaf-50 dark:hover:bg-[#1d2b21] border border-leaf-100 dark:border-[#1d2b21] hover:border-leaf-300 dark:hover:border-[#2a3f31] text-leaf-900 dark:text-leaf-100 transition-all flex items-center gap-3"
                >
                  <span className="text-leaf-500 dark:text-[#6e8573] font-serif italic text-lg w-8">{(chapter.chapterNumber).toString().padStart(2, '0')}</span>
                  <span className="truncate text-sm font-medium">{chapter.title}</span>
                </Link>
              ))}
              {chapters.length === 0 && (
                <div className="col-span-full py-8 text-center text-leaf-500 dark:text-[#6e8573] text-sm">
                  Chưa có chương nào được cập nhật.
                </div>
              )}
            </div>
          </section>
        </div>
        
        <div className="flex-1 space-y-8">
          <div className="bg-white dark:bg-[#162019] rounded-3xl p-8 border border-leaf-200 dark:border-[#233529] shadow-sm transition-colors">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-[#6e8573] mb-6">Về Tác Giả</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-leaf-100 dark:bg-[#1d2b21] flex items-center justify-center text-leaf-800 dark:text-[#A8D5BA] border border-leaf-200 dark:border-[#233529]">
                <User className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-serif italic font-bold text-lg text-leaf-900 dark:text-leaf-100">{story.author}</div>
                <div className="text-[10px] uppercase tracking-widest text-leaf-500 dark:text-[#6e8573]">2 Tác Phẩm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
