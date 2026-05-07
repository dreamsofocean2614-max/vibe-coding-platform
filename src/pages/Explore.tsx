import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STORIES, CATEGORIES } from '../lib/data';

export default function Explore() {
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [chapters, setChapters] = useState<string>('');

  const filteredStories = useMemo(() => {
    return MOCK_STORIES.filter(story => {
      if (category && !story.categories.find(c => c.id === category)) return false;
      if (status && story.status !== status) return false;
      if (chapters) {
        if (chapters === 'short' && story.chapterCount >= 100) return false;
        if (chapters === 'medium' && (story.chapterCount < 100 || story.chapterCount > 500)) return false;
        if (chapters === 'long' && story.chapterCount <= 500) return false;
      }
      return true;
    });
  }, [category, status, chapters]);

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-leaf-900 dark:text-leaf-100 mb-8 italic">
        Khám Phá Thư Viện
      </h1>
      
      {/* Filters Section */}
      <section className="bg-white dark:bg-[#162019] rounded-3xl p-6 md:p-8 shadow-sm border border-leaf-200 dark:border-[#233529] mb-10 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Category Filter */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-[#6e8573] mb-4">Thể Loại</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory('')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${category === '' ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-leaf-100 dark:bg-[#1d2b21] text-leaf-700 dark:text-leaf-300 hover:bg-leaf-200 dark:hover:bg-[#233529]'}`}
              >
                Tất cả
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${category === cat.id ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-leaf-100 dark:bg-[#1d2b21] text-leaf-700 dark:text-leaf-300 hover:bg-leaf-200 dark:hover:bg-[#233529]'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-[#6e8573] mb-4">Trạng Thái</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatus('')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${status === '' ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-leaf-100 dark:bg-[#1d2b21] text-leaf-700 dark:text-leaf-300 hover:bg-leaf-200 dark:hover:bg-[#233529]'}`}
              >
                Tất cả
              </button>
              {['Đang ra', 'Hoàn thành'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${status === st ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-leaf-100 dark:bg-[#1d2b21] text-leaf-700 dark:text-leaf-300 hover:bg-leaf-200 dark:hover:bg-[#233529]'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Count Filter */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-[#6e8573] mb-4">Số Chương</h3>
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
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${chapters === opt.value ? 'bg-leaf-800 dark:bg-leaf-700 text-white' : 'bg-leaf-100 dark:bg-[#1d2b21] text-leaf-700 dark:text-leaf-300 hover:bg-leaf-200 dark:hover:bg-[#233529]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Results Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-serif font-bold text-leaf-900 dark:text-leaf-100">
          Kết Quả ({filteredStories.length})
        </h2>
      </div>

      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStories.map(story => (
            <Link key={story.id} to={`/story/${story.id}`} className="group flex flex-col items-center sm:items-start text-center sm:text-left gap-4 p-4 rounded-3xl bg-white dark:bg-[#162019] border border-leaf-200 dark:border-[#233529] hover:border-leaf-400 dark:hover:border-[#3E5242] transition-colors shadow-sm">
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-leaf-100 dark:bg-[#1d2b21]">
                <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="w-full">
                <span className="text-[10px] uppercase font-bold tracking-widest text-leaf-500 dark:text-[#6e8573] block mb-1">
                  {story.categories[0]?.name}
                </span>
                <h3 className="font-serif font-bold text-lg text-leaf-900 dark:text-leaf-100 mb-1 line-clamp-1 group-hover:text-leaf-800 dark:group-hover:text-leaf-400 transition-colors">
                  {story.title}
                </h3>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-leaf-600 dark:text-[#6e8573]">
                  <span>{story.chapterCount} chương</span>
                  <span>•</span>
                  <span>{story.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#162019] rounded-3xl border border-leaf-200 dark:border-[#233529]">
          <p className="text-leaf-600 dark:text-[#6e8573] font-medium">Không tìm thấy truyện phù hợp với bộ lọc.</p>
          <button 
            onClick={() => { setCategory(''); setStatus(''); setChapters(''); }}
            className="mt-4 px-6 py-2 bg-leaf-100 dark:bg-[#1d2b21] text-leaf-800 dark:text-leaf-200 hover:bg-leaf-200 dark:hover:bg-[#233529] rounded-full text-sm font-semibold transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

    </main>
  );
}
