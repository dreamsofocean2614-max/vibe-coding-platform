import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChapter, createChapter, updateChapter, getStory, Chapter } from '../../lib/db';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { uploadToImgBB } from '../../lib/imgbb';
import { useAuth } from '../../lib/AuthContext';

export default function EditChapter() {
  const { storyId, chapterId } = useParams<{ storyId: string, chapterId: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(chapterId);
  const { user, isSuperAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Chapter>>({
    chapterNumber: 1,
    title: '',
    content: [],
    isLocked: false,
    shopeeLink: ''
  });
  const [contentString, setContentString] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (storyId) {
      const fetchData = async () => {
        const story = await getStory(storyId);
        if (story) {
           if (!isSuperAdmin && story.uploaderId && story.uploaderId !== user?.uid) {
             alert('Bạn không có quyền chỉnh sửa truyện này!');
             navigate('/admin');
             return;
           }
        }
        
        if (isEditing && chapterId) {
          const chap = await getChapter(storyId, chapterId);
          if (chap) {
            setFormData(chap);
            setContentString(chap.content.join('\n\n'));
          }
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [storyId, chapterId, isEditing, isSuperAdmin, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyId) return;
    setSaving(true);
    
    // Convert content string back to array
    const contentArray = contentString.split('\n\n').filter(p => p.trim() !== '');
    const finalData = { ...formData, content: contentArray };

    try {
      if (isEditing && chapterId) {
        await updateChapter(storyId, chapterId, finalData);
      } else {
        await createChapter(storyId, finalData as Omit<Chapter, 'id' | 'storyId' | 'createdAt' | 'updatedAt'>);
      }
      navigate(`/admin/story/${storyId}/edit`);
    } catch (err) {
      alert('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { default: imageCompression } = await import('browser-image-compression');
      
      const options = {
        maxSizeMB: 0.08, // smaller size
        maxWidthOrHeight: 600,
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

      const filename = `chapters/${Date.now()}_${resizedFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      let url = '';
      try {
        url = await uploadToImgBB(resizedFile);
      } catch (uploadError) {
        console.warn('ImgBB Storage failed, falling back to base64 encoding', uploadError);
        url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => reject('Failed to read file');
          reader.readAsDataURL(resizedFile);
        });
      }
      setContentString(prev => prev + `\n\n[img]${url}[/img]\n\n`);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải ảnh lên.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/admin/story/${storyId}/edit`} className="p-2 bg-white/40 dark:bg-leaf-800/40 rounded-full text-leaf-800 dark:text-leaf-300 hover:bg-leaf-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-serif font-bold text-leaf-900 dark:text-leaf-100">
          {isEditing ? 'Chỉnh Sửa Chương' : 'Thêm Chương Mới'}
        </h1>
      </div>

      <div className="bg-white/70 dark:bg-leaf-900/70 backdrop-blur-md rounded-2xl border border-leaf-200 dark:border-leaf-700 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-leaf-800 dark:text-leaf-300">Chương số</label>
              <input type="number" required min="1" value={formData.chapterNumber} onChange={e => setFormData({...formData, chapterNumber: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white" />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-semibold text-leaf-800 dark:text-leaf-300">Tên Chương</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white" />
            </div>
            
            <div className="col-span-1 md:col-span-2 flex flex-col gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isLocked} onChange={e => setFormData({...formData, isLocked: e.target.checked})} className="w-4 h-4 text-leaf-600 focus:ring-leaf-500 border-gray-300 rounded" />
                <span className="font-semibold text-yellow-800">Khóa chương này</span>
              </label>
              {formData.isLocked && (
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-semibold text-yellow-800 uppercase tracking-wider">Link Shopee Hỗ Trợ</label>
                    <input placeholder="Link Shopee (vd: https://shopee.vn/...)" value={formData.shopeeLink || ''} onChange={e => setFormData({...formData, shopeeLink: e.target.value})} className="w-full px-3 py-2 bg-white border border-yellow-300 rounded-md outline-none text-sm focus:border-yellow-500 transition-colors" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-semibold text-yellow-800 uppercase tracking-wider">Mở khóa cho tài khoản (Email, mỗi email 1 dòng)</label>
                    <textarea placeholder="user1@gmail.com&#10;user2@gmail.com" rows={3} value={formData.unlockedEmails?.join('\n') || ''} onChange={e => setFormData({...formData, unlockedEmails: e.target.value.split('\n').map(email => email.trim()).filter(email => email !== '')})} className="w-full px-3 py-2 bg-white border border-yellow-300 rounded-md outline-none text-sm focus:border-yellow-500 transition-colors" />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-leaf-800 dark:text-leaf-300">Nội Dung Chương (cách nhau bởi 2 lần xuống dòng)</label>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-leaf-100 dark:bg-leaf-800 text-leaf-700 dark:text-leaf-300 rounded-md text-xs font-medium hover:bg-leaf-200 dark:hover:bg-leaf-700 transition"
              >
                <ImageIcon className="w-4 h-4" />
                {uploadingImage ? 'Đang tải...' : 'Chèn Ảnh'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInsertImage} className="hidden" />
            </div>
            <textarea required rows={15} value={contentString} onChange={e => setContentString(e.target.value)} className="w-full px-4 py-2 bg-white/50 dark:bg-leaf-900/50 backdrop-blur-sm border border-leaf-200 dark:border-leaf-600 rounded-lg focus:ring-2 focus:ring-leaf-400 outline-none text-leaf-900 dark:text-white font-serif leading-relaxed"></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-leaf-100 dark:border-leaf-700">
             <button disabled={saving} type="submit" className="flex items-center gap-2 px-6 py-2 bg-leaf-800 dark:bg-leaf-600 text-white rounded-lg hover:bg-leaf-950 transition-colors font-semibold disabled:opacity-50">
               <Save className="w-5 h-5" /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
             </button>
          </div>
        </form>
      </div>
    </main>
  );
}
