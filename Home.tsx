import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStories, Story, PaginatedStories } from '../lib/db';
import { useTheme } from '../lib/ThemeContext';
import CoverflowCarousel from '../components/CoverflowCarousel';
import TrendingRanking from '../components/TrendingRanking';
import StorySliderSection from '../components/StorySliderSection';

export default function Home() {
  const { siteTheme, mode } = useTheme();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStories(30).then(data => {
      const result = data as PaginatedStories;
      setStories(result.stories || []);
      setLoading(false);
    });
  }, []);

  const featuredStory = stories[0];
  const recentlyUpdated = stories.slice(0, 15);
  const completedStories = stories.filter(story => story.status === 'Hoàn thành').slice(0, 15);

  const newReleases = [...stories].sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
    return timeB - timeA;
  }).slice(0, 8);

  if (loading) return <div className="min-h-screen p-8 text-center bg-transparent">Đang tải...</div>;
  if (!featuredStory) return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center text-leaf-600 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm relative overflow-hidden">
      <div className="z-10 relative bg-white/70 dark:bg-leaf-900/70 p-8 rounded-3xl backdrop-blur-md shadow-xl border border-leaf-200 dark:border-leaf-800">
        <h2 className="text-2xl font-serif font-bold text-leaf-900 dark:text-leaf-50 mb-2">Thư viện trống</h2>
        <p>Chưa có truyện nào trong thư viện.</p>
      </div>
    </div>
  );

  return (
    <main className="max-w-[1400px] mx-auto flex flex-col p-4 md:p-10 overflow-hidden min-h-screen">
      {/* Dynamic Banner */}
      <div className="w-full mb-8 rounded-2xl overflow-hidden shadow-sm">
        {(mode === 'dark' && siteTheme.bannerDarkUrl) || siteTheme.bannerUrl ? (
          <img 
            src={mode === 'dark' && siteTheme.bannerDarkUrl ? siteTheme.bannerDarkUrl : siteTheme.bannerUrl} 
            alt="Banner" 
            className="w-full h-auto block" 
          />
        ) : (
          <div className="w-full py-2 px-6 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-center">
            <p className="text-[18px] font-serif font-bold italic text-leaf-700 dark:text-leaf-300">
               {siteTheme.bannerText}
            </p>
          </div>
        )}
      </div>

      {/* New Releases - Redesigned with 3D Coverflow */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 flex flex-col pt-8">
          <div className="flex items-center mb-4">
            <h2 className="text-[22px] font-serif font-bold text-[#c2185b] dark:text-[#cce2fb] relative">
              Truyện Mới Phát Hành
              <span className="absolute -bottom-1.5 left-0 w-[40px] h-[3px] bg-[#c2185b] dark:bg-[#cce2fb] rounded-full"></span>
            </h2>
          </div>
          
          {newReleases.length > 0 && (
            <div className="rounded-[40px] overflow-hidden bg-white/30 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/5 shadow-xl">
              <CoverflowCarousel stories={newReleases} />
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <TrendingRanking stories={stories} />
        </div>
      </section>


      {/* Category Sections: Ngôn Tình & Đam Mỹ */}
      <div className="flex flex-col pb-12">
        {[
          { title: 'Ngôn Tình', filters: ['Ngôn Tình', 'Ngôn Tình 🔞'], accent: 'bg-pink-500' },
          { title: 'Đam Mỹ', filters: ['Đam Mỹ', 'Đam Mỹ 🔞'], accent: 'bg-indigo-500' },
        ].map(section => {
          const sectionStories = stories.filter(s => 
            s.categories?.some(c => section.filters.includes(c.name))
          ).slice(0, 15);

          if (sectionStories.length === 0) return null;

          return (
            <StorySliderSection 
              key={section.title}
              title={section.title}
              stories={sectionStories}
              accentColor={section.accent}
              viewAllLink="/explore"
            />
          );
        })}


        {/* Recently Updated Section */}
        <StorySliderSection 
          title="Truyện mới cập nhật"
          stories={recentlyUpdated}
          accentColor="bg-leaf-500"
          viewAllLink="/explore"
        />

        {/* Completed Stories Section */}
        <StorySliderSection 
          title="Truyện hoàn"
          stories={completedStories}
          accentColor="bg-[#10b981]"
          viewAllLink="/explore"
        />
      </div>
    </main>
  );
}
