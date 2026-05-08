import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, writeBatch, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { MOCK_STORIES } from './mockData';
import { CATEGORIES, Category } from './constants';

export { CATEGORIES };
export type { Category };

export interface Story {
  id: string;
  title: string;
  author: string;
  editor?: string;
  synopsis: string;
  coverUrl: string;
  categories: Category[];
  status: 'Đang ra' | 'Hoàn thành' | 'Tạm dừng';
  chapterCount: number;
  views: number;
  rating: number;
  ratingCount: number;
  uploaderId?: string;
  isHidden?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Chapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  title: string;
  content: string[];
  isLocked: boolean;
  password?: string;
  shopeeLink?: string;
  unlockedEmails?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface SiteSettings {
  facebookLink?: string;
  tiktokLink?: string;
  youtubeLink?: string;
  gmailAddress?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoSize?: number;
  bannerUrl?: string;
  bannerDarkUrl?: string;
  bannerText?: string;
  bannerHeight?: number;
  chapterBannerUrl?: string;
  chapterBannerDarkUrl?: string;
  chapterBannerHeight?: number;
}

export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'general'));
    if (docSnap.exists()) return docSnap.data() as SiteSettings;
    return {};
  } catch (error) {
    console.error(error);
    return {};
  }
}

export const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
  await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
}

export interface LegalPage {
  id: string;
  title: string;
  content: string;
  fontFamily?: string;
  textColor?: string;
  updatedAt: any;
}

export const getLegalPage = async (pageId: string): Promise<LegalPage | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'legal_pages', pageId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LegalPage;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `legal_pages/${pageId}`);
    return null;
  }
};

export const updateLegalPage = async (pageId: string, data: Partial<LegalPage>) => {
  try {
    await setDoc(doc(db, 'legal_pages', pageId), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `legal_pages/${pageId}`);
  }
};

export interface ReadingProgress {
  storyId: string;
  chapterId: string;
  chapterNumber: number;
  title: string;
  updatedAt: any;
}

export interface Favorite {
  storyId: string;
  storyTitle: string;
  storyCover: string;
  createdAt: any;
}

export interface ReadingHistory {
  id?: string;
  storyId: string;
  storyTitle: string;
  chapterId: string;
  chapterNumber: number;
  viewedAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: any;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  details: string;
  targetName?: string;
  timestamp: any;
}

export interface UserProfile {
  id?: string;
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

// USER MANAGEMENT
export const getUsers = async (): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), { role });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
};

