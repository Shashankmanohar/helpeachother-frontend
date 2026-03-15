export const fmt = (n: number): string =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtInt = (n: number): string =>
  n.toLocaleString('en-IN');
