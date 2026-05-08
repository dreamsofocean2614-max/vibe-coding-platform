import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStory, createStory, updateStory, getChapters, deleteChapter, Story, Chapter, CATEGORIES } from '../../lib/db';
import { ArrowLeft, Save, Plus, Edit, Trash2, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { uploadToImgBB } from '../../lib/imgbb';
import { useAuth } from '../../lib/AuthContext';

export default function EditStory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { user, isSuperAdmin } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [formData, setFormData] = useState<Partial<Story>>({
    title: '',
    author: '',
    editor: '',
    synopsis: '',
    coverUrl: '',
    status: 'Đang ra',
    categories: []
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const fetchData = async () => {
        const story = await getStory(id);
        if (story) {
           if (!isSuperAdmin && story.uploaderId && story.uploaderId !== user?.uid) {
             alert('Bạn không có quyền chỉnh sửa truyện này!');
             navigate('/admin');
             return;
           }
           setFormData(story);
        }
        const chaps = await getChapters(id);
        setChapters(chaps);
        setLoading(false);
      };
      fetchData();
    }
  }, [id, isEditing, isSuperAdmin, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && id) {
        await updateStory(id, formData);
        alert('Cập nhật thành công!');
      } else {
        const createData = { ...formData, uploaderId: user?.uid };
        const newId = await createStory(createData as Omit<Story, 'id' | 'chapterCount' | 'views' | 'rating' | 'ratingCount' | 'createdAt' | 'updatedAt'>);
        if (newId) navigate(`/admin/story/${newId}/edit`);
      }
    } catch (err) {
      alert('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show immediate local preview
    const localUrl = URL.createObjectURL(file);
    setFormData({ ...formData, coverUrl: localUrl });

    setUploadingImage(true);
    try {
      const { default: imageCompression } = await import('browser-image-compression');
      
      const options = {
        maxSizeMB: 0.05, // very aggressive
        maxWidthOrHeight: 480,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.6,
      };
      
      let resizedFile = file;
      try {
        resizedFile = await imageCompression(file, options);
      } catch (e) {
        console.warn("Compression failed, using original file", e);
      }

      // Create a unique filename
      const filename = `covers/${Date.now()}_${resizedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      let url = '';
      
      try {
        // Try ImgBB first
        url = await uploadToImgBB(resizedFile);
      } catch (uploadError) {
        console.warn('ImgBB upload failed, falling back to base64 encoding', uploadError);
        // Fallback: use base64 of the already resized image
        url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => reject('Failed to read file');
          reader.readAsDataURL(resizedFile);
        });
      }
      
      setFormData({ ...formData, coverUrl: url });
    } catch (err) {
      console.error(err);
      alert('Lỗi tải ảnh lên.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
     if (confirm('Xóa chương này?') && id) {
       await deleteChapter(id, chapterId);
       setChapters(chapters.filter(c => c.id !== chapterId));
     }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin" className="p-2 bg-white/40 dark:bg-leaf-800/40 rounded-full text-leaf-800 dark:text-leaf-300 hover:bg-leaf-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-serif font-bold text-leaf-900 dark:text-white">
          {isEditing ? 'Chỉnh Sửa Truyện' : 'Thêm Truyện Mới'}
        </h1>
      </div>

      <div className="bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md rounded-2xl border border-leaf-200 dark:border-leaf-700 p-6 shadow-sm mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-2 border-white/70 dark:border-white/70 p-6 rounded-2xl">
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-leaf-800 dark:text-white">Tên Truyện</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white" />
            </div>
             <div className="space-y-2">
              <label className="text-[15px] font-bold text-leaf-800 dark:text-white">Tác Giả</label>
              <input required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full px-4 py-2 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-leaf-800 dark:text-white">Dịch Giả / Editor</label>
              <input value={formData.editor || ''} onChange={e => setFormData({...formData, editor: e.target.value})} className="w-full px-4 py-2 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[15px] font-bold text-leaf-800 dark:text-white">Ảnh Bìa</label>
                <div className="flex bg-white/40 dark:bg-leaf-800/40 p-1 rounded-lg">
                  <button 
                    type="button" 
                    onClick={() => setImageMode('url')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${imageMode === 'url' ? 'bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md text-leaf-800 dark:text-leaf-200 shadow-sm' : 'text-leaf-500 dark:text-leaf-400 hover:text-leaf-700'}`}
                  >
                    <LinkIcon className="w-3 h-3" /> URL
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${imageMode === 'upload' ? 'bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md text-leaf-800 dark:text-leaf-200 shadow-sm' : 'text-[#cddbeb] hover:opacity-80'}`}
                  >
                    <Upload className="w-3 h-3" /> Tải lên
                  </button>
                </div>
              </div>
              
              {imageMode === 'url' ? (
                <input required={!formData.coverUrl} value={formData.coverUrl || ''} onChange={e => setFormData({...formData, coverUrl: e.target.value})} placeholder="Nhập đường dẫn ảnh..." className="w-full px-4 py-2 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white placeholder-leaf-300 dark:placeholder-leaf-500" />
              ) : (
                <div className="border-2 border-dashed border-leaf-200 dark:border-leaf-600 rounded-xl p-4 text-center bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm hover:bg-leaf-100 dark:hover:bg-leaf-700 transition-colors cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  {uploadingImage ? (
                    <div className="py-4 text-leaf-500 dark:text-leaf-400 font-medium animate-pulse">
                      Đang xử lý ảnh...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2 text-leaf-500 dark:text-leaf-400">
                      {formData.coverUrl ? (
                         <div className="w-16 h-24 rounded-md overflow-hidden border border-leaf-200 dark:border-leaf-600">
                           <img src={formData.coverUrl} className="w-full h-full object-cover" alt="Cover preview" />
                         </div>
                      ) : (
                        <ImageIcon className="w-8 h-8 text-leaf-300 dark:text-leaf-500" />
                      )}
                      <span className="text-sm font-medium">{formData.coverUrl ? 'Nhấn để đổi ảnh khác' : 'Chọn ảnh từ thiết bị'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[16px] font-bold text-leaf-800 dark:text-white">Trạng Thái</label>
               <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white">
                 <option value="Đang ra">Đang ra</option>
                 <option value="Hoàn thành">Hoàn thành</option>
                 <option value="Tạm dừng">Tạm dừng</option>
               </select>
            </div>
          </div>
          
          <div className="space-y-2">
             <label className="text-[15px] font-bold text-leaf-800 dark:text-white">Thể Loại (Chọn 1 hoặc nhiều)</label>
             <div className="flex flex-wrap gap-2">
               {CATEGORIES.map(cat => {
                 const isSelected = formData.categories?.some(c => c.id === cat.id);
                 return (
                   <button 
                     type="button"
                     key={cat.id}
                     onClick={() => {
                       const cats = formData.categories || [];
                       if (isSelected) setFormData({...formData, categories: cats.filter(c => c.id !== cat.id)});
                       else setFormData({...formData, categories: [...cats, cat]});
                     }}
                     className={`px-3 py-1 text-xs rounded-full border ${isSelected ? 'bg-leaf-800 text-white border-leaf-800 dark:bg-leaf-700 dark:border-leaf-700' : 'bg-transparent text-leaf-700 border-leaf-300 dark:text-[#3e7fd3] dark:border-leaf-500'}`}
                   >
                     {cat.name}
                   </button>
                 );
               })}
               
               {/* Custom categories */}
               {formData.categories?.filter(c => !CATEGORIES.some(cat => cat.id === c.id)).map(customCat => (
                 <button 
                     type="button"
                     key={customCat.id}
                     onClick={() => {
                        setFormData({...formData, categories: formData.categories?.filter(c => c.id !== customCat.id)});
                     }}
                     className="px-3 py-1 text-xs rounded-full border bg-leaf-800 text-white border-leaf-800 dark:bg-leaf-700 dark:border-leaf-700 flex items-center gap-1 hover:bg-red-500 hover:border-red-500 transition-colors"
                     title="Nhấn để xóa"
                 >
                     {customCat.name} ✕
                 </button>
               ))}
             </div>
             
             <div className="flex gap-2 max-w-sm mt-3">
                <input 
                  type="text" 
                  value={customCategoryInput} 
                  onChange={e => setCustomCategoryInput(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (customCategoryInput.trim()) {
                        const newCat = { id: `custom_${Date.now()}`, name: customCategoryInput.trim() };
                        setFormData({...formData, categories: [...(formData.categories || []), newCat]});
                        setCustomCategoryInput('');
                      }
                    }
                  }}
                  placeholder="Thêm thể loại mới..." 
                  className="px-3 py-1.5 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white text-sm flex-1"
                />
                <button 
                  type="button" 
                  onClick={() => {
                    if (customCategoryInput.trim()) {
                      const newCat = { id: `custom_${Date.now()}`, name: customCategoryInput.trim() };
                      setFormData({...formData, categories: [...(formData.categories || []), newCat]});
                      setCustomCategoryInput('');
                    }
                  }}
                  className="px-4 py-1.5 bg-leaf-200 dark:bg-leaf-700 text-white font-semibold text-sm rounded-lg hover:bg-leaf-300 transition-colors"
                >Thêm Mới</button>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[15px] font-bold text-leaf-800 dark:text-white">Văn Án / Nội Dung</label>
            <textarea required rows={6} value={formData.synopsis} onChange={e => setFormData({...formData, synopsis: e.target.value})} className="w-full px-4 py-2 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white"></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-leaf-100 dark:border-leaf-700">
             <button disabled={saving} type="submit" className="flex items-center gap-2 px-6 py-2 bg-leaf-800 dark:bg-leaf-600 text-white rounded-lg hover:bg-leaf-950 transition-colors font-semibold disabled:opacity-50">
               <Save className="w-5 h-5" /> {saving ? 'Đang lưu...' : (isEditing ? 'Lưu Thay Đổi' : 'Tạo Truyện')}
             </button>
          </div>
        </form>
      </div>

      {isEditing && (
        <div className="bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md rounded-2xl border border-leaf-200 dark:border-leaf-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-leaf-900 dark:text-white">Danh Sách Chương</h2>
            <div className="flex gap-2">
              <Link to={`/admin/story/${id}/chapter/bulk`} className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-lg font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50">
                 <Plus className="w-4 h-4" /> Thêm Nhiều Chương
              </Link>
              <Link to={`/admin/story/${id}/chapter/new`} className="flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-[#016ece] text-leaf-800 dark:text-white rounded-lg font-medium hover:bg-leaf-200 dark:hover:bg-[#016ece]/80">
                 <Plus className="w-4 h-4" /> Thêm Chương
              </Link>
            </div>
          </div>
          <div className="divide-y divide-leaf-100 dark:divide-leaf-700">
            {chapters.length === 0 ? (
               <div className="text-center py-6 text-leaf-500">Chưa có chương nào.</div>
            ) : (
              chapters.map(chap => (
                <div key={chap.id} className="py-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-leaf-800 dark:text-leaf-400 mr-4">Chương {chap.chapterNumber}</span>
                    <span className="text-leaf-900 dark:text-leaf-100 font-medium">{chap.title}</span>
                    {chap.isLocked && <span className="ml-3 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full uppercase font-bold">Đã Khóa</span>}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/admin/story/${id}/chapter/${chap.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDeleteChapter(chap.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}
