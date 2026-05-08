import { useState, useEffect } from 'react';

export function useReadingProgress(storyId?: string) {
  const [readChapters, setReadChapters] = useState<string[]>([]);

  useEffect(() => {
    if (!storyId) return;
    const data = localStorage.getItem(`read_progress_${storyId}`);
    if (data) {
      try {
        setReadChapters(JSON.parse(data));
      } catch (e) {
        console.error(e);
      }
    } else {
        setReadChapters([]);
    }
  }, [storyId]);

  const toggleRead = (chapterId: string) => {
    if (!storyId) return;
    setReadChapters(prev => {
      let next;
      if (prev.includes(chapterId)) {
        next = prev.filter(c => c !== chapterId);
      } else {
        next = [...prev, chapterId];
      }
      localStorage.setItem(`read_progress_${storyId}`, JSON.stringify(next));
      return next;
    });
  };

  const markRead = (chapterId: string) => {
    if (!storyId) return;
    setReadChapters(prev => {
      if (prev.includes(chapterId)) return prev;
      const next = [...prev, chapterId];
      localStorage.setItem(`read_progress_${storyId}`, JSON.stringify(next));
      return next;
    });
  };

  const markAllRead = (chapterIds: string[]) => {
    if (!storyId) return;
    setReadChapters(chapterIds);
    localStorage.setItem(`read_progress_${storyId}`, JSON.stringify(chapterIds));
  };

  const unmarkAll = () => {
    if (!storyId) return;
    setReadChapters([]);
    localStorage.removeItem(`read_progress_${storyId}`);
  };

  return { readChapters, toggleRead, markRead, markAllRead, unmarkAll };
}