// HISTORY & PROGRESS
export const updateReadingProgress = async (userId: string, progress: Omit<ReadingProgress, 'updatedAt'>) => {
  try {
    await setDoc(doc(db, 'users', userId, 'reading_progress', progress.storyId), {
      ...progress,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    // Silently fail progress update or handle it
  }
};

export const addToHistory = async (userId: string, history: Omit<ReadingHistory, 'viewedAt'>) => {
  try {
    const historyRef = doc(collection(db, 'users', userId, 'reading_history'));
    await setDoc(historyRef, {
      ...history,
      viewedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(error);
  }
};

export const getUserHistory = async (userId: string): Promise<ReadingHistory[]> => {
  try {
    const q = query(collection(db, 'users', userId, 'reading_history'), orderBy('viewedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReadingHistory));
  } catch (error) {
    return [];
  }
};

// FAVORITES
export const toggleFavorite = async (userId: string, story: Story) => {
  try {
    const favRef = doc(db, 'users', userId, 'favorites', story.id);
    const favSnap = await getDoc(favRef);
    
    if (favSnap.exists()) {
      await deleteDoc(favRef);
      return false;
    } else {
      await setDoc(favRef, {
        storyId: story.id,
        storyTitle: story.title,
        storyCover: story.coverUrl,
        createdAt: serverTimestamp()
      });
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const isFavorite = async (userId: string, storyId: string): Promise<boolean> => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'favorites', storyId));
    return docSnap.exists();
  } catch (error) {
    return false;
  }
};

// LOGS
export const addActivityLog = async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
  try {
    const logRef = doc(collection(db, 'activity_logs'));
    await setDoc(logRef, {
      ...log,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error(error);
  }
};

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  try {
    const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
  } catch (error) {
    return [];
  }
};
export interface PaginatedStories {
  stories: Story[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const getStories = async (pageSize: number = 12, lastVisibleDoc: any = null): Promise<PaginatedStories | Story[]> => {
  try {
    let q = query(collection(db, 'stories'), orderBy('updatedAt', 'desc'), limit(pageSize));
    
    if (lastVisibleDoc) {
      q = query(collection(db, 'stories'), orderBy('updatedAt', 'desc'), startAfter(lastVisibleDoc), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    
    // If it's a legacy call (no params), we might want to return all stories for backward compatibility
    // but the request asks for pagination, so we'll return the object.
    // However, to avoid breaking other parts of the app, let's detect if it's called with 12 and null (defaults)
    // and if the caller expects an array.
    
    return {
      stories,
      lastVisible: lastDoc,
      hasMore: stories.length === pageSize
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'stories');
    return { stories: [], lastVisible: null, hasMore: false };
  }
};

export const getStory = async (storyId: string): Promise<Story | null> => {
  try {
    // If it's a mock story ID, return from MOCK_STORIES
    if (storyId.startsWith('mock-')) {
      return MOCK_STORIES.find(s => s.id === storyId) || null;
    }

    const docSnap = await getDoc(doc(db, 'stories', storyId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Story;
    }
    return null;
  } catch (error) {
    // Fallback for mock data if story not found in DB but matches mock logic
    const mock = MOCK_STORIES.find(s => s.id === storyId);
    if (mock) return mock;

    handleFirestoreError(error, OperationType.GET, `stories/${storyId}`);
    return null;
  }
};

export const createStory = async (storyData: Omit<Story, 'id' | 'chapterCount' | 'views' | 'rating' | 'ratingCount' | 'createdAt' | 'updatedAt'>) => {
  try {
    const newDocRef = doc(collection(db, 'stories'));
    const data = {
      ...storyData,
      chapterCount: 0,
      views: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(newDocRef, data);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'stories');
  }
};

export const updateStory = async (storyId: string, updates: Partial<Omit<Story, 'id' | 'createdAt'>>) => {
  try {
    const { id, createdAt, views, rating, ratingCount, chapterCount, ...safeUpdates } = updates as any;
    
    // Remove undefined fields
    Object.keys(safeUpdates).forEach(key => safeUpdates[key] === undefined && delete safeUpdates[key]);

    await updateDoc(doc(db, 'stories', storyId), {
      ...safeUpdates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `stories/${storyId}`);
  }
};

export const deleteStory = async (storyId: string) => {
  try {
    await deleteDoc(doc(db, 'stories', storyId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `stories/${storyId}`);
  }
};

export const incrementStoryViews = async (storyId: string) => {
  try {
    const docRef = doc(db, 'stories', storyId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const story = docSnap.data() as Story;
    await updateDoc(docRef, {
      views: (story.views || 0) + 1,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `stories/${storyId}`);
  }
};

export const updateStoryRating = async (storyId: string, score: number) => {
  try {
    const docRef = doc(db, 'stories', storyId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const story = docSnap.data() as Story;
    const currentRating = story.rating || 0;
    const currentCount = story.ratingCount || 0;

    const newRawAvg = ((currentRating * currentCount) + score) / (currentCount + 1);
    // User requested: "không được để truyện nào được thấp dưới 4 sao" -> minimum 4 stars
    let newRating = Math.max(4, newRawAvg);
    
    // If it's the very first vote and user rated e.g. 5, we shouldn't just keep 4 if score > 4.
    // The Math.max handles this implicitly: if newRawAvg is 5, max(4, 5) = 5.
    
    // Round to 1 decimal place
    newRating = Math.round(newRating * 10) / 10;

    await updateDoc(docRef, {
      rating: newRating,
      ratingCount: currentCount + 1,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `stories/${storyId}`);
  }
};

// CHAPTERS
export const getChapters = async (storyId: string): Promise<Chapter[]> => {
  try {
    // Mock chapters fallback
    if (storyId.startsWith('mock-')) {
      return Array.from({ length: 5 }).map((_, i) => ({
        id: `mock-chap-${i + 1}`,
        storyId,
        chapterNumber: i + 1,
        title: `Chương ${i + 1}: Khởi đầu mới`,
        content: [
          `Đây là nội dung chương ${i + 1} của truyện demo.`,
          "Nội dung này chỉ mang tính chất minh họa cho giao diện đọc truyện.",
          "Bạn có thể thêm truyện và chương thật trong phần quản trị."
        ],
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }

    const q = query(collection(db, 'stories', storyId, 'chapters'), orderBy('chapterNumber', 'asc'));
    const snapshot = await getDocs(q).catch(async (err) => {
      console.warn("Ordered chapters fetch failed, trying unordered fallback", err);
      return await getDocs(collection(db, 'stories', storyId, 'chapters'));
    });
    
    let chapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
    
    // Ensure sorted if fallback was used
    if (snapshot.docs.length > 0) {
       chapters = chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
    }
    
    return chapters;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `stories/${storyId}/chapters`);
    return [];
  }
};

export const getChapter = async (storyId: string, chapterId: string): Promise<Chapter | null> => {
   try {
    const docSnap = await getDoc(doc(db, 'stories', storyId, 'chapters', chapterId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Chapter;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `stories/${storyId}/chapters/${chapterId}`);
    return null;
  }
};

export const createChapter = async (storyId: string, chapterData: Omit<Chapter, 'id' | 'storyId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const newDocRef = doc(collection(db, 'stories', storyId, 'chapters'));
    const data = {
      ...chapterData,
      storyId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);
    const chapterCount = storySnap.exists() ? (storySnap.data()?.chapterCount || 0) : 0;

    const batch = writeBatch(db);
    batch.set(newDocRef, data);
    batch.update(storyRef, { 
      chapterCount: chapterCount + 1,
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `stories/${storyId}/chapters`);
  }
};

export const updateChapter = async (storyId: string, chapterId: string, updates: Partial<Omit<Chapter, 'id' | 'storyId' | 'createdAt'>>) => {
  try {
    const { id, storyId: sid, createdAt, ...safeUpdates } = updates as any;
    Object.keys(safeUpdates).forEach(key => safeUpdates[key] === undefined && delete safeUpdates[key]);

    await updateDoc(doc(db, 'stories', storyId, 'chapters', chapterId), {
      ...safeUpdates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `stories/${storyId}/chapters/${chapterId}`);
  }
};

export const deleteChapter = async (storyId: string, chapterId: string) => {
  try {
    const docRef = doc(db, 'stories', storyId, 'chapters', chapterId);
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);
    const chapterCount = storySnap.exists() ? (storySnap.data()?.chapterCount || 0) : 0;

    const batch = writeBatch(db);
    batch.delete(docRef);
    if (storySnap.exists()) {
      batch.update(storyRef, { 
        chapterCount: Math.max(0, chapterCount - 1),
        updatedAt: serverTimestamp()
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `stories/${storyId}/chapters/${chapterId}`);
  }
};
