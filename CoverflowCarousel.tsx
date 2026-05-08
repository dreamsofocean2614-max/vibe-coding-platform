import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Story } from '../lib/db';

interface CoverflowCarouselProps {
  stories: Story[];
}

export default function CoverflowCarousel({ stories }: CoverflowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  }, [stories.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  }, [stories.length]);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered]);

  if (!stories.length) return null;

  // Calculate visible indices for the carousel
  const getVisibleIndices = () => {
    const indices = [];
    // Mobile: 3, Tablet/Small Laptop: 5, Large Desktop: 7
    let count = 3;
    if (windowWidth >= 1280) {
      count = 7;
    } else if (windowWidth >= 768) {
      count = 5;
    }

    const half = Math.floor(count / 2);
    
    for (let i = -half; i <= half; i++) {
        const index = (currentIndex + i + stories.length) % stories.length;
        indices.push({ index, offset: i });
    }
    return indices;
  };

  return (
    <div 
      className="relative w-full h-[350px] md:h-[500px] flex items-center justify-center overflow-hidden perspective-[1200px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient & Animated Petals */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50/50 to-transparent dark:from-[#052352]/20 dark:to-transparent z-0 pointer-events-none">
        {/* Subtle internal petals for the carousel section */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-pink-400/40 dark:bg-pink-400/10 rounded-full"
            initial={{ 
              x: Math.random() * 1000, 
              y: Math.random() * 500,
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50],
              x: [null, Math.random() * 100 - 50],
              opacity: [0, 0.6, 0],
              rotate: [0, 180]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
            style={{ width: 10, height: 12, borderRadius: '60% 0 60% 0' }}
          />
        ))}
      </div>

      {/* Carousel Container */}
      <div className="relative w-full max-w-6xl h-full flex items-center justify-center py-10">
        <AnimatePresence initial={false}>
          {getVisibleIndices().map(({ index, offset }) => {
            const story = stories[index];
            const isActive = offset === 0;
            const absOffset = Math.abs(offset);
            const isMature = story.categories?.some(c => c.name.includes('🔞'));
            
            // Adjust x spacing based on screen size to fit more cards
            const xOffset = windowWidth < 768 ? 80 : (windowWidth < 1280 ? 160 : 180);
            
            return (
              <motion.div
                key={`${story.id}-${offset}`}
                initial={{ opacity: 0, x: offset * 100, scale: 0.8, rotateY: offset * 45 }}
                animate={{
                  opacity: 1 - (absOffset * 0.25),
                  x: offset * xOffset,
                  scale: 1 - (absOffset * 0.15),
                  rotateY: offset * -45,
                  z: -absOffset * 150,
                  zIndex: 10 - absOffset,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8
                }}
                className="absolute w-[160px] md:w-[240px] aspect-[2/3] cursor-pointer preserve-3d"
                onClick={() => {
                  if (isActive) return;
                  setCurrentIndex(index);
                }}
              >
                <Link to={`/story/${story.id}`} onClick={(e) => !isActive && e.preventDefault()} className="block w-full h-full relative">
                  <div className={`
                    relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500
                    ${isActive ? 'ring-4 ring-pink-400/30 dark:ring-[#6a9fda]/30 shadow-pink-500/20 dark:shadow-[#6a9fda]/40' : 'brightness-75'}
                    border border-white/20 dark:border-white/5
                  `}>
                    {story.coverUrl ? (
                      <img 
                        src={story.coverUrl} 
                        alt={story.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-200 to-pink-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                        <span className="text-xs text-pink-700 dark:text-slate-400 font-medium px-4 text-center">{story.title}</span>
                      </div>
                    )}
                    
                    {/* Glassy reflection/overlay for active card */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-10 z-20 pointer-events-none">
        <button 
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-lg flex items-center justify-center text-pink-600 dark:text-[#6a9fda] hover:bg-white dark:hover:bg-black transition-all pointer-events-auto group active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-lg flex items-center justify-center text-pink-600 dark:text-[#6a9fda] hover:bg-white dark:hover:bg-black transition-all pointer-events-auto group active:scale-95"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom pagination dots */}
      <div className="absolute bottom-4 flex gap-1.5 z-20">
        {stories.slice(0, 8).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex % 8 ? 'w-6 bg-pink-500 dark:bg-[#6a9fda]' : 'w-1.5 bg-pink-200 dark:bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
