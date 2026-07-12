export function setCookie(
  name: string,
  value: string,
  options?: {
    maxAge?: number;
    path?: string;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  },
): void {
  if (typeof document === "undefined") return;

  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options?.path) cookie += `; path=${options.path}`;
  if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
  if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`;

  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  if (options?.secure !== false && isSecure) {
    cookie += "; Secure";
  }

  document.cookie = cookie;
}
