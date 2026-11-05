/** Presentation formats. Precision is applied once, at the boundary where a value becomes text. */
const MIB = 1024 * 1024;
const KIB = 1024;
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export const pct = (ratio) => `${(ratio * 100).toFixed(1)}%`;
export const pct0 = (ratio) => `${(ratio * 100).toFixed(0)}%`;
export const times = (ratio) => `${ratio.toFixed(2)}×`;
export const times1 = (ratio) => `${ratio.toFixed(1)}×`;
export const int = (value) => Math.round(value).toLocaleString('en-US');
export const bytes = (value) => `${int(value)} bytes`;
export const kib = (value) => `${(value / KIB).toFixed(1)} KiB`;
export const mib = (value) => `${(value / MIB).toFixed(1)} MiB`;
export const ms = (value) => `${value.toFixed(2)} ms`;
export const us = (nanoseconds) => `${(nanoseconds / 1000).toFixed(2)} µs`;
export const fixed2 = (value) => value.toFixed(2);
export const fixed3 = (value) => value.toFixed(3);
export const sci = (value) => value.toExponential(1);
export const text = (value) => String(value);
export const yesNo = (value) => (value ? 'yes' : 'no');

/** @param {number} value small non-negative integer */
export function word(value) {
  return WORDS[value] ?? String(value);
}

/** Render an interval using the same format as its endpoints. */
export function interval(low, high, format) {
  return `${format(low)} to ${format(high)}`;
}
