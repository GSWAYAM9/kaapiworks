/**
 * Formats a number as Indian Rupee (INR) currency
 * Example: 1250 -> "₹1,250"
 */
export function formatINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Returns human-readable roast title and color token
 */
export function getRoastInfo(roast?: string | null): { label: string; dotClass: string } {
  if (!roast) return { label: 'Medium', dotClass: 'bg-[#C2622D]' };
  switch (roast.toLowerCase()) {
    case 'light':
      return { label: 'Light Roast', dotClass: 'bg-[#E3A857]' };
    case 'dark':
      return { label: 'Dark Roast', dotClass: 'bg-[#1C120D]' };
    case 'medium':
    default:
      return { label: 'Medium Roast', dotClass: 'bg-[#C2622D]' };
  }
}

/**
 * Fallback placeholder SVG if an external product image fails
 */
export function getFallbackImage(title: string = 'Kaapi Works'): string {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="%232B1D16"><rect width="600" height="600" fill="%23F4EDE3"/><path d="M260 220c-10-30-5-50 15-80M300 220c-10-30-5-50 15-80M340 220c-10-30-5-50 15-80" stroke="%23C2622D" stroke-width="4" stroke-linecap="round"/><path d="M220 260h160v120c0 40-30 60-80 60s-80-20-80-60V260z" fill="%232B1D16"/><path d="M380 290h30c20 0 30 15 30 35s-10 35-30 35h-30" stroke="%232B1D16" stroke-width="12" fill="none" stroke-linecap="round"/><rect x="200" y="440" width="200" height="12" rx="6" fill="%23C2622D"/><text x="300" y="500" font-family="sans-serif" font-size="20" font-weight="600" fill="%232B1D16" text-anchor="middle">${encodeURIComponent(
    title
  )}</text></svg>`;
}
