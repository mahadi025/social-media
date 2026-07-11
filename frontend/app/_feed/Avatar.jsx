import styles from "./feed.module.css";

const COLORS = [
  "#1890FF",
  "#0ACF83",
  "#FF6B6B",
  "#F7B731",
  "#8854D0",
  "#20BF6B",
  "#EB3B5A",
];

function colorFor(name) {
  const code = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
}

function initialsFor(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function Avatar({ name, size = 40 }) {
  const label = name || "?";
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.4, background: colorFor(label) }}
    >
      {initialsFor(label)}
    </span>
  );
}
