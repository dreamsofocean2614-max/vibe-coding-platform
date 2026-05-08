export const confirmed18Stories = new Set<string>();

export const isStoryConfirmed18 = (storyId: string) => confirmed18Stories.has(storyId);
export const confirmStory18 = (storyId: string) => confirmed18Stories.add(storyId);
