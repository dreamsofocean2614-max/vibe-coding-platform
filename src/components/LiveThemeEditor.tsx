import React, { useState } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { X, Palette, Type, Image as ImageIcon, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LiveThemeEditor() {
  const { siteTheme: theme, updateSiteTheme: updateTheme, isSuperAdmin } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'logo'>('colors');

  if (!isSuperAdmin) return null;

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] bg-leaf-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
      >
        <Palette className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
          Chỉnh sửa giao diện
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-leaf-900 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[100] border-l border-leaf-200 dark:border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-leaf-200 dark:border-white/10 flex items-center justify-between bg-leaf-50 dark:bg-black/20">
              <h3 className="font-bold flex items-center gap-2 dark:text-white">
                <Palette className="w-5 h-5 text-rose-500" />
                Theme Editor
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-leaf-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-leaf-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider">
              {(['colors', 'fonts', 'logo', 'banners'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 p-3 transition-colors ${activeTab === tab ? 'bg-white dark:bg-leaf-800 text-rose-500 border-b-2 border-rose-500' : 'bg-leaf-50 dark:bg-black/10 text-leaf-500 hover:text-leaf-800 dark:hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-leaf-500 mb-2 uppercase">Màu chủ đạo (Primary)</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={theme.primaryColor} 
                        onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border-none"
                      />
                      <input 
                        type="text" 
                        value={theme.primaryColor}
                        onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                        className="flex-1 bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded px-3 py-1 text-sm dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-leaf-500 mb-2 uppercase">Màu phụ (Secondary)</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={theme.secondaryColor} 
                        onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border-none"
                      />
                      <input 
                        type="text" 
                        value={theme.secondaryColor}
                        onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                        className="flex-1 bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded px-3 py-1 text-sm dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fonts' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-leaf-500 mb-2 uppercase">Font Chữ (Main)</label>
                    <select 
                        value={theme.fontSans}
                        onChange={(e) => updateTheme({ fontSans: e.target.value })}
                        className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded p-2 text-sm dark:text-white"
                    >
                        <option value='"Inter", sans-serif'>Inter (Default)</option>
                        <option value='"Roboto", sans-serif'>Roboto</option>
                        <option value='"Open Sans", sans-serif'>Open Sans</option>
                        <option value='"JetBrains Mono", monospace'>JetBrains Mono</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-leaf-500 mb-2 uppercase">Font Tiêu đề (Serif)</label>
                    <select 
                        value={theme.fontSerif}
                        onChange={(e) => updateTheme({ fontSerif: e.target.value })}
                        className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded p-2 text-sm dark:text-white"
                    >
                        <option value='"Playfair Display", serif'>Playfair Display</option>
                        <option value='"Merriweather", serif'>Merriweather</option>
                        <option value='"Lora", serif'>Lora</option>
                        <option value='"Cormorant Garamond", serif'>Cormorant Garamond</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'logo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-leaf-500 mb-2 uppercase">URL Logo (Sáng)</label>
                    <div className="space-y-2">
                        <textarea 
                            value={theme.logoUrl}
                            onChange={(e) => updateTheme({ logoUrl: e.target.value })}
                            placeholder="Dán link ảnh logo sáng..."
                            className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded p-3 text-sm dark:text-white min-h-[80px]"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-leaf-500 mb-2 uppercase">URL Logo (Tối)</label>
                    <div className="space-y-2">
                        <textarea 
                            value={theme.logoDarkUrl}
                            onChange={(e) => updateTheme({ logoDarkUrl: e.target.value })}
                            placeholder="Dán link ảnh logo tối..."
                            className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded p-3 text-sm dark:text-white min-h-[80px]"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-leaf-500 mb-2 uppercase">Kích thước logo (px)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            min="20" 
                            max="120" 
                            value={theme.logoSize}
                            onChange={(e) => updateTheme({ logoSize: parseInt(e.target.value) })}
                            className="flex-1 accent-rose-500"
                        />
                        <span className="text-sm font-bold text-leaf-800 dark:text-white w-10">{theme.logoSize}px</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === ('banners' as any) && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-bold text-leaf-500 uppercase">URL Banner Sáng</label>
                       {theme.bannerUrl && (
                         <button onClick={() => updateTheme({ bannerUrl: '' })} className="text-[10px] text-red-500 font-bold hover:underline">Xóa Ảnh</button>
                       )}
                    </div>
                    <textarea 
                        value={theme.bannerUrl}
                        onChange={(e) => updateTheme({ bannerUrl: e.target.value })}
                        placeholder="Dán link ảnh banner sáng..."
                        className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded p-3 text-sm dark:text-white min-h-[80px]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-bold text-leaf-500 uppercase">URL Banner Tối</label>
                       {theme.bannerDarkUrl && (
                         <button onClick={() => updateTheme({ bannerDarkUrl: '' })} className="text-[10px] text-red-500 font-bold hover:underline">Xóa Ảnh</button>
                       )}
                    </div>
                    <textarea 
                        value={theme.bannerDarkUrl}
                        onChange={(e) => updateTheme({ bannerDarkUrl: e.target.value })}
                        placeholder="Dán link ảnh banner tối..."
                        className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded p-3 text-sm dark:text-white min-h-[80px]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-bold text-leaf-500 uppercase">Text Banner Trang Chủ</label>
                       {theme.bannerText && (
                         <button onClick={() => updateTheme({ bannerText: '' })} className="text-[10px] text-red-500 font-bold hover:underline">Xóa Text</button>
                       )}
                    </div>
                    <input 
                        type="text"
                        value={theme.bannerText}
                        onChange={(e) => updateTheme({ bannerText: e.target.value })}
                        placeholder="Chào mừng đến với..."
                        className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded p-2 text-sm dark:text-white"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-bold text-leaf-500 uppercase">URL Banner Chương Sáng</label>
                       {theme.chapterBannerUrl && (
                         <button onClick={() => updateTheme({ chapterBannerUrl: '' })} className="text-[10px] text-red-500 font-bold hover:underline">Xóa Ảnh</button>
                       )}
                    </div>
                    <textarea 
                        value={theme.chapterBannerUrl}
                        onChange={(e) => updateTheme({ chapterBannerUrl: e.target.value })}
                        placeholder="Dán link ảnh banner chương sáng..."
                        className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded p-3 text-sm dark:text-white min-h-[80px]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-xs font-bold text-leaf-500 uppercase">URL Banner Chương Tối</label>
                       {theme.chapterBannerDarkUrl && (
                         <button onClick={() => updateTheme({ chapterBannerDarkUrl: '' })} className="text-[10px] text-red-500 font-bold hover:underline">Xóa Ảnh</button>
                       )}
                    </div>
                    <textarea 
                        value={theme.chapterBannerDarkUrl}
                        onChange={(e) => updateTheme({ chapterBannerDarkUrl: e.target.value })}
                        placeholder="Dán link ảnh banner chương tối..."
                        className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded p-3 text-sm dark:text-white min-h-[80px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-leaf-50 dark:bg-black/20 border-t border-leaf-200 dark:border-white/10">
                <p className="text-[10px] text-leaf-500 leading-tight">
                    Thay đổi sẽ được áp dụng trực tiếp cho tất cả người dùng ngay khi bạn lưu.
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
