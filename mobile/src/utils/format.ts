// Manual grouping instead of toLocaleString('en-IN') — Hermes' Intl locale data support
// varies by build, so this avoids a silent fallback to plain Western grouping.
export function formatNumber(value: number): string {
  const isNegative = value < 0;
  const digits = Math.trunc(Math.abs(value)).toString();
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const groupedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const grouped = rest ? `${groupedRest},${lastThree}` : lastThree;
  return isNegative ? `-${grouped}` : grouped;
}
