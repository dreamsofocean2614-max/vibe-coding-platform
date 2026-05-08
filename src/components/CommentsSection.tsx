import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType, loginWithGoogle } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, User } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: any;
  userName?: string;
  userPhoto?: string;
}

export default function CommentsSection({ storyId, uploaderId }: { storyId: string, uploaderId?: string }) {
  const { user, isSuperAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canDelete = (commentUserId: string) => {
    if (isSuperAdmin) return true;
    if (user?.uid === commentUserId) return true;
    if (user?.uid === uploaderId) return true;
    return false;
  };

  useEffect(() => {
    if (!storyId) return;
    const q = query(
      collection(db, 'stories', storyId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `stories/${storyId}/comments`);
    });

    return () => unsubscribe();
  }, [storyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    
    try {
      await addDoc(collection(db, 'stories', storyId, 'comments'), {
        userId: user.uid,
        userName: user.displayName || 'Người dùng ẩn danh',
        userPhoto: user.photoURL || '',
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, `stories/${storyId}/comments`);
       alert('Có lỗi, không thể gửi bình luận.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Xóa bình luận này?')) {
      try {
        await deleteDoc(doc(db, 'stories', storyId, 'comments', commentId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `stories/${storyId}/comments/${commentId}`);
        alert('Có lỗi, không thể xóa bình luận.');
      }
    }
  };

  return (
    <section className="bg-white/70 dark:bg-[#051a3a]/70 backdrop-blur-md p-8 rounded-3xl border border-leaf-100 dark:border-white/5 shadow-sm transition-colors mt-12">
      <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-rose-600 dark:text-rose-400 mb-6 flex items-center gap-2">
        Bình Luận Hệ Thống <span className="bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded text-[10px]">{comments.length}</span>
      </h2>

      {!user ? (
        <div className="bg-white/50 dark:bg-[#051a3a]/50 backdrop-blur-sm p-6 rounded-2xl text-center border border-leaf-100 dark:border-white/5">
          <p className="text-leaf-600 dark:text-leaf-300 mb-4 text-sm italic">Vui lòng đăng nhập để bình luận.</p>
          <button onClick={loginWithGoogle} className="px-6 py-2.5 bg-rose-600 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-md">
            Đăng Nhập bằng Google
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex gap-4">
            <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="" className="w-10 h-10 rounded-full border border-rose-100" />
            <div className="flex-1">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập suy nghĩ của bạn..."
                className="w-full px-5 py-4 bg-leaf-50/50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none text-leaf-900 dark:text-leaf-100 resize-none text-sm"
                rows={3}
                required
              ></textarea>
              <div className="flex justify-end mt-3">
                <button disabled={submitting || !newComment.trim()} type="submit" className="px-8 py-2.5 bg-rose-600 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-rose-700 transition-all disabled:opacity-50">
                  {submitting ? 'Đang gửi...' : 'Gửi Bình Luận'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            {comment.userPhoto ? (
              <img src={comment.userPhoto || undefined} alt="" className="w-10 h-10 rounded-full border border-leaf-100" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-leaf-100 dark:bg-white/5 flex items-center justify-center text-leaf-400">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 bg-white/50 dark:bg-[#051a3a]/50 p-5 rounded-3xl rounded-tl-none border border-leaf-100 dark:border-white/5 relative">
               <div className="flex items-center justify-between mb-2">
                 <h4 className="font-bold text-leaf-900 dark:text-white text-sm uppercase tracking-tighter">{comment.userName}</h4>
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] text-leaf-400 font-bold">
                     {comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString('vi-VN') : 'Mới đây'}
                   </span>
                   {canDelete(comment.userId) && (
                     <button onClick={() => handleDelete(comment.id)} className="text-leaf-300 hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                 </div>
               </div>
               <p className="text-leaf-700 dark:text-leaf-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-leaf-500 dark:text-white">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        )}
      </div>
    </section>
  );
}
