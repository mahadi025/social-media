const UNITS = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function timeAgo(isoString) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  );

  for (const [label, secs] of UNITS) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
