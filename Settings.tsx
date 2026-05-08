import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { Save, Lock, Mail, Type, CheckCircle2, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [pseudonym, setPseudonym] = useState(profile?.pseudonym || '');
  const [fontSize, setFontSize] = useState(profile?.readingPreferences?.fontSize || 18);
  const [fontFamily, setFontFamily] = useState(profile?.readingPreferences?.fontFamily || 'serif');
  
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user || !profile) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        pseudonym,
        readingPreferences: {
          fontSize,
          fontFamily
        }
      });
      setMessage({ text: 'Cập nhật hồ sơ thành công!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Lỗi cập nhật hồ sơ.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setMessage({ text: 'Vui lòng nhập mật khẩu hiện tại để thay đổi thông tin xác thực.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      if (newPassword) {
        await updatePassword(user, newPassword);
      }
      
      setMessage({ text: 'Cập nhật tài khoản thành công!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      console.error(error);
      setMessage({ text: `Lỗi: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl">
          <SettingsIcon size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-leaf-900 dark:text-white">Cài đặt tài khoản</h1>
          <p className="text-leaf-500 text-sm">Quản lý thông tin cá nhân và tùy chỉnh trải nghiệm đọc.</p>
        </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-8 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30'}`}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-[#051a3a] p-8 rounded-3xl shadow-sm border border-leaf-100 dark:border-white/5">
          <h2 className="text-xl font-serif font-bold text-leaf-900 dark:text-white mb-6 flex items-center gap-2">
            <Type className="text-rose-500" /> Tùy chỉnh cá nhân
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-leaf-500 uppercase mb-1">Tên hiển thị</label>
              <input 
                type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            {profile.role === 'editor' && (
              <div>
                <label className="block text-xs font-bold text-leaf-500 uppercase mb-1">Bút danh (Editor)</label>
                <input 
                  type="text" value={pseudonym} onChange={e => setPseudonym(e.target.value)}
                  className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-leaf-500 uppercase mb-1">Cỡ chữ mặc định</label>
                <input 
                  type="number" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))}
                  className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-leaf-500 uppercase mb-1">Font chữ</label>
                <select 
                  value={fontFamily} onChange={e => setFontFamily(e.target.value)}
                  className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="serif">Có chân (Serif)</option>
                  <option value="sans">Không chân (Sans)</option>
                  <option value="mono">Đơn điệu (Mono)</option>
                </select>
              </div>
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} /> {loading ? 'Đang lưu...' : 'Lưu tùy chỉnh'}
            </button>
          </form>
        </div>

        {/* Account Security */}
        <div className="bg-white dark:bg-[#051a3a] p-8 rounded-3xl shadow-sm border border-leaf-100 dark:border-white/5">
          <h2 className="text-xl font-serif font-bold text-leaf-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock className="text-rose-500" /> Bảo mật & Tài khoản
          </h2>
          <form onSubmit={handleUpdateAccount} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-leaf-500 uppercase mb-1 flex items-center gap-1">
                <Mail size={12} /> Email đăng nhập
              </label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-leaf-500 uppercase mb-1">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
              <input 
                type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-leaf-50 dark:bg-black/20 border border-leaf-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <hr className="border-leaf-100 dark:border-white/5 my-4" />
            <div>
              <label className="block text-xs font-bold text-rose-500 uppercase mb-1">Xác nhận bằng mật khẩu hiện tại</label>
              <input 
                type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-rose-50 dark:bg-black/20 border border-rose-200 dark:border-rose-900/30 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Nhập mật khẩu hiện tại..."
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full py-3 bg-leaf-900 dark:bg-rose-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black dark:hover:bg-rose-800 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} /> {loading ? 'Đang lưu...' : 'Cập nhật tài khoản'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
