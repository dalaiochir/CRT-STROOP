export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
export function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
export function formatMs(ms: number) {
  return `${Math.round(ms)} ms`;
}
export function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("mn-MN", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" });
}
