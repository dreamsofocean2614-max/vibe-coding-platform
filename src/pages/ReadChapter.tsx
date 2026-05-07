import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStoryById, getChapter, getChaptersByStoryId } from '../lib/data';
import { ChevronLeft, ChevronRight, Settings, List, Home, ArrowLeft } from 'lucide-react';

export default function ReadChapter() {
  const { id, chapterNum } = useParams<{ id: string; chapterNum: string }>();
  const navigate = useNavigate();
  const story = getStoryById(id || '');
  const chapterNumber = parseInt(chapterNum || '1', 10);
  const chapter = getChapter(id || '', chapterNumber);
  const allChapters = getChaptersByStoryId(id || '');

  const [fontSize, setFontSize] = useState(18);
  const [showSettings, setShowSettings] = useState(false);
  const [showNav, setShowNav] = useState(true);

  // Auto-hide nav when scrolling down
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!story || !chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-leaf-600 dark:text-[#6e8573] gap-4 bg-leaf-50 dark:bg-[#0f1712]">
        <p>Nội dung không tồn tại hoặc có lỗi xảy ra.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-leaf-200 dark:bg-[#233529] rounded-full hover:bg-leaf-300 dark:hover:bg-[#2a3f31] transition text-leaf-800 dark:text-leaf-200">
          Quay lại
        </button>
      </div>
    );
  }

  const hasNext = chapterNumber < allChapters.length;
  const hasPrev = chapterNumber > 1;

  return (
    <div className="min-h-screen bg-leaf-50 dark:bg-[#0f1712] text-leaf-900 dark:text-leaf-100 transition-colors duration-300 relative">
      {/* Top Navigation */}
      <div className={`fixed top-0 inset-x-0 bg-white/90 dark:bg-[#162019]/90 backdrop-blur-md border-b border-leaf-300 dark:border-[#2a3f31] z-40 transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={`/story/${story.id}`} className="flex items-center gap-2 text-leaf-700 dark:text-leaf-300 hover:text-leaf-900 dark:hover:text-leaf-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:block truncate max-w-[200px]">{story.title}</span>
          </Link>
          
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-leaf-600 dark:text-[#6e8573] hover:text-leaf-900 dark:hover:text-leaf-100 hover:bg-leaf-100 dark:hover:bg-[#1d2b21] rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <Link to="/" className="p-2 text-leaf-600 dark:text-[#6e8573] hover:text-leaf-900 dark:hover:text-leaf-100 hover:bg-leaf-100 dark:hover:bg-[#1d2b21] rounded-full transition-colors">
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-14 inset-x-0 bg-white dark:bg-[#162019] border-b border-leaf-200 dark:border-[#233529] shadow-lg z-30 p-4 animate-in slide-in-from-top-2">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <span className="text-sm font-medium text-leaf-700 dark:text-leaf-300">Cỡ chữ</span>
            <div className="flex items-center gap-4 bg-leaf-50 dark:bg-[#0f1712] rounded-full px-2 py-1 border border-leaf-200 dark:border-[#233529]">
              <button 
                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                className="w-8 h-8 flex items-center justify-center text-leaf-700 dark:text-leaf-300 hover:bg-leaf-200 dark:hover:bg-[#233529] rounded-full font-serif"
              >
                A-
              </button>
              <span className="text-leaf-900 dark:text-leaf-100 font-medium min-w-[3ch] text-center">{fontSize}</span>
              <button 
                onClick={() => setFontSize(s => Math.min(32, s + 2))}
                className="w-8 h-8 flex items-center justify-center text-leaf-700 dark:text-leaf-300 hover:bg-leaf-200 dark:hover:bg-[#233529] rounded-full font-serif font-bold text-lg"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reading Container */}
      <main className="max-w-3xl mx-auto px-4 py-24 min-h-[calc(100vh-100px)]">
        <div className="text-center mb-12">
          <h2 className="text-leaf-600 dark:text-[#6e8573] text-sm font-medium tracking-widest uppercase mb-3">Chương {chapter.chapterNumber}</h2>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-leaf-900 dark:text-leaf-50 leading-snug">
            {chapter.title}
          </h1>
        </div>

        <div 
          className="font-serif leading-relaxed text-leaf-900 dark:text-[#E9F0E9]"
          style={{ fontSize: `${fontSize}px` }}
        >
          {chapter.content.map((para, i) => (
            <p key={i} className="mb-6 text-justify indent-8">
              {para}
            </p>
          ))}
        </div>

        {/* Chapter Navigation Bottom */}
        <div className="mt-16 pt-8 border-t border-leaf-200 dark:border-[#233529] flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={hasPrev ? `/story/${story.id}/read/${chapterNumber - 1}` : '#'}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors w-full sm:w-auto justify-center ${hasPrev ? 'bg-leaf-100 dark:bg-[#1d2b21] text-leaf-800 dark:text-leaf-200 hover:bg-leaf-200 dark:hover:bg-[#233529]' : 'bg-transparent text-leaf-300 dark:text-[#3E5242] cursor-not-allowed border border-leaf-200 dark:border-[#233529]'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Chương Trước
          </Link>
          
          <Link to={`/story/${story.id}`} className="p-3 text-leaf-500 dark:text-[#6e8573] hover:text-leaf-800 dark:hover:text-leaf-200 hover:bg-leaf-100 dark:hover:bg-[#1d2b21] rounded-full transition-colors hidden sm:block">
            <List className="w-6 h-6" />
          </Link>

          <Link
            to={hasNext ? `/story/${story.id}/read/${chapterNumber + 1}` : '#'}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors w-full sm:w-auto justify-center ${hasNext ? 'bg-leaf-800 dark:bg-[#4A7C59] text-white hover:bg-leaf-950 dark:hover:bg-[#3E5242] shadow-sm' : 'bg-transparent text-leaf-300 dark:text-[#3E5242] cursor-not-allowed border border-leaf-200 dark:border-[#233529]'}`}
          >
            Chương Tiếp <ChevronRight className="w-5 h-5" />
          </Link>
          <Link to={`/story/${story.id}`} className="mt-4 text-leaf-600 dark:text-[#6e8573] underline font-medium sm:hidden">
            Về mục lục truyện
          </Link>
        </div>
      </main>
    </div>
  );
}
