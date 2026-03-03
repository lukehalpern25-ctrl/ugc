export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000) {
    return "$" + (amount / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return "$" + amount.toFixed(2);
}

export function formatCurrencyFull(amount: number): string {
  return "$" + amount.toFixed(2);
}
