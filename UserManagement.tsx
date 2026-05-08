import { useEffect, useState } from 'react';
import { ArrowLeft, UserX, Shield } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';

export default function UserManagement() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!isSuperAdmin) return <Navigate to="/admin" />;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!confirm('Xác nhận đổi quyền người dùng này?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      fetchUsers();
    } catch (e) {
      alert('Lỗi: ' + e);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin" className="p-2 hover:bg-leaf-100 dark:hover:bg-leaf-800 rounded-full transition-colors text-leaf-600 dark:text-leaf-300">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-rose-500" />
          <h1 className="text-3xl font-serif font-bold text-leaf-900 dark:text-white">Quản lý Quyền Hạn</h1>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-[#051a3a]/70 backdrop-blur-md border border-leaf-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/50 dark:bg-black/20 text-leaf-700 dark:text-white border-b border-leaf-100 dark:border-white/5">
                <th className="p-6 font-serif font-bold uppercase text-xs tracking-wider">Hồ sơ</th>
                <th className="p-6 font-serif font-bold uppercase text-xs tracking-wider">Email</th>
                <th className="p-6 font-serif font-bold uppercase text-xs tracking-wider">Phân Quyền (Role)</th>
                <th className="p-6 font-serif font-bold uppercase text-xs tracking-wider text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leaf-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-leaf-500 italic">Chưa có người dùng hệ thống.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-rose-50/20 dark:hover:bg-rose-500/5 transition-colors">
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                          <img src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="" className="w-10 h-10 rounded-full border border-rose-100" />
                          <span className="font-bold text-sm text-leaf-900 dark:text-white">{u.displayName || 'Guest'}</span>
                       </div>
                    </td>
                    <td className="p-6 text-sm text-leaf-600 dark:text-leaf-400">{u.email}</td>
                    <td className="p-6 text-sm">
                      <select 
                        value={u.role || 'reader'}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="p-2 rounded-xl border border-leaf-200 dark:border-white/10 bg-white dark:bg-black/40 text-leaf-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                        disabled={u.email === 'dreamsofocean2614@gmail.com'}
                      >
                        <option value="reader">Độc giả (Reader)</option>
                        <option value="editor">Admin đăng truyện (Editor)</option>
                        <option value="super_admin">Super Admin (Toàn quyền)</option>
                      </select>
                    </td>
                    <td className="p-6 text-right">
                      <button className="text-leaf-400 hover:text-rose-500 transition-colors">
                        <UserX className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
