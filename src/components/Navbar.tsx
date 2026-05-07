import { Link } from 'react-router-dom';
import { BookOpen, Search, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#162019] border-b border-leaf-300 dark:border-[#2a3f31] transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-leaf-800 dark:text-leaf-400 hover:text-leaf-600 dark:hover:text-leaf-200 transition-colors">
          <BookOpen className="w-8 h-8" />
          <div className="hidden sm:flex flex-col">
            <span className="font-serif font-bold text-2xl italic tracking-tight">Dưới Mái Hiên</span>
            <span className="text-[10px] font-medium opacity-70 italic tracking-wider">Mưa dừng sau mái ngói, tình gói trong từng chương.</span>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8 mx-auto pl-8">
          <Link to="/" className="text-sm font-medium text-leaf-950 dark:text-leaf-50 uppercase tracking-widest border-b-2 border-leaf-950 dark:border-leaf-50 pb-1">
            Trang Chủ
          </Link>
          <Link to="/explore" className="text-sm font-medium text-leaf-700 dark:text-leaf-300 uppercase tracking-widest hover:text-leaf-950 dark:hover:text-leaf-50 transition-colors">
            Thể Loại
          </Link>
          <a href="#" className="text-sm font-medium text-leaf-700 dark:text-leaf-300 uppercase tracking-widest hover:text-leaf-950 dark:hover:text-leaf-50 transition-colors">
            Xếp Hạng
          </a>
          <a href="#" className="text-sm font-medium text-leaf-700 dark:text-leaf-300 uppercase tracking-widest hover:text-leaf-950 dark:hover:text-leaf-50 transition-colors">
            Thư Viện
          </a>
        </div>

        <div className="flex-1 lg:flex-none flex items-center justify-end gap-4 sm:gap-6 max-w-md mx-4 lg:mx-0">
          <div className="relative group w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-leaf-500 dark:text-[#6e8573] group-focus-within:text-leaf-800 dark:group-focus-within:text-leaf-400 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="block w-full pl-12 pr-6 py-2 bg-leaf-100 dark:bg-[#1d2b21] dark:text-leaf-100 rounded-full text-sm placeholder-leaf-500 dark:placeholder-[#6e8573] focus:outline-none focus:ring-2 focus:ring-leaf-400 dark:focus:ring-[#3E5242] transition-all border-none"
            />
          </div>
          
          <button onClick={toggleTheme} className="p-2 text-leaf-600 hover:text-leaf-900 dark:text-leaf-400 dark:hover:text-leaf-100 transition-colors rounded-full hover:bg-leaf-100 dark:hover:bg-[#1d2b21]">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button className="hidden sm:flex w-10 h-10 shrink-0 rounded-full bg-leaf-400 dark:bg-leaf-800 items-center justify-center text-white font-bold hover:bg-leaf-800 dark:hover:bg-leaf-950 transition-colors">
            M
          </button>
        </div>
      </div>
    </header>
  );
}
