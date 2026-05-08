import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getStories, Story, CATEGORIES, PaginatedStories } from '../lib/db';
import { Search, X } from 'lucide-react';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [chapters, setChapters] = useState<string>('');
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync searchQuery with searchParam when URL changes
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  const fetchStories = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await getStories(12, isLoadMore ? lastVisible : null);
      
      // Handle the different return types just in case
      const paginatedResult = result as PaginatedStories;
      const newStories = paginatedResult.stories || [];
      
      if (isLoadMore) {
        setAllStories(prev => [...prev, ...newStories]);
      } else {
        setAllStories(newStories);
      }
      
      setLastVisible(paginatedResult.lastVisible);
      setHasMore(paginatedResult.hasMore);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchStories(true);
    }
  };

  const allAvailableCategories = useMemo(() => {
    const customCats = new Map();
    allStories.forEach(s => {
      s.categories?.forEach(c => {
        if (!CATEGORIES.some(cat => cat.id === c.id)) {
          customCats.set(c.id, c);
        }
      });
    });
    // Filter out explicit 18+ categories from the buttons list (IDs 2 and 4)
    return [...CATEGORIES, ...Array.from(customCats.values())].filter(cat => !['2', '4'].includes(cat.id));
  }, [allStories]);

  const filteredStories = useMemo(() => {
    return allStories.filter(story => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!story.title.toLowerCase().includes(query) && !story.author.toLowerCase().includes(query)) return false;
      }
      
      if (category) {
        // Special case: Ngôn Tình (1) should include Ngôn Tình 🔞 (2)
        if (category === '1') {
          if (!story.categories?.some(c => c.id === '1' || c.id === '2')) return false;
        } 
        // Special case: Đam Mỹ (3) should include Đam Mỹ 🔞 (4)
        else if (category === '3') {
          if (!story.categories?.some(c => c.id === '3' || c.id === '4')) return false;
        }
        else if (!story.categories?.find(c => c.id === category)) return false;
      }

      if (status && story.status !== status) return false;
      if (chapters) {
        if (chapters === 'short' && story.chapterCount >= 100) return false;
        if (chapters === 'medium' && (story.chapterCount < 100 || story.chapterCount > 500)) return false;
        if (chapters === 'long' && story.chapterCount <= 500) return false;
      }
      return true;
    });
  }, [allStories, category, searchQuery, status, chapters]);

  // Sync search query with URL params
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setCategory('');
    setStatus('');
    setChapters('');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#980b2f] dark:text-white mb-4 italic">
          {searchQuery ? 'Kết Quả Tìm Kiếm' : 'Khám Phá Thư Viện'}
        </h1>
        {searchQuery && (
          <div className="flex items-center gap-4">
            <p className="text-leaf-300 italic">Đang hiển thị kết quả cho: <span className="font-bold text-white not-italic">"{searchQuery}"</span></p>
            <button 
              onClick={clearFilters}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 underline underline-offset-4 uppercase tracking-widest transition-colors"
            >
              Quay lại thư viện
            </button>
          </div>
        )}
      </div>
      
      {/* Filters Section - Hidden when searching to focus on results */}
      {!searchQuery && (
        <section className="bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-leaf-200 dark:border-leaf-700 mb-10 transition-colors">
          <div className="mb-8 relative">
             <div className="absolute left-6 top-1/2 -translate-y-1/2 text-leaf-400">
               <Search size={20} />
             </div>
             <input
               type="text"
               placeholder="Tìm bằng tên truyện, tác giả..."
               value={searchQuery}
               onChange={e => handleSearchChange(e.target.value)}
               className="w-full bg-white dark:bg-leaf-950 pl-14 pr-12 py-4 rounded-2xl border border-leaf-200 dark:border-leaf-700 focus:ring-2 focus:ring-leaf-500 outline-none text-leaf-900 dark:text-leaf-100 placeholder-leaf-400 font-sans transition-all"
             />
             {searchQuery && (
               <button
                 onClick={() => handleSearchChange('')}
                 className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-leaf-400 hover:text-rose-500 transition-colors"
               >
                 <X size={18} />
               </button>
             )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Category Filter */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-leaf-800 dark:text-white mb-4">Thể Loại</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${category === '' ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-white/40 dark:bg-leaf-800/40 text-leaf-900 dark:text-[#3e7fd3] hover:bg-leaf-200 dark:hover:bg-leaf-700'}`}
                >
                  Tất cả
                </button>
                {allAvailableCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${category === cat.id ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-white/40 dark:bg-leaf-800/40 text-leaf-900 dark:text-[#3e7fd3] hover:bg-leaf-200 dark:hover:bg-leaf-700'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
  
            {/* Status Filter */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-leaf-800 dark:text-white mb-4">Trạng Thái</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatus('')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${status === '' ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-white/40 dark:bg-leaf-800/40 text-leaf-900 dark:text-[#3e7fd3] hover:bg-leaf-200 dark:hover:bg-leaf-700'}`}
                >
                  Tất cả
                </button>
                {['Đang ra', 'Hoàn thành'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatus(st)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${status === st ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-white/40 dark:bg-leaf-800/40 text-leaf-900 dark:text-[#3e7fd3] hover:bg-leaf-200 dark:hover:bg-leaf-700'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
  
            {/* Chapter Count Filter */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-leaf-800 dark:text-white mb-4">Số Chương</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Tất cả', value: '' },
                  { label: 'Dưới 100', value: 'short' },
                  { label: '100 - 500', value: 'medium' },
                  { label: 'Trên 500', value: 'long' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setChapters(opt.value)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${chapters === opt.value ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-white/40 dark:bg-leaf-800/40 text-leaf-900 dark:text-[#3e7fd3] hover:bg-leaf-200 dark:hover:bg-leaf-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
  
          </div>
        </section>
      )}


      {/* Results Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-serif font-bold text-leaf-900 dark:text-leaf-100">
          Kết Quả {loading ? '' : `(${filteredStories.length})`}
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md rounded-3xl border border-leaf-200 dark:border-leaf-700">
          <p className="text-leaf-600 dark:text-leaf-400 font-medium">Đang tải...</p>
        </div>
      ) : filteredStories.length > 0 ? (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStories.map(story => {
            const isMature = story.categories?.some(c => c.name.includes('🔞'));
            return (
              <Link key={story.id} to={`/story/${story.id}`} className="group flex flex-col items-center sm:items-start text-center sm:text-left gap-4 p-4 rounded-3xl bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md border border-leaf-200 dark:border-leaf-700 hover:border-leaf-400 dark:hover:border-leaf-500 transition-colors shadow-sm">
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-white/40 dark:bg-leaf-800/40 relative">
                  {story.coverUrl ? <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-white/40 dark:bg-leaf-800/40"></div>}
                </div>
                <div className="w-full">
                <span className="text-[10px] uppercase font-primary tracking-widest text-leaf-700 dark:text-leaf-200 block mb-1 font-black">
                  {story.categories?.[0]?.name || 'Khác'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5 min-w-0">
                  <h3 className="font-serif font-bold text-lg text-leaf-900 dark:text-white line-clamp-1 group-hover:text-leaf-800 dark:group-hover:text-leaf-400 transition-colors">
                    {story.title}
                  </h3>
                  <div className="flex gap-1 flex-shrink-0">
                    {story.status === 'Hoàn thành' && (
                      <span className="px-1.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[8px] font-bold uppercase leading-none border border-green-100 dark:border-green-800/50">FULL</span>
                    )}
                    {story.views > 20 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-[8px] font-bold uppercase leading-none border border-orange-100 dark:border-orange-800/50">HOT</span>
                    )}
                    {isMature && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-[8px] font-bold uppercase leading-none border border-red-100 dark:border-red-800/50">18+</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-leaf-700 dark:text-leaf-200 font-semibold">
                  <span>{story.chapterCount || 0} chương</span>
                  <span>•</span>
                  <span>{story.status}</span>
                </div>
              </div>
            </Link>
          )})}
        </div>
        
        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-10 py-4 bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md border border-leaf-200 dark:border-leaf-700 rounded-full text-sm font-bold text-leaf-900 dark:text-white hover:bg-leaf-800 dark:hover:bg-leaf-700 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-3"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <span>Xem thêm truyện</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse group-hover:bg-current transition-colors" />
                </>
              )}
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="text-center py-20 bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md rounded-3xl border border-leaf-200 dark:border-leaf-700">
          <p className="text-leaf-600 dark:text-leaf-400 font-medium">Không tìm thấy truyện phù hợp với bộ lọc.</p>
          <button 
            onClick={clearFilters}
            className="mt-4 px-6 py-2 bg-white/40 dark:bg-leaf-800/40 text-leaf-800 dark:text-leaf-200 hover:bg-leaf-200 dark:hover:bg-leaf-700 rounded-full text-sm font-semibold transition-colors"
          >
            Xóa hết bộ lọc
          </button>
        </div>
      )}

    </main>
  );
}
