import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getStory, getChapters, Story, Chapter, addToHistory, updateReadingProgress } from '../lib/db';
import { ChevronLeft, ChevronRight, Settings, List, Home, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import AgeWarning from '../components/AgeWarning';
import { useReadingProgress } from '../lib/useReadingProgress';
import { isStoryConfirmed18, confirmStory18 } from '../lib/ageCheck';
import ThemeEffect from '../components/ThemeEffect';
import Watermark from '../components/Watermark';
import { toast } from 'react-hot-toast';

export default function ReadChapter() {
  const { id, chapterNum } = useParams<{ id: string; chapterNum: string }>();
  const navigate = useNavigate();
  const { user, isSuperAdmin, profile } = useAuth();
  const { siteTheme, mode } = useTheme();
  
  const [story, setStory] = useState<Story | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const { markRead } = useReadingProgress(id);

  useEffect(() => {
    if (id && chapterNum) {
      setLoading(true);
      Promise.all([
        getStory(id),
        getChapters(id)
      ]).then(([storyData, chaptersData]) => {
        setStory(storyData);
        setAllChapters(chaptersData);
        
        const num = parseInt(chapterNum, 10);
        let chap = chaptersData.find(c => c.chapterNumber === num);
        
        // Fallback: if not found by number, try finding by index if it's a small number
        if (!chap && num > 0 && num <= chaptersData.length) {
          chap = chaptersData[num - 1];
        }
        
        setChapter(chap || null);
        
        if (chap && storyData) {
           markRead(chap.id);
           
           // Record History and Progress if logged in
           if (user) {
              addToHistory(user.uid, {
                storyId: storyData.id,
                storyTitle: storyData.title,
                chapterId: chap.id,
                chapterNumber: chap.chapterNumber
              });

              updateReadingProgress(user.uid, {
                storyId: storyData.id,
                chapterId: chap.id,
                chapterNumber: chap.chapterNumber + 1,
                title: storyData.title
              });
           }
        }
        setLoading(false);

        // Check 18+
        const isAdult = storyData?.categories?.some(c => c.name.includes('18+') || c.name.includes('🔞')) || storyData?.title.includes('🔞');
        const sessionConfirmed = storyData ? isStoryConfirmed18(storyData.id) : false;
        if (isAdult && !sessionConfirmed) {
          setShowWarning(true);
        }
      });
    }
  }, [id, chapterNum]);

  const [fontSize, setFontSize] = useState(profile?.readingPreferences?.fontSize || 18);
  const [fontFamily, setFontFamily] = useState(profile?.readingPreferences?.fontFamily || localStorage.getItem('read_font') || 'serif');
  const [textColor, setTextColor] = useState(localStorage.getItem('read_color') || 'default');
  const [showSettings, setShowSettings] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [readBg, setReadBg] = useState(localStorage.getItem('read_bg') || 'transparent');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [isShopeeUnlocked, setIsShopeeUnlocked] = useState(false);
  const [isVerifyingShopee, setIsVerifyingShopee] = useState(false);

  useEffect(() => {
    localStorage.setItem('read_bg', readBg);
    localStorage.setItem('read_font', fontFamily);
    localStorage.setItem('read_color', textColor);
  }, [readBg, fontFamily, textColor]);

  useEffect(() => {
     if (chapter && chapter.password && sessionStorage.getItem(`unlocked_chap_${chapter.id}`) === 'true') {
        setIsPasswordUnlocked(true);
     } else {
        setIsPasswordUnlocked(false);
     }
     if (chapter) {
       const shopeeUnlockTime = localStorage.getItem(`shopee_unlocked_${chapter.id}`);
       if (shopeeUnlockTime) {
         const unlockTime = parseInt(shopeeUnlockTime, 10);
         if (Date.now() - unlockTime < 30 * 60 * 1000) { // 30 minutes
           setIsShopeeUnlocked(true);
         } else {
           localStorage.removeItem(`shopee_unlocked_${chapter.id}`);
           setIsShopeeUnlocked(false);
         }
       } else {
         setIsShopeeUnlocked(false);
       }
     } else {
        setIsShopeeUnlocked(false);
     }
     setPasswordInput('');
     setPasswordError('');
  }, [chapter]);

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

  const handleConfirmAge = () => {
    if (story) confirmStory18(story.id);
    setShowWarning(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-leaf-600 dark:text-leaf-400 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm">Đang tải chương...</div>;
  }

  if (showWarning) {
    return <AgeWarning onConfirm={handleConfirmAge} />;
  }

  if (!story || !chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-leaf-600 dark:text-leaf-400 gap-4 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm">
        <p>Nội dung không tồn tại hoặc có lỗi xảy ra.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-leaf-200 dark:bg-leaf-700 rounded-full hover:bg-leaf-300 dark:hover:bg-leaf-600 transition text-leaf-800 dark:text-leaf-200">
          Quay lại
        </button>
      </div>
    );
  }

  const currentChapterIdx = allChapters.findIndex(c => c.id === chapter.id);
  const hasNext = currentChapterIdx < allChapters.length - 1;
  const hasPrev = currentChapterIdx > 0;
  
  const nextChapter = hasNext ? allChapters[currentChapterIdx + 1] : null;
  const prevChapter = hasPrev ? allChapters[currentChapterIdx - 1] : null;

  const needsPassword = chapter.password && !isPasswordUnlocked && !isSuperAdmin;
  const isLocked = chapter.isLocked && !isSuperAdmin && (!user?.email || !chapter.unlockedEmails?.includes(user.email)) && !isShopeeUnlocked;

  const contentBgClass = readBg === 'beige' ? 'bg-orange-50/90 dark:bg-orange-950/90' : readBg === 'white' ? 'bg-white/90 dark:bg-black/90' : 'bg-transparent';
  
  const textColorClass = 
    textColor === 'black' ? 'text-black dark:text-black' :
    textColor === 'gray' ? 'text-gray-600 dark:text-gray-400' :
    textColor === 'white' ? 'text-white dark:text-white' :
    'text-leaf-900 dark:text-leaf-200';
    
  const fontClass = fontFamily === 'sans' ? 'font-sans' : 'font-serif';

  return (
    <div className={`min-h-screen text-leaf-900 dark:text-leaf-100 transition-colors duration-300 relative ${contentBgClass}`}>
      <ThemeEffect />
      <Watermark />
      <Helmet>
        <title>{`Chương ${chapter.chapterNumber}: ${chapter.title} - ${story.title}`}</title>
      </Helmet>
      {/* Top Navigation */}
      <div className={`fixed top-0 inset-x-0 bg-white/90 dark:bg-leaf-900/90 backdrop-blur-md border-b border-leaf-300 dark:border-leaf-600 z-40 transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={`/story/${story.id}`} className="flex items-center gap-2 text-leaf-700 dark:text-leaf-300 hover:text-leaf-900 dark:hover:text-leaf-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:block truncate max-w-[200px]">{story.title}</span>
          </Link>
          
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-leaf-600 dark:text-leaf-400 hover:text-leaf-900 dark:hover:text-leaf-100 hover:bg-leaf-100 dark:hover:bg-leaf-800 rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <Link to="/" className="p-2 text-leaf-600 dark:text-leaf-400 hover:text-leaf-900 dark:hover:text-leaf-100 hover:bg-leaf-100 dark:hover:bg-leaf-800 rounded-full transition-colors">
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-14 inset-x-0 bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md border-b border-leaf-200 dark:border-leaf-700 shadow-lg z-30 p-4 animate-in slide-in-from-top-2">
          <div className="max-w-md mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-leaf-700 dark:text-leaf-300">Cỡ chữ</span>
              <div className="flex items-center gap-4 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm rounded-full px-2 py-1 border border-leaf-200 dark:border-leaf-700">
                <button 
                  onClick={() => setFontSize(s => Math.max(14, s - 2))}
                  className="w-8 h-8 flex items-center justify-center text-leaf-700 dark:text-leaf-300 hover:bg-leaf-200 dark:hover:bg-leaf-700 rounded-full font-serif"
                >
                  A-
                </button>
                <span className="text-leaf-900 dark:text-leaf-100 font-medium min-w-[3ch] text-center">{fontSize}</span>
                <button 
                  onClick={() => setFontSize(s => Math.min(32, s + 2))}
                  className="w-8 h-8 flex items-center justify-center text-leaf-700 dark:text-leaf-300 hover:bg-leaf-200 dark:hover:bg-leaf-700 rounded-full font-serif font-bold text-lg"
                >
                  A+
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-leaf-700 dark:text-leaf-300">Màu nền</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setReadBg('transparent')} className={`w-8 h-8 rounded-full border-2 ${readBg === 'transparent' ? 'border-leaf-500' : 'border-transparent'} bg-leaf-100 dark:bg-leaf-800`}></button>
                <button onClick={() => setReadBg('white')} className={`w-8 h-8 rounded-full border-2 ${readBg === 'white' ? 'border-leaf-500' : 'border-leaf-200'} bg-white dark:bg-black`}></button>
                <button onClick={() => setReadBg('beige')} className={`w-8 h-8 rounded-full border-2 ${readBg === 'beige' ? 'border-leaf-500' : 'border-transparent'} bg-[#f5f0e1] dark:bg-[#3d3124]`}></button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-leaf-700 dark:text-leaf-300">Font chữ</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setFontFamily('serif')} className={`px-4 py-1.5 rounded-full border transition-colors ${fontFamily === 'serif' ? 'border-leaf-500 bg-leaf-100 text-leaf-900 dark:bg-leaf-800 dark:text-leaf-100' : 'border-leaf-200 dark:border-leaf-700 text-leaf-600 dark:text-leaf-400'} font-serif text-sm`}>Serif</button>
                <button onClick={() => setFontFamily('sans')} className={`px-4 py-1.5 rounded-full border transition-colors ${fontFamily === 'sans' ? 'border-leaf-500 bg-leaf-100 text-leaf-900 dark:bg-leaf-800 dark:text-leaf-100' : 'border-leaf-200 dark:border-leaf-700 text-leaf-600 dark:text-leaf-400'} font-sans text-sm`}>Sans</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-leaf-700 dark:text-leaf-300">Màu chữ</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setTextColor('default')} className={`w-8 h-8 flex justify-center items-center rounded-full border-2 transition-all ${textColor === 'default' ? 'border-leaf-500 ring-2 ring-leaf-500/20' : 'border-leaf-200 dark:border-leaf-700'} bg-transparent text-leaf-900 dark:text-leaf-100 font-bold text-xs`}>A</button>
                <button onClick={() => setTextColor('black')} className={`w-8 h-8 rounded-full border-2 transition-all ${textColor === 'black' ? 'border-leaf-500 ring-2 ring-leaf-500/20' : 'border-gray-300'} bg-black`}></button>
                <button onClick={() => setTextColor('gray')} className={`w-8 h-8 rounded-full border-2 transition-all ${textColor === 'gray' ? 'border-leaf-500 ring-2 ring-leaf-500/20' : 'border-transparent'} bg-gray-500`}></button>
                <button onClick={() => setTextColor('white')} className={`w-8 h-8 rounded-full border-2 transition-all ${textColor === 'white' ? 'border-leaf-500 ring-2 ring-leaf-500/20' : 'border-gray-300'} bg-white`}></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reading Container */}
      <main className="max-w-3xl mx-auto px-4 py-24 min-h-[calc(100vh-100px)]">
        {(mode === 'dark' && siteTheme.chapterBannerDarkUrl) || siteTheme.chapterBannerUrl ? (
          <div className="w-full mb-12 rounded-2xl overflow-hidden shadow-sm">
            <img 
              src={mode === 'dark' && siteTheme.chapterBannerDarkUrl ? siteTheme.chapterBannerDarkUrl : siteTheme.chapterBannerUrl} 
              alt="Chapter Banner" 
              className="w-full h-auto block" 
            />
          </div>
        ) : null}
        
        <div className="text-center mb-12">
          <h2 className="text-leaf-600 dark:text-leaf-400 text-sm font-medium tracking-widest uppercase mb-3">Chương {chapter.chapterNumber}</h2>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-leaf-900 dark:text-leaf-50 leading-snug">
            {chapter.title}
          </h1>
        </div>

        {needsPassword ? (
           <form onSubmit={(e) => {
             e.preventDefault();
             if (passwordInput === chapter.password) {
               setIsPasswordUnlocked(true);
               sessionStorage.setItem(`unlocked_chap_${chapter.id}`, 'true');
               setPasswordError('');
             } else {
               setPasswordError('Mật khẩu không đúng!');
             }
           }} className="my-16 py-12 px-6 border-2 border-dashed border-leaf-300 dark:border-leaf-700 bg-white/50 dark:bg-leaf-900/20 backdrop-blur-sm rounded-3xl text-center max-w-md mx-auto">
             <div className="w-16 h-16 bg-leaf-100 dark:bg-leaf-800 text-leaf-600 dark:text-leaf-300 rounded-full flex items-center justify-center mx-auto mb-6">
               <Lock className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-leaf-900 dark:text-leaf-100 mb-4 font-serif">Chương Khóa Bằng Mật Khẩu</h3>
             <p className="text-leaf-700 dark:text-leaf-300 mb-6 text-sm">Vui lòng nhập mật khẩu để tiếp tục đọc.</p>
             <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Nhập mật khẩu..." className="w-full px-4 py-3 rounded-xl border border-leaf-200 dark:border-leaf-700 bg-white dark:bg-leaf-950 focus:ring-2 focus:ring-leaf-500 outline-none mb-2 text-center" />
             {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
             <button type="submit" className="w-full mt-4 bg-leaf-800 hover:bg-leaf-900 text-white font-medium py-3 rounded-xl transition">Mở Khóa</button>
           </form>
        ) : isLocked ? (
           <div className="my-16 py-12 px-6 border-2 border-dashed border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-3xl text-center">
             <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300 rounded-full flex items-center justify-center mx-auto mb-6">
               <Lock className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-leaf-900 dark:text-leaf-100 mb-4 font-serif">Chương Này Đã Được Khóa</h3>
             <p className="text-leaf-700 dark:text-leaf-300 mb-8 max-w-md mx-auto">
               Vui lòng ủng hộ tác giả/dịch giả để đọc tiếp chương này nhé. Cảm ơn bạn rất nhiều!
             </p>
             {chapter.shopeeLink && (
               <button 
                 onClick={() => {
                   window.open(chapter.shopeeLink, '_blank');
                   setIsVerifyingShopee(true);
                   setTimeout(() => {
                     localStorage.setItem(`shopee_unlocked_${chapter.id}`, Date.now().toString());
                     setIsShopeeUnlocked(true);
                     setIsVerifyingShopee(false);
                   }, Math.floor(Math.random() * 2000) + 3000);
                 }}
                 disabled={isVerifyingShopee}
                 className="inline-block bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-wait text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-orange-500/30"
               >
                 {isVerifyingShopee ? 'Đang xác nhận...' : 'Ủng Hộ Qua Shopee'}
               </button>
             )}
           </div>
        ) : (
          <div 
            className={`${fontClass} ${textColorClass} leading-relaxed relative z-[1]`}
            style={{ fontSize: `${fontSize}px` }}
            onContextMenu={(e) => {
              e.preventDefault();
              toast.error("Chuột phải bị vô hiệu hóa để bảo vệ nội dung.");
              return false;
            }}
            onCopy={(e) => {
              e.preventDefault();
              toast.error("Nội dung được bảo vệ bản quyền, vui lòng không sao chép.");
              return false;
            }}
          >
            {chapter.content?.map((para, i) => {
              const imgMatch = para.match(/^\[img\](.*?)\[\/img\]$/);
              if (imgMatch) {
                return (
                  <div key={i} className="mb-6 flex justify-center">
                    <img src={imgMatch[1]} alt={`Image in chapter`} className="max-w-full rounded-xl shadow-md" loading="lazy" />
                  </div>
                );
              }
              return (
                <p key={i} className="mb-6 pb-2 text-justify indent-8 leading-[1.8]">
                  {para}
                </p>
              );
            })}
          </div>
        )}

        {/* Chapter Navigation Bottom */}
        <div className="mt-16 pt-8 border-t border-leaf-200 dark:border-leaf-700 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={hasPrev && prevChapter ? `/story/${story.id}/read/${prevChapter.chapterNumber}` : '#'}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors w-full sm:w-auto justify-center ${hasPrev ? 'bg-white/40 dark:bg-leaf-800/40 text-leaf-800 dark:text-leaf-200 hover:bg-leaf-200 dark:hover:bg-leaf-700' : 'bg-transparent text-leaf-300 dark:text-leaf-500 cursor-not-allowed border border-leaf-200 dark:border-leaf-700'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Chương Trước
          </Link>
          
          <Link to={`/story/${story.id}`} className="p-3 text-leaf-500 dark:text-leaf-400 hover:text-leaf-800 dark:hover:text-leaf-200 hover:bg-leaf-100 dark:hover:bg-leaf-800 rounded-full transition-colors hidden sm:block">
            <List className="w-6 h-6" />
          </Link>

          <Link
            to={hasNext && nextChapter ? `/story/${story.id}/read/${nextChapter.chapterNumber}` : '#'}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors w-full sm:w-auto justify-center ${hasNext ? 'bg-leaf-800 dark:bg-leaf-600 text-white hover:bg-leaf-950 dark:hover:bg-leaf-500 shadow-sm' : 'bg-transparent text-leaf-300 dark:text-leaf-500 cursor-not-allowed border border-leaf-200 dark:border-leaf-700'}`}
          >
            Chương Tiếp <ChevronRight className="w-5 h-5" />
          </Link>
          <Link to={`/story/${story.id}`} className="mt-4 text-leaf-600 dark:text-leaf-400 underline font-medium sm:hidden">
            Về mục lục truyện
          </Link>
        </div>
      </main>
    </div>
  );
}
