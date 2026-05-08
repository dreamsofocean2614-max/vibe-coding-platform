import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createChapter, getStory } from '../../lib/db';
import { ArrowLeft, Save, SplitSquareHorizontal, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { Chapter } from '../../lib/db';

type ParsedChapter = Partial<Chapter> & {
  unlockedEmailsText?: string;
};

export default function BulkAddChapters() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();

  const [rawText, setRawText] = useState('');
  const [parsedChapters, setParsedChapters] = useState<ParsedChapter[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleParse = () => {
    setIsParsing(true);
    // Simple parser: split by "Chương X" or "Chapter X"
    // We look for a line that starts with "Chương" or "Chapter" followed by a number
    const regex = /(?:^|\n)\s*(?:Chương|Chapter)\s+(\d+)[^:\n]*:?\s*([^\n]*)/gi;
    
    // This approach: split the text using the regex
    // Since split with capture groups includes the captured parts in the resulting array:
    // "text before".split(/(Chapter (\d+))/) -> ["text before", "Chapter 1", "1", "\ncontent..."]
    
    // Better approach, find all matches and get their indices
    const matches = [];
    let match;
    while ((match = regex.exec(rawText)) !== null) {
      matches.push({
        index: match.index,
        chapterStr: match[0],
        number: parseInt(match[1]),
        titleFallback: match[2].trim() || `Chương ${match[1]}`
      });
    }

    if (matches.length === 0) {
      alert("Không tìm thấy dấu hiệu bắt đầu chương (VD: 'Chương 1: Tiêu đề' hoặc 'Chương 1').");
      setIsParsing(false);
      return;
    }

    const newParsedChapters: ParsedChapter[] = [];
    
    for (let i = 0; i < matches.length; i++) {
      const startContentIndex = matches[i].index + matches[i].chapterStr.length;
      const endContentIndex = i + 1 < matches.length ? matches[i+1].index : rawText.length;
      
      const contentRaw = rawText.substring(startContentIndex, endContentIndex).trim();
      const contentArray = contentRaw.split('\n\n').map(p => p.trim()).filter(p => p !== '');
      
      newParsedChapters.push({
        chapterNumber: matches[i].number,
        title: matches[i].titleFallback,
        content: contentArray,
        isLocked: false,
      });
    }

    setParsedChapters(newParsedChapters);
    setIsParsing(false);
  };

  const handleSaveAll = async () => {
    if (!storyId || parsedChapters.length === 0) return;
    setSaving(true);
    setProgress(0);

    try {
      for (let i = 0; i < parsedChapters.length; i++) {
        const chap = parsedChapters[i];
        
        const emails = (chap.unlockedEmailsText || '')
          .split('\n')
          .map(e => e.trim())
          .filter(e => e);

        const finalData = {
          chapterNumber: chap.chapterNumber || (i + 1),
          title: chap.title || `Chương ${chap.chapterNumber || i + 1}`,
          content: chap.content || [],
          isLocked: chap.isLocked || false,
          shopeeLink: chap.isLocked ? chap.shopeeLink : undefined,
          unlockedEmails: chap.isLocked ? emails : undefined
        };

        await createChapter(storyId, finalData as Omit<Chapter, 'id' | 'storyId' | 'createdAt' | 'updatedAt'>);
        setProgress(((i + 1) / parsedChapters.length) * 100);
      }
      alert('Đăng hàng loạt thành công!');
      navigate(`/admin/story/${storyId}/edit`);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi lưu một số chương.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/admin/story/${storyId}/edit`} className="p-2 bg-white/40 dark:bg-leaf-800/40 rounded-full text-leaf-800 dark:text-leaf-300 hover:bg-leaf-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-serif font-bold text-leaf-900 dark:text-leaf-100">
          Thêm Nhiều Chương Cùng Lúc
        </h1>
      </div>

      <div className="bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md rounded-2xl border border-leaf-200 dark:border-leaf-700 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-leaf-900 dark:text-white mb-4">1. Dán nội dung các chương vào đây</h2>
        <p className="text-sm text-leaf-700 dark:text-leaf-300 mb-4">
          Hệ thống sẽ tự động tự tách chương dựa vào từ khóa (VD: <span className="font-semibold text-rose-500">Chương 1</span>, <span className="font-semibold text-rose-500">Chương 2: Tiêu đề</span>). Các đoạn văn cách nhau bằng 1 dòng trống (Enter 2 lần).
        </p>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white font-serif"
          placeholder="Chương 1: Gặp gỡ&#10;Nội dung chương 1...&#10;&#10;Chương 2: Thử thách&#10;Nội dung chương 2..."
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleParse}
            disabled={!rawText.trim() || isParsing}
            className="flex items-center gap-2 px-6 py-2 bg-leaf-800 dark:bg-leaf-600 text-white rounded-lg hover:bg-leaf-950 transition-colors font-semibold disabled:opacity-50"
          >
            <SplitSquareHorizontal className="w-5 h-5" /> Tách Chương
          </button>
        </div>
      </div>

      {parsedChapters.length > 0 && (
        <div className="bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md rounded-2xl border border-leaf-200 dark:border-leaf-700 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-leaf-900 dark:text-white mb-4">
            2. Kiểm tra lại và đăng ({parsedChapters.length} Chương)
          </h2>
          
          <div className="max-h-[600px] overflow-y-auto mb-6 space-y-4 pr-2 custom-scrollbar">
            {parsedChapters.map((chap, idx) => (
              <div key={idx} className="flex flex-col gap-3 p-4 bg-white/50 dark:bg-leaf-800/30 rounded-xl border border-leaf-100 dark:border-leaf-700">
                <div className="flex gap-4 items-start">
                  <div className="w-24 shrink-0">
                    <label className="text-xs font-bold text-leaf-500">Chương số</label>
                    <input
                      type="number"
                      value={chap.chapterNumber || ''}
                      onChange={(e) => {
                        const newChaps = [...parsedChapters];
                        newChaps[idx].chapterNumber = parseInt(e.target.value);
                        setParsedChapters(newChaps);
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-white dark:bg-slate-800 border border-leaf-200 dark:border-leaf-600 rounded mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-leaf-500">Tiêu đề</label>
                    <input
                      value={chap.title || ''}
                      onChange={(e) => {
                        const newChaps = [...parsedChapters];
                        newChaps[idx].title = e.target.value;
                        setParsedChapters(newChaps);
                      }}
                      className="w-full px-2 py-1.5 text-sm bg-white dark:bg-slate-800 border border-leaf-200 dark:border-leaf-600 rounded mt-1 font-medium"
                    />
                    <div className="text-xs text-leaf-400 mt-1">Độ dài: {chap.content?.length || 0} đoạn văn</div>
                  </div>
                  <button 
                    onClick={() => {
                      const newChaps = [...parsedChapters];
                      newChaps.splice(idx, 1);
                      setParsedChapters(newChaps);
                    }}
                    className="mt-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center"
                    title="Xóa chương này"
                  >
                    Xóa
                  </button>
                </div>

                <div className="mt-2 pt-3 border-t border-leaf-200/50 dark:border-leaf-700/50">
                  <label className="flex items-center gap-2 cursor-pointer mb-2 w-max text-sm group">
                    <input 
                      type="checkbox" 
                      checked={chap.isLocked || false} 
                      onChange={(e) => {
                        const newChaps = [...parsedChapters];
                        newChaps[idx].isLocked = e.target.checked;
                        setParsedChapters(newChaps);
                      }} 
                      className="w-4 h-4 text-rose-500 focus:ring-rose-500 border-gray-300 rounded cursor-pointer" 
                    />
                    <span className="font-semibold text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 flex items-center gap-1.5">
                      {chap.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />} Khóa chương này
                    </span>
                  </label>
                  
                  {chap.isLocked && (
                    <div className="flex flex-col md:flex-row gap-4 mt-3 bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
                      <div className="flex-[2] space-y-1.5">
                        <label className="text-xs font-semibold text-rose-800 dark:text-rose-400 uppercase tracking-wide">Link Shopee</label>
                        <input 
                          placeholder="vd: https://shopee.vn/..." 
                          value={chap.shopeeLink || ''} 
                          onChange={(e) => {
                            const newChaps = [...parsedChapters];
                            newChaps[idx].shopeeLink = e.target.value;
                            setParsedChapters(newChaps);
                          }} 
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-lg outline-none focus:border-rose-500 transition-colors" 
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-semibold text-rose-800 dark:text-rose-400 uppercase tracking-wide">Email truy cập</label>
                        <textarea 
                          rows={2}
                          placeholder="Mỗi email 1 dòng"
                          value={chap.unlockedEmailsText || ''} 
                          onChange={(e) => {
                            const newChaps = [...parsedChapters];
                            newChaps[idx].unlockedEmailsText = e.target.value;
                            setParsedChapters(newChaps);
                          }} 
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-lg outline-none focus:border-rose-500 transition-colors custom-scrollbar" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-leaf-200 dark:border-leaf-700">
            <div className="flex-1 mr-4">
              {saving && (
                <div className="w-full bg-leaf-100 dark:bg-leaf-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#016ece] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </div>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#016ece] text-white rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {saving ? `Đang lưu (${Math.round(progress)}%)` : 'Lưu Tất Cả Các Chương'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
