// Small colour helpers for WCAG contrast. Used at build time to keep every
// game palette AA-compliant on the dark backgrounds.

type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

export function rgbToHex([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export function mix(a: string, b: string, amount: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(ca.map((v, i) => v + (cb[i]! - v) * amount) as Rgb);
}

/** Lightens fg toward white until it reaches `ratio` against every background. */
export function ensureContrast(fg: string, backgrounds: string[], ratio: number): string {
  let out = fg;
  for (let step = 0; step <= 50; step++) {
    if (backgrounds.every((bg) => contrast(out, bg) >= ratio)) return out;
    out = mix(fg, '#ffffff', step / 50);
  }
  return '#ffffff';
}

/** Darkens a colour toward black until its luminance is at most `max`. */
export function ensureDark(color: string, max: number): string {
  let out = color;
  for (let step = 0; step <= 50; step++) {
    if (luminance(out) <= max) return out;
    out = mix(color, '#000000', step / 50);
  }
  return '#000000';
}
