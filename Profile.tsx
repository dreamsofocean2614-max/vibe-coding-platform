import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getUserHistory, toggleFavorite, isFavorite, ReadingHistory, Favorite, Story, getStories, UserProfile, updateReadingProgress, ReadingProgress, PaginatedStories } from '../lib/db';
import { User, BookOpen, Heart, History, Settings, LogOut, Shield, FileText, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function Profile() {
  const { user, profile, isSuperAdmin, isEditor } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reading' | 'favorites' | 'history' | 'my-stories' | 'stats'>('reading');
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch progress
        const progressSnap = await getDocs(collection(db, 'users', user.uid, 'reading_progress'));
        setReadingProgress(progressSnap.docs.map(doc => doc.data() as ReadingProgress));

        // Fetch favorites
        const favSnap = await getDocs(collection(db, 'users', user.uid, 'favorites'));
        setFavorites(favSnap.docs.map(doc => doc.data() as Favorite));

        // Fetch history
        const historyData = await getUserHistory(user.uid);
        setHistory(historyData);

        if (isEditor) {
          const data = await getStories(200);
          const result = data as PaginatedStories;
          const stories = result.stories || [];
          setMyStories(stories.filter(s => s.uploaderId === user.uid));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, isEditor, navigate]);

  if (!user || !profile) return null;

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const tabs = [
    { id: 'reading', label: 'Đang đọc', icon: BookOpen, show: true },
    { id: 'favorites', label: 'Yêu thích', icon: Heart, show: true },
    { id: 'history', label: 'Lịch sử', icon: History, show: true },
    { id: 'my-stories', label: 'Truyện của tôi', icon: FileText, show: isEditor },
    { id: 'stats', label: 'Thống kê', icon: BarChart2, show: isEditor || isSuperAdmin },
  ].filter(t => t.show);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Header Profile */}
      <div className="bg-white dark:bg-[#051a3a] rounded-3xl p-8 shadow-sm border border-leaf-100 dark:border-white/5 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-rose-500 shadow-lg">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
                  <User size={64} />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white p-2 rounded-full shadow-md">
              {isSuperAdmin ? <Shield size={20} /> : isEditor ? <FileText size={20} /> : <User size={20} />}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-leaf-900 dark:text-white mb-1">
              {profile.displayName || 'Người dùng ẩn danh'}
            </h1>
            <p className="text-rose-600 dark:text-rose-400 font-medium text-sm flex items-center justify-center md:justify-start gap-2 mb-4">
              {isSuperAdmin ? 'Super Admin' : isEditor ? `Admin Đăng Truyện ${profile.pseudonym ? `(${profile.pseudonym})` : ''}` : 'Độc giả thân thiết'}
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
              Tham gia: {new Date(profile.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('vi-VN')}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link to="/settings" className="flex items-center gap-2 px-4 py-2 bg-leaf-50 dark:bg-white/5 text-leaf-700 dark:text-leaf-300 rounded-xl hover:bg-leaf-100 dark:hover:bg-white/10 transition-colors text-sm font-medium">
                <Settings size={18} /> Cài đặt tài khoản
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-sm font-medium"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 text-center px-4 md:border-l border-leaf-100 dark:border-white/5">
            <div>
              <p className="text-2xl font-serif font-bold text-leaf-900 dark:text-white">{readingProgress.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-leaf-500 font-bold">Đang đọc</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-leaf-900 dark:text-white">{favorites.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-leaf-500 font-bold">Yêu thích</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-leaf-900 dark:text-white">{history.length}</p>
              <p className="text-[10px] uppercase tracking-widest text-leaf-500 font-bold">Đã đọc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white/50 dark:bg-[#051a3a]/50 p-2 rounded-2xl border border-leaf-100 dark:border-white/5 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-rose-600 text-white shadow-md' : 'text-leaf-600 dark:text-leaf-400 hover:bg-white dark:hover:bg-white/5'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'reading' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {readingProgress.length > 0 ? readingProgress.map(item => (
                    <Link to={`/story/${item.storyId}/chapter/${item.chapterNumber}`} key={item.storyId} className="bg-white dark:bg-[#051a3a] p-5 rounded-2xl border border-leaf-100 dark:border-white/5 hover:shadow-md transition-all group">
                      <h3 className="font-serif font-bold text-leaf-900 dark:text-white truncate mb-2">{item.title}</h3>
                      <div className="flex justify-between items-center text-sm text-leaf-500">
                        <span>Chương tiếp theo: {item.chapterNumber}</span>
                        <span className="text-[10px] uppercase font-bold text-rose-500">Tiếp tục đọc &rarr;</span>
                      </div>
                    </Link>
                  )) : (
                    <div className="col-span-full py-12 text-center text-leaf-500 italic">Bạn chưa đọc truyện nào gần đây.</div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                  {favorites.length > 0 ? favorites.map(fav => (
                    <Link to={`/story/${fav.storyId}`} key={fav.storyId} className="group">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-sm border border-leaf-100 dark:border-white/5 mb-3">
                        <img src={fav.storyCover} alt={fav.storyTitle} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <h3 className="text-xs font-bold text-center text-leaf-900 dark:text-white truncate uppercase font-serif">{fav.storyTitle}</h3>
                    </Link>
                  )) : (
                    <div className="col-span-full py-12 text-center text-leaf-500 italic">Danh sách yêu thích đang trống.</div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  {history.length > 0 ? history.slice(0, 20).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#051a3a] p-4 rounded-xl border border-leaf-100 dark:border-white/5">
                      <div>
                        <Link to={`/story/${item.storyId}`} className="font-bold text-leaf-800 dark:text-white hover:text-rose-500 transition-colors uppercase font-serif text-sm mr-2">
                          {item.storyTitle}
                        </Link>
                        <span className="text-xs text-leaf-500">Chương {item.chapterNumber}</span>
                      </div>
                      <span className="text-[10px] text-leaf-400">
                        {new Date(item.viewedAt?.seconds * 1000 || Date.now()).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )) : (
                    <div className="py-12 text-center text-leaf-500 italic">Lịch sử đọc của bạn đang trống.</div>
                  )}
                </div>
              )}

              {activeTab === 'my-stories' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myStories.map(story => (
                    <div key={story.id} className="bg-white dark:bg-[#051a3a] p-6 rounded-2xl border border-leaf-100 dark:border-white/5 flex gap-4">
                      <img src={story.coverUrl} alt={story.title} className="w-20 h-28 object-cover rounded-lg shadow-sm" />
                      <div className="flex-1">
                        <h3 className="font-serif font-bold text-leaf-900 dark:text-white mb-1 uppercase text-sm">{story.title}</h3>
                        <div className="flex gap-4 text-xs text-leaf-500 mb-4">
                          <span>{story.chapterCount || 0} chương</span>
                          <span>{story.views || 0} lượt đọc</span>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/admin/story/${story.id}/edit`} className="px-3 py-1 bg-leaf-100 dark:bg-white/5 text-leaf-800 dark:text-white rounded-lg text-[10px] font-bold uppercase transition-colors hover:bg-leaf-200">Sửa</Link>
                          <Link to={`/story/${story.id}`} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase transition-colors hover:bg-rose-700">Xem</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {myStories.length === 0 && <div className="col-span-full py-12 text-center text-leaf-500 italic">Bạn chưa đăng truyện nào.</div>}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-[#051a3a] p-8 rounded-2xl border border-leaf-100 dark:border-white/5">
                    <h3 className="text-lg font-serif font-bold text-leaf-900 dark:text-white mb-6 uppercase tracking-wider">Tổng lượt xem tháng này</h3>
                    <div className="h-48 flex items-end gap-3 px-4">
                      {[40, 65, 55, 80, 95, 75, 85].map((val, i) => (
                        <div key={i} className="flex-1 bg-rose-500/20 dark:bg-rose-500/10 rounded-t-lg relative group">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${val}%` }}
                            className="bg-rose-500 rounded-t-lg w-full absolute bottom-0"
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-leaf-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {val * 123}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] text-leaf-400 font-bold uppercase">
                      <span>Thứ 2</span>
                      <span>Hôm nay</span>
                    </div>
                  </div>

                  <div className="bg-rose-600 p-8 rounded-2xl text-white shadow-xl shadow-rose-600/20 flex flex-col justify-center">
                    <p className="text-rose-100 text-sm font-medium mb-1 uppercase tracking-widest">Tổng lượt xem tích lũy</p>
                    <h4 className="text-5xl font-serif font-bold mb-4">
                      {isSuperAdmin ? '1.2M+' : myStories.reduce((acc, s) => acc + (s.views || 0), 0).toLocaleString()}
                    </h4>
                    <p className="text-rose-100 text-xs italic">"Sức lao động bỏ ra sẽ được đền đáp xứng đáng dưới mái hiên này."</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
