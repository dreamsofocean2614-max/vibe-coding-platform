import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getLegalPage, updateLegalPage, LegalPage as LegalPageType } from '../lib/db';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import ReactMarkdown from 'react-markdown';
import { Save, Edit2, X, Type, Palette } from 'lucide-react';

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isSuperAdmin } = useAuth();
  const { mode } = useTheme();
  const [page, setPage] = useState<LegalPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LegalPageType>>({});

  useEffect(() => {
    if (slug) {
      setLoading(true);
      getLegalPage(slug).then(data => {
        if (data) {
          setPage(data);
          setEditForm(data);
        } else {
          // Default data for new pages
          const defaultData: LegalPageType = {
            id: slug,
            title: slug === 'privacy-policy' ? 'Chính Sách Bảo Mật' : 'Điều Khoản Sử Dụng',
            content: '# ' + (slug === 'privacy-policy' ? 'Chính Sách Bảo Mật' : 'Điều Khoản Sử Dụng') + '\n\nNội dung đang được cập nhật...',
            updatedAt: new Date()
          };
          setPage(defaultData);
          setEditForm(defaultData);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  const handleSave = async () => {
    if (slug) {
      await updateLegalPage(slug, editForm);
      setPage({ ...page!, ...editForm });
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-leaf-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const fontFamilies = [
    { name: 'Sans Serif (Mặc định)', value: 'var(--font-sans)' },
    { name: 'Serif (Truyện)', value: 'var(--font-serif)' },
    { name: 'Monospace', value: 'monospace' },
    { name: 'System UI', value: 'system-ui' }
  ];

  return (
    <>
      <Helmet>
        <title>{page?.title} - Dưới Mái Hiên</title>
      </Helmet>
      
      <main className="max-w-4xl mx-auto w-full px-6 py-12 relative z-10">
        <div className="bg-white dark:bg-[#051a3a] border border-leaf-100 dark:border-white/5 rounded-3xl shadow-xl overflow-hidden p-8 md:p-12 transition-colors">
          {isSuperAdmin && (
            <div className="flex justify-end mb-10">
              {isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 text-xs font-bold uppercase tracking-widest"
                  >
                    <Save size={16} /> Lưu thay đổi
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setEditForm(page!); }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-leaf-100 dark:bg-white/5 text-leaf-800 dark:text-white rounded-xl hover:bg-leaf-200 transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    <X size={16} /> Hủy
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-leaf-100 dark:bg-white/5 text-leaf-800 dark:text-white rounded-xl hover:bg-leaf-200 transition-colors text-xs font-bold uppercase tracking-widest shadow-sm"
                >
                  <Edit2 size={16} /> Chỉnh sửa trang
                </button>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-leaf-700 dark:text-leaf-300 mb-2">Tiêu đề</label>
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-leaf-50 dark:bg-white/5 border border-leaf-200 dark:border-white/10 text-leaf-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-leaf-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-leaf-700 dark:text-leaf-300 mb-2 flex items-center gap-2">
                    <Type size={16} /> Font chữ
                  </label>
                  <select 
                    value={editForm.fontFamily || ''} 
                    onChange={e => setEditForm({...editForm, fontFamily: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-leaf-50 dark:bg-white/5 border border-leaf-200 dark:border-white/10 text-leaf-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  >
                    <option value="">Mặc định hệ thống</option>
                    {fontFamilies.map(font => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-leaf-700 dark:text-leaf-300 mb-2 flex items-center gap-2">
                    <Palette size={16} /> Màu chữ
                  </label>
                  <input 
                    type="color" 
                    value={editForm.textColor || (mode === 'dark' ? '#ffffff' : '#000000')} 
                    onChange={e => setEditForm({...editForm, textColor: e.target.value})}
                    className="w-full h-11 p-1 rounded-lg bg-leaf-50 dark:bg-white/5 border border-leaf-200 dark:border-white/10 cursor-pointer"
                  />
                  <button 
                    onClick={() => setEditForm({...editForm, textColor: undefined})}
                    className="mt-2 text-xs text-leaf-500 hover:text-leaf-700"
                  >
                    Xóa màu (Dùng mặc định)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-leaf-700 dark:text-leaf-300 mb-2">Nội dung (Markdown)</label>
                <textarea 
                  rows={20}
                  value={editForm.content} 
                  onChange={e => setEditForm({...editForm, content: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-leaf-50 dark:bg-white/5 border border-leaf-200 dark:border-white/10 text-leaf-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  placeholder="Hỗ trợ Markdown: # H1, ## H2, **Bold**, etc."
                />
              </div>
            </div>
          ) : (
            <div 
              className="prose dark:prose-invert max-w-none" 
              style={{ 
                fontFamily: page?.fontFamily || 'inherit',
                color: mode === 'dark' ? '#ffffff' : (page?.textColor || 'inherit')
              }}
            >
              <ReactMarkdown>{page?.content || ''}</ReactMarkdown>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
