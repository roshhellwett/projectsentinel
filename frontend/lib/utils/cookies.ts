

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name && value) {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

export function setCookie(
  name: string,
  value: string,
  options?: { maxAge?: number; path?: string; secure?: boolean; sameSite?: 'Strict' | 'Lax' | 'None' }
): void {
  if (typeof document === 'undefined') return;

  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options?.path) cookie += `; path=${options.path}`;
  if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
  if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`;

  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  if (options?.secure !== false && isSecure) {
    cookie += '; Secure';
  }

  document.cookie = cookie;
}

export function removeCookie(name: string, options?: { path?: string }): void {
  setCookie(name, '', { maxAge: 0, path: options?.path });
}
