import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface AgeWarningProps {
  onConfirm: () => void;
}

export default function AgeWarning({ onConfirm }: AgeWarningProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_-12px_rgba(244,63,94,0.3)] dark:shadow-[0_0_60px_-10px_rgba(244,63,94,0.4)] border border-rose-100 dark:border-rose-500/30 ring-1 ring-white/10 transform transition-all duration-500 scale-100 hover:scale-[1.01]">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/20 animate-pulse">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-[#990647] dark:text-rose-100 mb-4 tracking-tight">Cảnh Báo Độ Tuổi (18+)</h2>
        
        <div className="space-y-4 mb-8">
          <p className="text-leaf-700 dark:text-slate-200 font-medium text-sm leading-relaxed">
            Truyện này có gắn nhãn <span className="inline-block px-2 py-0.5 bg-rose-50 dark:bg-rose-500/30 text-[#a8083d] dark:text-rose-300 border border-rose-200 dark:border-rose-500/50 rounded font-bold text-xs">18+</span> và có thể chứa các nội dung nhạy cảm, bạo lực hoặc không phù hợp với người dưới 18 tuổi.
          </p>
          <p className="text-leaf-600 dark:text-slate-400 italic text-xs px-4">
            Tác giả/dịch giả sẽ không chịu bất cứ trách nhiệm nào nếu bạn cố tình đọc khi chưa đủ tuổi.
          </p>
        </div>

        <div className={`flex items-start gap-4 text-left mb-8 p-5 rounded-2xl border transition-all duration-300 group cursor-pointer ${
          isChecked 
            ? 'bg-rose-50/50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/40 shadow-inner' 
            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-rose-400/50'
        }`} onClick={() => setIsChecked(!isChecked)}>
          <div className="relative flex items-center mt-0.5">
            <input 
              type="checkbox" 
              id="age-confirm" 
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                setIsChecked(e.target.checked);
              }}
              className="w-6 h-6 rounded-lg border-slate-300 dark:border-slate-600 text-rose-500 focus:ring-rose-500 dark:bg-slate-700 cursor-pointer transition-colors"
            />
          </div>
          <label htmlFor="age-confirm" className={`text-sm leading-snug font-medium cursor-pointer select-none transition-colors ${
            isChecked ? 'text-leaf-950 dark:text-rose-50' : 'text-leaf-700 dark:text-slate-300'
          }`}>
            Tôi xác nhận bản thân đã đủ 18 tuổi và đồng ý chịu mọi trách nhiệm khi xem nội dung này.
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            disabled={!isChecked}
            className={`w-full font-bold py-4 px-8 rounded-full transition-all duration-300 transform active:scale-95 shadow-xl ${
              isChecked 
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-500/40' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed grayscale'
            }`}
          >
            Đưa tôi vào truyện
          </button>
          
          <Link 
            to="/"
            className="w-full py-4 px-8 rounded-full font-bold text-leaf-800 dark:text-slate-400 hover:text-leaf-950 dark:hover:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Quay lại trang chủ an toàn
          </Link>
        </div>
      </div>
    </div>
  );
}
