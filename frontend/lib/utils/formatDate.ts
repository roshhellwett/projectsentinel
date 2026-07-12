const IST: Intl.DateTimeFormatOptions = { timeZone: "Asia/Kolkata" };

function parseSafeDate(dateString: string): Date {
  if (!dateString) return new Date(NaN);
  let safeString = dateString.trim().replace(" ", "T");
  if (
    !safeString.endsWith("Z") &&
    !safeString.includes("+") &&
    !safeString.match(/-\d{2}:\d{2}$/)
  ) {
    safeString += "Z";
  }
  return new Date(safeString);
}

export function formatDate(dateString: string): string {
  const date = parseSafeDate(dateString);
  if (isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-IN", {
    ...IST,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeAgo(dateString: string): string {
  const date = parseSafeDate(dateString);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffInSeconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000),
  );

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    ...IST,
    month: "short",
    day: "numeric",
  });
}
