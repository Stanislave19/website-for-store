export const HOUR_TICK_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);
export const MINOR_TICK_ANGLES = Array.from({ length: 60 }, (_, i) => i * 6).filter(
  (angle) => angle % 30 !== 0,
);

/** Rounded to 2dp: raw Math.cos/sin can differ in the last digit between
 * the server and browser runtimes, which breaks SSR hydration. */
export function polar(radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: Math.round((100 + radius * Math.cos(rad)) * 100) / 100,
    y: Math.round((100 + radius * Math.sin(rad)) * 100) / 100,
  };
}
