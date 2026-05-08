import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Story } from '../lib/db';

interface TrendingRankingProps {
  stories: Story[];
}

export default function TrendingRanking({ stories }: TrendingRankingProps) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(stories.length / itemsPerPage);
  
  const sortedStories = [...stories].sort((a, b) => (b.views || 0) - (a.views || 0));
  const currentStories = sortedStories.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <div className="w-full bg-[#fff0f3] dark:bg-leaf-900/20 backdrop-blur-md rounded-3xl border border-[#ffccd5] dark:border-white/10 p-6 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={prevPage}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-white/5 border border-pink-100 dark:border-[#4591fe] text-[#c2185b] dark:text-[#4591fe] hover:bg-[#c2185b] dark:hover:bg-[#4591fe] hover:text-white transition-all shadow-sm"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h2 className="text-lg font-serif font-black text-[#c2185b] dark:text-[#cce2fb] tracking-tight flex items-center gap-2">
          THỊNH HÀNH
        </h2>

        <button 
          onClick={nextPage}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-white/5 border border-pink-100 dark:border-[#4591fe] text-[#c2185b] dark:text-[#4591fe] hover:bg-[#c2185b] dark:hover:bg-[#4591fe] hover:text-white transition-all shadow-sm"
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            {currentStories.map((story, index) => {
              const rank = page * itemsPerPage + index + 1;
              const isTop1 = rank === 1;
              const isMature = story.categories?.some(c => c.name.includes('🔞'));

              if (isTop1) {
                return (
                  <Link 
                    key={story.id} 
                    to={`/story/${story.id}`}
                    className="group relative flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-pink-100 dark:border-white/10 shadow-[0_8px_30px_rgba(194,24,91,0.08)] dark:shadow-[0_8px_30px_rgba(182,220,254,0.1)] hover:shadow-[0_15px_40px_rgba(194,24,91,0.15)] dark:hover:shadow-[0_15px_40px_rgba(182,220,254,0.2)] transition-all duration-500"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#b6dcfe]/30 to-blue-500/0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex justify-between items-start">
                      <span className="text-4xl font-black italic text-[#c2185b] dark:text-[#b6dcfe] drop-shadow-sm leading-none">
                        01
                      </span>
                      <div className="bg-[#fff0f3] dark:bg-[#114184] px-3 py-1 rounded-full flex items-center gap-1.5 border border-pink-200 dark:border-[#b6dcfe]">
                        <TrendingUp size={12} className="text-[#c2185b] dark:text-[#b6dcfe]" />
                        <span className="text-[10px] font-black text-[#c2185b] dark:text-[#b6dcfe] uppercase tracking-wider">Thịnh Hành</span>
                      </div>
                    </div>

                    <div className="flex gap-4 relative">
                      <div className="relative aspect-square w-32 shrink-0 rounded-xl overflow-hidden shadow-sm border border-pink-100 dark:border-white/10 group-hover:scale-[1.02] transition-transform duration-500">
                        {story.coverUrl ? (
                          <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-pink-50 dark:bg-leaf-800" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <h3 className="text-xl font-black text-leaf-900 dark:text-white leading-tight truncate group-hover:text-[#c2185b] dark:group-hover:text-[#6498fb] transition-colors uppercase font-serif">
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
                        <p className="text-xs font-bold text-[#c2185b] dark:text-[#b6dcfe] mt-0 truncate">
                          Tác giả: {story.author}
                        </p>
                        <p className="text-[11px] text-leaf-500 dark:text-leaf-300 mt-1 font-medium italic">
                          {new Intl.NumberFormat('vi-VN').format(story.views || 0)} lượt đọc
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              }

              return (
                <Link 
                  key={story.id} 
                  to={`/story/${story.id}`}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all border border-transparent hover:border-[#b6dcfe]/50 dark:hover:border-[#b6dcfe]/20"
                >
                  <span className="text-2xl font-black text-pink-200 dark:text-white/20 italic w-8 shrink-0 text-center leading-none">
                    {String(rank).padStart(2, '0')}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="text-sm font-bold text-leaf-900 dark:text-white truncate group-hover:text-[#c2185b] dark:group-hover:text-[#6498fb] transition-colors uppercase font-serif max-w-[120px]">
                        {story.title}
                      </h4>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {story.status === 'Hoàn thành' && (
                          <span className="px-1 py-0.5 rounded-full bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[7px] font-bold uppercase leading-none border border-green-100 dark:border-green-800/50">FULL</span>
                        )}
                        {story.views > 20 && (
                          <span className="px-1 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-[7px] font-bold uppercase leading-none border border-orange-100 dark:border-orange-800/50">HOT</span>
                        )}
                        {isMature && (
                          <span className="px-1 py-0.5 rounded-full bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-[7px] font-bold uppercase leading-none border border-red-100 dark:border-red-800/50">18+</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-leaf-500 dark:text-leaf-400 mt-0 font-medium italic">
                      {new Intl.NumberFormat('vi-VN').format(story.views || 0)} lượt đọc
                    </p>
                  </div>

                  <div className="w-10 h-14 shrink-0 rounded-lg overflow-hidden border border-pink-50 dark:border-white/10 shadow-sm opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all relative">
                    {story.coverUrl ? (
                      <img src={story.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-pink-50 dark:bg-leaf-800" />
                    )}
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`h-1.5 rounded-full transition-all ${
              page === i ? 'w-4 bg-[#c2185b] dark:bg-[#4591fe]' : 'w-1.5 bg-pink-200 dark:bg-[#122138]'
            } border-none`}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
