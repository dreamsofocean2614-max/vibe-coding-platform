import { Link } from 'react-router-dom';
import { MOCK_STORIES } from '../lib/data';

export default function Home() {
  const featuredStory = MOCK_STORIES[0];
  const rankings = MOCK_STORIES; // use all as rankings list for now

  return (
    <main className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 p-4 md:p-10 overflow-hidden">
      {/* Left Section: Featured Novel */}
      <section className="w-full md:w-2/3 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-[#6e8573]">Tác phẩm nổi bật</h2>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full border border-leaf-300 dark:border-[#2a3f31] flex items-center justify-center text-leaf-800 dark:text-leaf-400 transition-colors hover:bg-leaf-100 dark:hover:bg-[#1d2b21]">
              &larr;
            </button>
            <button className="w-8 h-8 rounded-full bg-leaf-800 dark:bg-leaf-700 flex items-center justify-center text-white transition-colors hover:bg-leaf-950 dark:hover:bg-leaf-800">
              &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#162019] rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row gap-8 shadow-sm border border-leaf-200 dark:border-[#233529] flex-1 h-full transition-colors">
          <div className="w-48 sm:w-56 aspect-[3/4] bg-leaf-200 dark:bg-[#1d2b21] rounded-xl overflow-hidden shrink-0 border border-leaf-300 dark:border-[#2a3f31] shadow-sm mx-auto sm:mx-0">
            <img src={featuredStory.coverUrl} alt={featuredStory.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex flex-col justify-center gap-4">
            <span className="px-3 py-1 bg-leaf-100 dark:bg-[#1d2b21] text-leaf-800 dark:text-leaf-300 text-[10px] font-bold rounded-full w-fit uppercase tracking-widest">
              {featuredStory.categories.map(c => c.name).join(' • ')} • {featuredStory.status}
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-medium leading-tight text-leaf-900 dark:text-leaf-50">
              {featuredStory.title}
            </h3>
            <p className="text-leaf-600 dark:text-leaf-300 text-sm leading-relaxed line-clamp-4">
              {featuredStory.description}
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link to={`/story/${featuredStory.id}`} className="bg-leaf-800 dark:bg-leaf-600 hover:bg-leaf-950 dark:hover:bg-leaf-700 transition-colors text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg shadow-leaf-800/20 text-center">
                Đọc ngay
              </Link>
              <Link to={`/story/${featuredStory.id}`} className="border border-leaf-300 dark:border-[#3E5242] hover:bg-leaf-50 dark:hover:bg-[#1d2b21] transition-colors px-8 py-3 rounded-full text-sm font-semibold text-leaf-800 dark:text-leaf-200 text-center">
                Chi tiết
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Right Section: Rankings */}
      <section className="w-full md:w-1/3 flex flex-col gap-6">
        <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-leaf-500 dark:text-[#6e8573]">Bảng xếp hạng tuần</h2>
        <div className="bg-white dark:bg-[#162019] rounded-3xl p-6 shadow-sm border border-leaf-200 dark:border-[#233529] flex-1 flex flex-col h-full transition-colors">
          <div className="flex flex-col divide-y divide-leaf-100 dark:divide-[#1d2b21] h-full">
            {rankings.map((story, idx) => (
              <Link to={`/story/${story.id}`} key={story.id} className="py-4 flex items-center gap-4 group cursor-pointer first:pt-2">
                <span className={`text-2xl font-serif italic w-8 text-center ${idx === 0 ? 'text-leaf-800 dark:text-leaf-400' : 'text-leaf-800 dark:text-leaf-400 opacity-50'}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-leaf-900 dark:text-leaf-100 group-hover:text-leaf-800 dark:group-hover:text-leaf-300 transition-colors line-clamp-1">{story.title}</h4>
                  <p className="text-[11px] text-leaf-500 dark:text-[#6e8573] mt-0.5 uppercase tracking-widest">{story.categories[0]?.name} • {(story.views / 1000).toFixed(0)}K lượt</p>
                </div>
                {idx === 0 && <div className="w-2 h-2 rounded-full bg-leaf-800 dark:bg-leaf-400"></div>}
              </Link>
            ))}
          </div>
          <button className="mt-8 text-center py-2 text-xs font-bold text-leaf-800 dark:text-leaf-400 uppercase tracking-widest hover:underline">
            Xem tất cả
          </button>
        </div>
      </section>
    </main>
  );
}
