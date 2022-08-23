export const probabilityToBool = (factor: number) => {
  return Math.random() < factor;
};

export const numberToBitString = (value: number) => {
  return (value >>> 0).toString(2);
};

export const numberToHexString = (value: number) => {
  return (value >>> 0).toString(16);
};

// https://stackoverflow.com/questions/29851873/convert-a-number-between-1-and-16777215-to-a-colour-value
export const numberToRGB = (value: number) => {
  const r = value & 0xff;
  const g = (value >> 8) & 0xff;
  const b = (value >> 16) & 0xff;
  return "rgb(" + r + "," + g + "," + b + ")";
};

export const paddingLeft = (string: String, paddingValue: string) => {
  return String(paddingValue + string).slice(-paddingValue.length);
};

export const getRandomHexChar = (): string => {
  return Math.round(Math.random() * 15).toString(16);
};

export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
