import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

interface UserProfile {
  role: 'super_admin' | 'editor' | 'reader';
  displayName?: string;
  photoURL?: string;
  pseudonym?: string;
  readingPreferences?: {
    fontSize: number;
    fontFamily: string;
  };
  createdAt?: any;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  isReader: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isSuperAdmin: false,
  isEditor: false,
  isReader: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch profile
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        let userData: UserProfile;
        if (docSnap.exists()) {
          userData = docSnap.data() as UserProfile;
          // Legacy role migration if needed or just use what's there
          if (userData.role as any === 'admin') userData.role = 'super_admin';
          if (userData.role as any === 'uploader') userData.role = 'editor';
          if (userData.role as any === 'user') userData.role = 'reader';
        } else {
          // New user
          const role = currentUser.email === 'dreamsofocean2614@gmail.com' ? 'super_admin' : 'reader';
          userData = {
            role,
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            createdAt: serverTimestamp(),
            email: currentUser.email,
            readingPreferences: {
              fontSize: 18,
              fontFamily: 'serif'
            }
          } as any;
          
          await setDoc(docRef, userData).catch(console.error);
        }
        
        setProfile(userData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isSuperAdmin: profile?.role === 'super_admin',
      isEditor: profile?.role === 'super_admin' || profile?.role === 'editor',
      isReader: !!profile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
