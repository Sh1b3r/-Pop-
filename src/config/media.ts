/**
 * CDN Configuration for Media Assets
 *
 * Automatically fetches all heavy images, logos, and promotional graphics
 * from global cloud CDN (jsDelivr / GitHub), ensuring ZERO disk space is wasted on the local PC!
 */
export const MEDIA_BASE_URL = (
  import.meta.env.VITE_MEDIA_CDN_URL || 'https://cdn.jsdelivr.net/gh/Sh1b3r/-Pop-@main'
).replace(/\/$/, '');

/**
 * Resolves full asset URL.
 * Automatically maps any relative path (/christmas.png) to the high-speed Cloud CDN.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${MEDIA_BASE_URL}${cleanPath}`;
}

