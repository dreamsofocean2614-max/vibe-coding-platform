import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getStories, deleteStory, updateStory, Story, getActivityLogs, ActivityLog, PaginatedStories } from '../../lib/db';
import { Plus, Edit, Trash2, EyeOff, Eye, Users, Settings, Upload, Image as ImageIcon, X, History, BarChart3, TrendingUp, BookOpen, Clock, Shield } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useTheme } from '../../lib/ThemeContext';
import { uploadToImgBB } from '../../lib/imgbb';

export default function AdminDashboard() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const { user, isSuperAdmin } = useAuth();
  const { siteTheme, updateSiteTheme } = useTheme();
  
  const [showSettings, setShowSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState<'light' | 'dark' | 'banner' | 'banner_dark' | 'chapter_banner' | 'chapter_banner_dark' | null>(null);
  const lightLogoRef = useRef<HTMLInputElement>(null);
  const darkLogoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const bannerDarkRef = useRef<HTMLInputElement>(null);
  const chapterBannerRef = useRef<HTMLInputElement>(null);
  const chapterBannerDarkRef = useRef<HTMLInputElement>(null);
 
  const fetchStories = async () => {
    setLoading(true);
    const data = await getStories(100);
    const result = data as PaginatedStories;
    const storiesArray = result.stories || [];

    if (isSuperAdmin) {
      setStories(storiesArray);
      getActivityLogs().then(setLogs);
    } else {
      setStories(storiesArray.filter(story => story.uploaderId === user?.uid));
    }
    setLoading(false);
  };
 
  useEffect(() => {
    fetchStories();
  }, [isSuperAdmin, user]);
 
  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa truyện này?')) {
      await deleteStory(id);
      fetchStories();
    }
  };
 
  const handleToggleHidden = async (story: Story) => {
    await updateStory(story.id, { isHidden: !story.isHidden });
    fetchStories();
  };
 
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'light' | 'dark' | 'banner' | 'banner_dark' | 'chapter_banner' | 'chapter_banner_dark') => {
    const file = e.target.files?.[0];
    if (!file || !isSuperAdmin) return;
 
    setUploadingLogo(target);
    try {
      const { default: imageCompression } = await import('browser-image-compression');
      const options = {
        maxSizeMB: target.includes('banner') ? 0.3 : 0.1,
        maxWidthOrHeight: target.includes('banner') ? 1400 : 800,
        useWebWorker: true,
        fileType: 'image/webp' as any,
      };
      
      const compressedFile = await imageCompression(file, options);
      const url = await uploadToImgBB(compressedFile);
      
      if (target === 'light') {
        await updateSiteTheme({ logoUrl: url });
      } else if (target === 'dark') {
        await updateSiteTheme({ logoDarkUrl: url });
      } else if (target === 'banner') {
        await updateSiteTheme({ bannerUrl: url });
      } else if (target === 'banner_dark') {
        await updateSiteTheme({ bannerDarkUrl: url });
      } else if (target === 'chapter_banner') {
        await updateSiteTheme({ chapterBannerUrl: url });
      } else if (target === 'chapter_banner_dark') {
        await updateSiteTheme({ chapterBannerDarkUrl: url });
      }
      
      alert('Tải ảnh lên thành công!');
    } catch (error) {
      console.error(error);
      alert('Lỗi tải ảnh lên.');
    } finally {
      setUploadingLogo(null);
      if (lightLogoRef.current) lightLogoRef.current.value = '';
      if (darkLogoRef.current) darkLogoRef.current.value = '';
      if (bannerRef.current) bannerRef.current.value = '';
      if (bannerDarkRef.current) bannerDarkRef.current.value = '';
      if (chapterBannerRef.current) chapterBannerRef.current.value = '';
      if (chapterBannerDarkRef.current) chapterBannerDarkRef.current.value = '';
    }
  };

  const totalViews = stories.reduce((acc, s) => acc + (s.views || 0), 0);
  const totalChapters = stories.reduce((acc, s) => acc + (s.chapterCount || 0), 0);
  const activeStories = stories.filter(s => s.status === 'Đang ra').length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-leaf-900 dark:text-white tracking-tighter uppercase">Trung Tâm Điều Hành</h1>
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Shield className="w-4 h-4" /> {isSuperAdmin ? 'Site Super Admin' : `Tác giả: ${user?.displayName || 'Editor'}`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {isSuperAdmin && (
            <>
              <Link to="/admin/users" className="flex items-center gap-2 px-6 py-3 bg-leaf-100 dark:bg-white/5 text-leaf-900 dark:text-white rounded-2xl hover:bg-leaf-200 transition-all font-bold uppercase text-[10px] tracking-widest shadow-sm">
                <Users className="w-5 h-5 text-rose-500" /> Nhân Sự
              </Link>
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-bold uppercase text-[10px] tracking-widest shadow-sm ${showSettings ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-leaf-100 dark:bg-white/5 text-leaf-900 dark:text-white hover:bg-leaf-200'}`}
              >
                <Settings className="w-5 h-5" /> Giao Diện
              </button>
            </>
          )}
          <Link to="/admin/story/new" className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-rose-600/30">
            <Plus className="w-5 h-5" /> Sáng Tác Mới
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white dark:bg-[#051a3a] p-6 rounded-3xl border border-leaf-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-500"><BarChart3 size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-leaf-400 uppercase tracking-widest">Tổng Lượt Đọc</p>
              <p className="text-2xl font-serif font-bold text-leaf-900 dark:text-white">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#051a3a] p-6 rounded-3xl border border-leaf-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-leaf-50 dark:bg-leaf-800/20 rounded-2xl text-leaf-500"><BookOpen size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-leaf-400 uppercase tracking-widest">Số Tác Phẩm</p>
              <p className="text-2xl font-serif font-bold text-leaf-900 dark:text-white">{stories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#051a3a] p-6 rounded-3xl border border-leaf-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-500"><TrendingUp size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-leaf-400 uppercase tracking-widest">Đang Phát Hành</p>
              <p className="text-2xl font-serif font-bold text-leaf-900 dark:text-white">{activeStories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#051a3a] p-6 rounded-3xl border border-leaf-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-500"><Clock size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-leaf-400 uppercase tracking-widest">Tổng Số Chương</p>
              <p className="text-2xl font-serif font-bold text-leaf-900 dark:text-white">{totalChapters}</p>
            </div>
          </div>
        </div>
      </div>

      {isSuperAdmin && showSettings && (
        <div className="mb-12 p-8 bg-white/70 dark:bg-[#051a3a]/70 backdrop-blur-md border border-leaf-100 dark:border-white/5 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 transition-colors">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-leaf-100 dark:border-white/5">
            <h2 className="text-xl font-serif font-bold text-leaf-900 dark:text-white uppercase tracking-tighter italic">Cài đặt Logo & Banner Hệ thống</h2>
            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-leaf-100 dark:hover:bg-white/5 rounded-full transition-colors text-leaf-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Light Logo */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-leaf-400 uppercase tracking-widest">Logo Nền Sáng</label>
              <div className="flex flex-col gap-4">
                <div className="p-6 border-2 border-dashed border-leaf-100 dark:border-white/5 rounded-2xl flex items-center justify-center bg-white min-h-[140px]">
                  {siteTheme.logoUrl ? (
                    <img src={siteTheme.logoUrl} alt="Preview Light" style={{ height: `${siteTheme.logoSize}px` }} className="object-contain" />
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-leaf-300 italic">Chưa có logo sáng</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    disabled={!!uploadingLogo}
                    onClick={() => lightLogoRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all text-xs font-bold uppercase tracking-widest shadow-md shadow-rose-600/10 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" /> {uploadingLogo === 'light' ? 'Đang tải...' : 'Tải Logo Sáng'}
                  </button>
                  <input ref={lightLogoRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'light')} className="hidden" />
                  {siteTheme.logoUrl && (
                    <button onClick={() => updateSiteTheme({ logoUrl: '' })} className="text-[10px] text-red-500 hover:underline font-bold uppercase tracking-widest py-1">Xóa logo sáng</button>
                  )}
                </div>
              </div>
            </div>

            {/* Dark Logo */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-leaf-400 uppercase tracking-widest">Logo Nền Tối</label>
              <div className="flex flex-col gap-4">
                <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center bg-[#051a3a] min-h-[140px]">
                  {siteTheme.logoDarkUrl ? (
                    <img src={siteTheme.logoDarkUrl} alt="Preview Dark" style={{ height: `${siteTheme.logoSize}px` }} className="object-contain" />
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-leaf-500 italic">Chưa có logo tối</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    disabled={!!uploadingLogo}
                    onClick={() => darkLogoRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-leaf-100 dark:bg-white/5 text-leaf-800 dark:text-white rounded-xl hover:bg-leaf-200 transition-all text-xs font-bold uppercase tracking-widest shadow-sm disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" /> {uploadingLogo === 'dark' ? 'Đang tải...' : 'Tải Logo Tối'}
                  </button>
                  <input ref={darkLogoRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'dark')} className="hidden" />
                  {siteTheme.logoDarkUrl && (
                    <button onClick={() => updateSiteTheme({ logoDarkUrl: '' })} className="text-[10px] text-red-400 hover:underline font-bold uppercase tracking-widest py-1">Xóa logo tối</button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Logo Size Control */}
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-leaf-400 uppercase tracking-widest mb-4">Kích thước Logo ({siteTheme.logoSize}px)</label>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  value={siteTheme.logoSize} 
                  onChange={(e) => updateSiteTheme({ logoSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-leaf-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-leaf-500 mt-2 uppercase font-bold">
                  <span>20px</span>
                  <span>120px</span>
                </div>
              </div>

              <div className="bg-leaf-50/50 dark:bg-black/10 p-5 rounded-2xl border border-leaf-100 dark:border-white/5">
                <h3 className="text-[10px] font-bold text-leaf-400 mb-4 uppercase tracking-widest">Mock Header Preview</h3>
                <div className="space-y-4">
                  <div className="h-14 bg-white border border-leaf-100 rounded-xl flex items-center px-4 shadow-sm">
                    {siteTheme.logoUrl || siteTheme.logoDarkUrl ? (
                      <img src={siteTheme.logoUrl || siteTheme.logoDarkUrl} alt="L" style={{ height: `${siteTheme.logoSize/2}px` }} className="object-contain" />
                    ) : <span className="text-[10px] text-gray-400 italic">Mặc định</span>}
                  </div>
                  <div className="h-14 bg-[#051a3a] border border-white/5 rounded-xl flex items-center px-4 shadow-sm">
                    {(siteTheme.logoDarkUrl || siteTheme.logoUrl) ? (
                      <img src={siteTheme.logoDarkUrl || siteTheme.logoUrl} alt="D" style={{ height: `${siteTheme.logoSize/2}px` }} className="object-contain" />
                    ) : <span className="text-[10px] text-gray-500 italic">Mặc định</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-leaf-100 dark:border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Banner Home */}
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-leaf-50 dark:bg-white/5 p-4 rounded-2xl mb-4">
                 <h3 className="text-xs font-bold text-leaf-800 dark:text-white uppercase tracking-widest">Banner Trang Chủ</h3>
                 <ImageIcon size={16} className="text-rose-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-leaf-400 uppercase tracking-widest flex items-center justify-between">Sáng {siteTheme.bannerUrl && <button onClick={() => updateSiteTheme({ bannerUrl: '' })} className="text-red-500 lowercase hover:underline">xóa</button>}</label>
                    <div className="relative group rounded-2xl overflow-hidden aspect-video bg-white border border-leaf-100 flex items-center justify-center">
                       {siteTheme.bannerUrl ? (
                         <>
                           <img src={siteTheme.bannerUrl} alt="B" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => bannerRef.current?.click()} className="p-2 bg-white rounded-full text-rose-600"><Upload size={18}/></button>
                           </div>
                         </>
                       ) : (
                         <button onClick={() => bannerRef.current?.click()} className="flex flex-col items-center gap-2 text-leaf-300 hover:text-rose-500 transition-colors">
                           <Upload size={24} /> <span className="text-[10px] font-bold uppercase">Tải lên</span>
                         </button>
                       )}
                       <input ref={bannerRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-leaf-400 uppercase tracking-widest flex items-center justify-between">Tối {siteTheme.bannerDarkUrl && <button onClick={() => updateSiteTheme({ bannerDarkUrl: '' })} className="text-red-400 lowercase hover:underline">xóa</button>}</label>
                    <div className="relative group rounded-2xl overflow-hidden aspect-video bg-black/20 border border-white/10 flex items-center justify-center">
                       {siteTheme.bannerDarkUrl ? (
                         <>
                           <img src={siteTheme.bannerDarkUrl} alt="BD" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => bannerDarkRef.current?.click()} className="p-2 bg-rose-600 rounded-full text-white"><Upload size={18}/></button>
                           </div>
                         </>
                       ) : (
                         <button onClick={() => bannerDarkRef.current?.click()} className="flex flex-col items-center gap-2 text-leaf-500 hover:text-rose-400 transition-colors">
                           <Upload size={24} /> <span className="text-[10px] font-bold uppercase">Tải lên</span>
                         </button>
                       )}
                       <input ref={bannerDarkRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner_dark')} className="hidden" />
                    </div>
                 </div>
              </div>

              <div className="pt-4">
                <label className="block text-[10px] font-bold text-leaf-400 uppercase mb-3 tracking-widest">Slogan Thay Thế Ảnh</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={siteTheme.bannerText} 
                    onChange={(e) => updateSiteTheme({ bannerText: e.target.value })}
                    className="flex-1 px-5 py-3 bg-leaf-50/50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                    placeholder="VD: Mưa dừng sau mái ngói..."
                  />
                  {siteTheme.bannerText && <button onClick={() => updateSiteTheme({ bannerText: '' })} className="px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl text-xs font-bold uppercase">Xóa</button>}
                </div>
              </div>
            </div>

            {/* Banner Chapter */}
            <div className="space-y-6">
               <div className="flex justify-between items-center bg-leaf-50 dark:bg-white/5 p-4 rounded-2xl mb-4">
                 <h3 className="text-xs font-bold text-leaf-800 dark:text-white uppercase tracking-widest">Banner Khi Đọc Chương</h3>
                 <ImageIcon size={16} className="text-rose-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-leaf-400 uppercase tracking-widest flex items-center justify-between">Sáng {siteTheme.chapterBannerUrl && <button onClick={() => updateSiteTheme({ chapterBannerUrl: '' })} className="text-red-500 lowercase hover:underline">xóa</button>}</label>
                    <div className="relative group rounded-2xl overflow-hidden aspect-video bg-white border border-leaf-100 flex items-center justify-center">
                       {siteTheme.chapterBannerUrl ? (
                         <>
                           <img src={siteTheme.chapterBannerUrl} alt="CB" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => chapterBannerRef.current?.click()} className="p-2 bg-white rounded-full text-rose-600"><Upload size={18}/></button>
                           </div>
                         </>
                       ) : (
                         <button onClick={() => chapterBannerRef.current?.click()} className="flex flex-col items-center gap-2 text-leaf-300 hover:text-rose-500 transition-colors">
                           <Upload size={24} /> <span className="text-[10px] font-bold uppercase">Tải lên</span>
                         </button>
                       )}
                       <input ref={chapterBannerRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'chapter_banner')} className="hidden" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-leaf-400 uppercase tracking-widest flex items-center justify-between">Tối {siteTheme.chapterBannerDarkUrl && <button onClick={() => updateSiteTheme({ chapterBannerDarkUrl: '' })} className="text-red-400 lowercase hover:underline">xóa</button>}</label>
                    <div className="relative group rounded-2xl overflow-hidden aspect-video bg-black/20 border border-white/10 flex items-center justify-center">
                       {siteTheme.chapterBannerDarkUrl ? (
                         <>
                           <img src={siteTheme.chapterBannerDarkUrl} alt="CBD" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => chapterBannerDarkRef.current?.click()} className="p-2 bg-rose-600 rounded-full text-white"><Upload size={18}/></button>
                           </div>
                         </>
                       ) : (
                         <button onClick={() => chapterBannerDarkRef.current?.click()} className="flex flex-col items-center gap-2 text-leaf-500 hover:text-rose-400 transition-colors">
                           <Upload size={24} /> <span className="text-[10px] font-bold uppercase">Tải lên</span>
                         </button>
                       )}
                       <input ref={chapterBannerDarkRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'chapter_banner_dark')} className="hidden" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Management + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#051a3a] border border-leaf-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm transition-colors h-full flex flex-col">
            <div className="p-6 border-b border-leaf-100 dark:border-white/5 flex items-center justify-between bg-leaf-50/30 dark:bg-black/5">
              <h3 className="text-sm font-bold text-leaf-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                 <BookOpen size={16} className="text-rose-500" /> Quản Lý Tác Phẩm
              </h3>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-leaf-50/50 dark:bg-black/10 text-[10px] font-bold uppercase tracking-widest text-leaf-500 border-b border-leaf-100 dark:border-white/5">
                    <th className="p-4 font-bold">Tác Phẩm</th>
                    <th className="p-4 font-bold">Thông Số</th>
                    <th className="p-4 font-bold">Trạng Thái</th>
                    <th className="p-4 font-bold text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-leaf-100 dark:divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-leaf-400 italic text-sm">Đang truy xuất dữ liệu...</td>
                    </tr>
                  ) : stories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-leaf-400 italic text-sm">Chưa có tác phẩm nào do bạn quản lý.</td>
                    </tr>
                  ) : (
                    stories.map(story => (
                      <tr key={story.id} className="hover:bg-leaf-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                                {story.coverUrl ? (
                                  <img src={story.coverUrl} alt={story.title} className="w-10 h-14 object-cover rounded-lg shadow-sm border border-leaf-100 dark:border-white/10 group-hover:scale-105 transition-transform" />
                                ) : (
                                  <div className="w-10 h-14 bg-leaf-100 dark:bg-white/5 rounded-lg border border-leaf-200 dark:border-white/10" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-leaf-900 dark:text-white text-sm line-clamp-1">{story.title}</p>
                                <p className="text-[10px] text-leaf-400 uppercase tracking-widest mt-1 font-bold">{story.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                           <div className="space-y-1.5 font-bold">
                               <p className="text-xs text-leaf-600 dark:text-leaf-400 flex items-center gap-1.5"><Eye size={12} className="text-rose-500" /> {story.views || 0}</p>
                               <p className="text-[10px] text-leaf-400 uppercase tracking-tighter flex items-center gap-1.5"><BookOpen size={12} /> {story.chapterCount || 0} Chương</p>
                           </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`px-2.5 py-1 text-[8px] uppercase tracking-widest font-bold rounded-lg w-fit ${story.status === 'Hoàn thành' ? 'bg-green-100 text-green-700 dark:bg-green-900/40' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40'}`}>
                              {story.status}
                            </span>
                            {story.isHidden && <span className="px-2.5 py-1 text-[8px] uppercase tracking-widest font-bold rounded-lg bg-gray-100 text-gray-500 dark:bg-white/5 w-fit">Đã ẩn</span>}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleToggleHidden(story)} className="p-2 text-leaf-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all" title={story.isHidden ? 'Hiện truyện' : 'Ẩn truyện'}>
                              {story.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <Link to={`/admin/story/${story.id}/edit`} className="p-2 text-leaf-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                              <Edit size={16} />
                            </Link>
                            <button onClick={() => handleDelete(story.id)} className="p-2 text-leaf-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Logs for Super Admin */}
        <div className="lg:col-span-1">
           <div className="bg-white dark:bg-[#051a3a] border border-leaf-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
              <div className="p-6 border-b border-leaf-100 dark:border-white/5 flex items-center gap-2 bg-leaf-50/30 dark:bg-black/5">
                 <History size={16} className="text-rose-500" />
                 <h3 className="text-sm font-bold text-leaf-900 dark:text-white uppercase tracking-widest">Ghi Chép Hoạt Động</h3>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[700px] p-6 scrollbar-thin scrollbar-thumb-rose-200 dark:scrollbar-thumb-rose-900">
                 {!isSuperAdmin ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                       <Shield size={32} className="text-leaf-100" />
                       <p className="text-xs text-leaf-400 italic">Tính năng nhật ký chỉ dành cho cấp độ Super Admin.</p>
                    </div>
                 ) : logs.length === 0 ? (
                    <p className="text-xs text-leaf-400 text-center italic mt-4">Chưa có bản ghi hoạt động nào.</p>
                 ) : (
                    <div className="space-y-6">
                       {logs.map(log => (
                          <div key={log.id} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-rose-500 before:rounded-full before:z-10 bg-leaf-50/40 dark:bg-black/20 p-4 rounded-2xl border border-leaf-100 dark:border-white/5 hover:border-rose-200 transition-colors">
                             <div className="flex justify-between items-start mb-2">
                               <p className="text-xs font-bold text-leaf-900 dark:text-white">{log.userName}</p>
                               <p className="text-[9px] text-leaf-400 uppercase tracking-tighter font-bold flex items-center gap-1">
                                  <Clock size={10} /> {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString('vi-VN') : 'Vừa xong'}
                               </p>
                             </div>
                             <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold tracking-tight">{log.action}</p>
                             <p className="text-[10px] text-leaf-500 mt-2 font-serif italic truncate">{log.targetName}</p>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
