import * as FileSystem from 'expo-file-system';

const VIDEO_CACHE_DIR = `${FileSystem.cacheDirectory}video-cache/`;
const MAX_CACHE_AGE = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

// Global memory cache of currently available local files to allow synchronous checks
const cachedFiles = new Set<string>();

export const getDeterministicLocalUri = (url: string) => {
  if (!url) return '';
  // Create a simple hash from string to use as filename
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Remove query parameters to keep extension if possible, but hash ensures uniqueness
  const extension = url.split('.').pop()?.split('?')[0] || 'mp4';
  const filename = `v_${Math.abs(hash)}.${extension}`;
  return `${VIDEO_CACHE_DIR}${filename}`;
};

/**
 * Synchronous check if a video is likely cached (based on memory set)
 */
export const isVideoCachedSync = (url: string): boolean => {
  if (!url) return false;
  const localUri = getDeterministicLocalUri(url);
  return cachedFiles.has(localUri);
};

/**
 * Initialize cache directory and perform cleanup
 */
export const initVideoCache = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(VIDEO_CACHE_DIR, { intermediates: true });
    }
    
    // Load existing files into memory set for sync checks
    const files = await FileSystem.readDirectoryAsync(VIDEO_CACHE_DIR);
    cachedFiles.clear();
    files.forEach(file => {
      cachedFiles.add(`${VIDEO_CACHE_DIR}${file}`);
    });

    // Clean up expired files on startup
    await cleanupCache();
  } catch (e) {
    console.error('Failed to init video cache', e);
  }
};

/**
 * Remove files older than 5 hours
 */
export const cleanupCache = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(VIDEO_CACHE_DIR);
    const now = Date.now();
    
    for (const file of files) {
      const fileUri = `${VIDEO_CACHE_DIR}${file}`;
      const info = await FileSystem.getInfoAsync(fileUri);
      
      if (info.exists && !info.isDirectory && info.modificationTime) {
        const age = now - (info.modificationTime * 1000);
        if (age > MAX_CACHE_AGE) {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
          cachedFiles.delete(fileUri);
        }
      }
    }
  } catch (e) {
    console.error('[VideoCache] Cleanup failed', e);
  }
};

/**
 * Get local URI for a video URL if it exists and is fresh
 */
export const getCachedVideoUri = async (url: string): Promise<string> => {
  if (!url) return url;
  
  const fileUri = getDeterministicLocalUri(url);
  
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (fileInfo.exists && fileInfo.modificationTime) {
    const age = Date.now() - (fileInfo.modificationTime * 1000);
    if (age <= MAX_CACHE_AGE) {
      cachedFiles.add(fileUri);
      return fileUri;
    }
    // Expired - delete it
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    cachedFiles.delete(fileUri);
  }
  
  return url;
};

/**
 * Download a video to local cache if not already present
 */
export const prefetchVideo = async (url: string) => {
  if (!url || !url.startsWith('http')) return;
  
  const fileUri = getDeterministicLocalUri(url);
  
  try {
    // If it's already in our memory set, assume it's fresh
    if (cachedFiles.has(fileUri)) return;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists && fileInfo.modificationTime) {
      const age = Date.now() - (fileInfo.modificationTime * 1000);
      if (age <= MAX_CACHE_AGE) {
        cachedFiles.add(fileUri);
        return; // Fresh cache exists
      }
      // Expired cache - remove before redownloading
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      cachedFiles.delete(fileUri);
    }

    // Start download
    await FileSystem.downloadAsync(url, fileUri);
    cachedFiles.add(fileUri);
  } catch (e) {
    // Fail silently for prefetch
  }
};
