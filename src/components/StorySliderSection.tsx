import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Story } from '../lib/db';

interface StorySliderSectionProps {
  title: string;
  stories: Story[];
  accentColor?: string;
  viewAllLink?: string;
}

export default function StorySliderSection({ title, stories, accentColor = 'bg-pink-500', viewAllLink = '/' }: StorySliderSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [stories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const card = container.children[0] as HTMLElement;
      if (card) {
        const cardWidth = card.offsetWidth + 24; // width + gap (24px for gap-6)
        const scrollAmount = cardWidth * 2;
        container.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <section className="w-full flex flex-col pt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[22px] font-serif font-bold text-[#c2185b] dark:text-[#cce2fb] relative">
            {title}
            <span className="absolute -bottom-1.5 left-0 w-[40px] h-[3px] bg-[#c2185b] dark:bg-[#cce2fb] rounded-full"></span>
          </h2>
        </div>

        <Link to={viewAllLink} className="text-sm font-bold text-[#c2185b] hover:text-rose-700 dark:text-[#6a9fda] dark:hover:text-[#a8cbf4] transition-colors flex items-center gap-1">
           Xem tất cả <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className="relative group/slider pt-2">
        {/* Navigation Buttons - Positioned Absolutely at the sides */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#052352] text-rose-600 dark:text-white shadow-xl transition-all border border-pink-100 dark:border-white/10
            ${canScrollLeft ? 'opacity-100 hover:scale-110' : 'opacity-30 cursor-not-allowed scale-95'}
          `}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="grid grid-flow-col auto-cols-[min(100%,400px)] md:auto-cols-[calc(50%-12px)] lg:auto-cols-[calc(33.333%-16px)] gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory relative z-10"
        >
          {stories.map(story => {
            const isMature = story.categories?.some(c => c.name.includes('🔞'));
            const isFull = story.status === 'Hoàn thành';
            
            return (
              <Link 
                to={`/story/${story.id}`} 
                key={story.id} 
                className="bg-white/50 dark:bg-[#052352]/50 hover:bg-white dark:hover:bg-[#052352] backdrop-blur-sm border border-leaf-200 dark:border-white/10 rounded-2xl p-4 flex gap-4 transition-all group shadow-sm hover:shadow-md h-full snap-start"
              >
                <div className="w-16 h-24 sm:w-20 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-leaf-100 dark:bg-leaf-800 border border-leaf-200 dark:border-white/10 relative text-left">
                  {story.coverUrl ? (
                    <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-white/40 dark:bg-leaf-800/40" />
                  )}
                </div>
                <div className="flex flex-col flex-1 justify-center min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <h4 className="font-bold text-leaf-900 dark:text-white text-[15px] truncate group-hover:text-leaf-700 dark:group-hover:text-[#6a9fda] transition-colors uppercase font-serif tracking-tight">{story.title}</h4>
                    
                    <div className="flex gap-1 flex-shrink-0">
                      {isFull && (
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
                  <div className="text-leaf-600 dark:text-[#dcebfa]/70 text-[13px] mt-0.5 space-y-1 text-left">
                    <p className="truncate">Chương {story.chapterCount || 0}</p>
                    <p className="truncate font-medium text-leaf-500">Tác giả: {story.author}</p>
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <p className="text-[11px] text-leaf-400 dark:text-leaf-500 font-medium italic">
                      {new Intl.NumberFormat('vi-VN').format(story.views || 0)} lượt đọc
                    </p>
                    <p className="text-[10px] text-leaf-500 dark:text-leaf-400 font-medium italic hidden md:block">
                       {story.updatedAt ? new Date(story.updatedAt.toMillis ? story.updatedAt.toMillis() : story.updatedAt).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#052352] text-rose-600 dark:text-white shadow-xl transition-all border border-pink-100 dark:border-white/10
            ${canScrollRight ? 'opacity-100 hover:scale-110' : 'opacity-30 cursor-not-allowed scale-95'}
          `}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
