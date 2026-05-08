import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '../lib/db';
import { useAuth } from '../lib/AuthContext';
import { Facebook, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  const { isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<SiteSettings>({});

  useEffect(() => {
    getSiteSettings().then(data => {
      setSettings(data);
      setEditForm(data);
    });
  }, []);

  const handleSave = async () => {
    await updateSiteSettings(editForm);
    setSettings(editForm);
    setIsEditing(false);
  };

  return (
    <footer className="w-full bg-white dark:bg-[#051a3a] text-leaf-900 dark:text-white border-t border-leaf-100 dark:border-white/5 mt-auto py-12 px-6 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        {/* Left Side */}
        <div className="md:w-1/2">
          <h2 className="text-2xl font-serif font-bold text-rose-600 dark:text-[#82adeb] mb-4 tracking-tighter uppercase">Dưới Mái Hiên</h2>
          <p className="text-xs text-leaf-600 dark:text-[#7ba1cd] dark:font-normal leading-relaxed italic block mb-6 opacity-80">
            *Đa số thông tin và hình ảnh trên website đều được sưu tầm từ các nguồn trên Internet. 
            Website hay upload-er không sở hữu hay chịu trách nhiệm bất kỳ thông tin nào trên đây. 
            Nếu làm ảnh hưởng đến cá nhân hay tổ chức nào, khi được yêu cầu, chúng tôi sẽ xem xét và gỡ bỏ ngay lập tức.
          </p>
          <div className="flex flex-wrap gap-6 mt-2 mb-6 md:mb-0">
            <Link to="/tos" className="text-[10px] uppercase tracking-widest text-leaf-500 hover:text-rose-500 dark:text-leaf-400 transition-colors font-bold">Điều khoản</Link>
            <Link to="/privacy" className="text-[10px] uppercase tracking-widest text-leaf-500 hover:text-rose-500 dark:text-leaf-400 transition-colors font-bold">Bảo mật</Link>
            <Link to="/about" className="text-[10px] uppercase tracking-widest text-leaf-500 hover:text-rose-500 dark:text-leaf-400 transition-colors font-bold">Giới thiệu</Link>
          </div>
        </div>

        {/* Right Side - Social Links */}
        <div className="md:w-1/3">
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 text-leaf-400 dark:text-leaf-500">Liên Kết Kết Nối</h3>
          
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <input 
                type="text" placeholder="Facebook Link" 
                value={editForm.facebookLink || ''} onChange={e => setEditForm({...editForm, facebookLink: e.target.value})}
                className="px-4 py-3 text-sm rounded-xl bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 text-leaf-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <input 
                type="text" placeholder="TikTok Link" 
                value={editForm.tiktokLink || ''} onChange={e => setEditForm({...editForm, tiktokLink: e.target.value})}
                className="px-4 py-3 text-sm rounded-xl bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 text-leaf-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <input 
                type="text" placeholder="YouTube Link" 
                value={editForm.youtubeLink || ''} onChange={e => setEditForm({...editForm, youtubeLink: e.target.value})}
                className="px-4 py-3 text-sm rounded-xl bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 text-leaf-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <input 
                type="text" placeholder="Gmail Address" 
                value={editForm.gmailAddress || ''} onChange={e => setEditForm({...editForm, gmailAddress: e.target.value})}
                className="px-4 py-3 text-sm rounded-xl bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 text-leaf-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={handleSave} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase transition-colors shadow-lg shadow-rose-600/20">Lưu</button>
                <button onClick={() => { setIsEditing(false); setEditForm(settings); }} className="bg-leaf-100 dark:bg-white/5 text-leaf-700 dark:text-white px-6 py-2 rounded-xl text-xs font-bold uppercase transition-colors hover:bg-leaf-200">Hủy</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {settings.facebookLink && (
                <a href={settings.facebookLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-leaf-700 dark:text-leaf-300 hover:text-rose-500 transition-colors group">
                  <div className="p-2 bg-leaf-50 dark:bg-white/5 rounded-lg group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20"><Facebook size={18} /></div>
                  <span className="text-sm font-medium">Facebook Social</span>
                </a>
              )}
              {settings.tiktokLink && (
                <a href={settings.tiktokLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-leaf-700 dark:text-leaf-300 hover:text-rose-500 transition-colors group">
                  <div className="p-2 bg-leaf-50 dark:bg-white/5 rounded-lg group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                  </div>
                  <span className="text-sm font-medium">TikTok Channel</span>
                </a>
              )}
              {settings.youtubeLink && (
                <a href={settings.youtubeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-leaf-700 dark:text-leaf-300 hover:text-rose-500 transition-colors group">
                  <div className="p-2 bg-leaf-50 dark:bg-white/5 rounded-lg group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20"><Youtube size={18} /></div>
                  <span className="text-sm font-medium">YouTube Studio</span>
                </a>
              )}
              {settings.gmailAddress && (
                <a href={`mailto:${settings.gmailAddress}`} className="flex items-center gap-3 text-leaf-700 dark:text-leaf-300 hover:text-rose-500 transition-colors group">
                  <div className="p-2 bg-leaf-50 dark:bg-white/5 rounded-lg group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20"><Mail size={18} /></div>
                  <span className="text-sm font-medium">{settings.gmailAddress}</span>
                </a>
              )}
              
              {isSuperAdmin && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="mt-6 px-6 py-2.5 bg-leaf-800 dark:bg-[#02428f] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest w-fit hover:bg-black dark:hover:bg-[#02428f]/80 transition-all shadow-md"
                >
                  Sửa Thông Tin Liên Hệ
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
