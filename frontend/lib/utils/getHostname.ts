export function getHostname(url: string | null | undefined): string {
  if (!url) return "";
  let safeUrl = url.trim();

  if (!/^https?:\/\//i.test(safeUrl)) {
    safeUrl = "http://" + safeUrl;
  }

  try {
    const parsed = new URL(safeUrl);
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    const match = safeUrl.match(/^(?:https?:\/\/)?(?:www\.)?([^/:]+)/i);
    return match ? match[1] : "";
  }
}
