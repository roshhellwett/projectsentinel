export function getHostname(url: string | null | undefined): string {
  if (!url) return '';
  let safeUrl = url.trim();
  
  // Ensure protocol exists so new URL() doesn't throw TypeError
  if (!/^https?:\/\//i.test(safeUrl)) {
    safeUrl = 'http://' + safeUrl;
  }
  
  try {
    const parsed = new URL(safeUrl);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    // Ultimate fallback for bizarrely malformed strings
    const match = safeUrl.match(/^(?:https?:\/\/)?(?:www\.)?([^/:]+)/i);
    return match ? match[1] : '';
  }
}
