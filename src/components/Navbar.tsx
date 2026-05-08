import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, User, Moon, Sun, Shield, X } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { useAuth } from '../lib/AuthContext';
import { loginWithGoogle } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { mode, toggleMode, siteTheme } = useTheme();
  const { user, isSuperAdmin, isEditor, loading } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isSearchOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-[#051a3a]/70 backdrop-blur-md border-b border-leaf-100 dark:border-white/5 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <AnimatePresence mode="wait">
          {!isSearchOpen ? (
            <motion.div 
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center gap-2 text-leaf-800 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-all group">
                {(mode === 'dark' && siteTheme.logoDarkUrl) || (mode === 'light' && siteTheme.logoUrl) || siteTheme.logoUrl ? (
                  <img 
                    src={mode === 'dark' && siteTheme.logoDarkUrl ? siteTheme.logoDarkUrl : siteTheme.logoUrl} 
                    alt="Logo Dưới Mái Hiên" 
                    className="object-contain h-[var(--logo-size-mobile)] md:h-[var(--logo-size)]"
                    style={{ 
                      '--logo-size': `${siteTheme.logoSize}px`,
                      '--logo-size-mobile': `${Math.max(siteTheme.logoSize * 0.7, 24)}px`
                    } as React.CSSProperties}
                  />
                ) : (
                  <>
                    <BookOpen className="w-8 h-8" />
                    <div className="flex flex-col">
                      <span className="font-serif font-bold text-[20px] italic tracking-tight leading-tight" style={{ fontFamily: siteTheme.fontSerif }}>Dưới Mái Hiên</span>
                      <span className="text-[7px] font-medium opacity-70 italic tracking-wider whitespace-nowrap text-left text-rose-500">Mưa dừng sau mái ngói, tình gói trong từng chương.</span>
                    </div>
                  </>
                )}
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
        
        <div className={`hidden ${isSearchOpen ? 'lg:hidden' : 'lg:flex'} items-center gap-8 mx-auto pl-8`}>
          <Link to="/" className="text-rose-600 dark:text-white text-sm font-bold uppercase tracking-widest hover:text-rose-800 transition-colors">
            Trang Chủ
          </Link>
          <Link to="/explore" className="text-sm font-bold text-leaf-600 dark:text-white uppercase tracking-widest hover:text-leaf-950 dark:hover:text-leaf-50 transition-colors">
            Khám Phá
          </Link>
          {isEditor && (
            <Link to="/admin" className="text-sm font-bold text-leaf-600 dark:text-white uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center gap-1 group">
              <Shield className="w-4 h-4 group-hover:text-rose-500" /> {isSuperAdmin ? 'Admin' : 'Tác giả'}
            </Link>
          )}
        </div>

        <div className={`flex items-center justify-end gap-2 sm:gap-4 ${isSearchOpen ? 'flex-1' : ''}`}>
          <div ref={searchContainerRef} className={`relative flex items-center ${isSearchOpen ? 'flex-1 max-w-xl' : ''}`}>
            <AnimatePresence>
              {isSearchOpen && (
                <motion.form 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  onSubmit={handleSearch}
                  className="flex items-center w-full relative"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên truyện, tác giả..."
                    className="w-full h-10 pl-4 pr-10 bg-leaf-50 dark:bg-[#0a2754] border border-leaf-200 dark:border-white/10 rounded-full outline-none focus:ring-2 focus:ring-rose-500/30 dark:focus:ring-[#cce2fb]/30 transition-all text-sm text-leaf-900 dark:text-white placeholder-leaf-400 dark:placeholder-white/30"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-10 p-1 text-leaf-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => isSearchOpen ? handleSearch() : setIsSearchOpen(true)}
              className="p-2 text-[#c2185b] dark:text-[#cce2fb] transition-all rounded-full hover:bg-leaf-100 dark:hover:bg-white/5 active:scale-95"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
          
          {!isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 sm:gap-4"
            >
              <button onClick={toggleMode} className="p-2 text-leaf-600 hover:text-rose-600 dark:text-leaf-400 dark:hover:text-rose-400 transition-colors rounded-full hover:bg-leaf-100 dark:hover:bg-white/5">
                {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {!loading && user ? (
                <Link to="/profile" className="flex items-center gap-2 group">
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.displayName || 'User'} className="w-9 h-9 rounded-full border-2 border-rose-500 dark:border-[#147ad0] shadow-sm transition-transform group-hover:scale-110" />
                  <span className="hidden md:block text-xs font-bold text-leaf-700 dark:text-leaf-300 uppercase tracking-tighter">Hồ sơ</span>
                </Link>
              ) : !loading && (
                <button onClick={loginWithGoogle} className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                  <User className="w-4 h-4" /> <span>Đăng Nhập</span>
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
