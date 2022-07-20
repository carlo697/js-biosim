export const probabilityToBool = (factor: number) => {
  return Math.random() < factor;
};

export const numberToBitString = (value: number) => {
  return (value >>> 0).toString(2);
};

export const numberToHexString = (value: number) => {
  return (value >>> 0).toString(16);
};
