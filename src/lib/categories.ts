/** Canonical slug <-> display label helpers for collab & civic categories */

export const COLLAB_CATEGORIES = [
  { value: 'blood_donation', label: 'Blood Donation' },
  { value: 'medical_camp', label: 'Medical Camp' },
  { value: 'tree_plantation', label: 'Tree Plantation' },
  { value: 'cleanup', label: 'Cleanup' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment' },
  { value: 'csr', label: 'CSR Initiative' },
] as const;

export const CIVIC_CATEGORIES = [
  { value: 'garbage', label: 'Garbage' },
  { value: 'road', label: 'Road' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'sanitation', label: 'Sanitation' },
  { value: 'drainage', label: 'Drainage' },
] as const;

const DISPLAY_TO_SLUG: Record<string, string> = Object.fromEntries([
  ...COLLAB_CATEGORIES.map((c) => [c.label.toLowerCase(), c.value]),
  ...CIVIC_CATEGORIES.map((c) => [c.label.toLowerCase(), c.value]),
  // common aliases
  ['roads', 'road'],
  ['csr initiative', 'csr'],
]);

export function toCategorySlug(input: string | null | undefined): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (DISPLAY_TO_SLUG[lower]) return DISPLAY_TO_SLUG[lower];
  return lower.replace(/\s+/g, '_');
}

export function formatCategoryLabel(slug: string | null | undefined): string {
  if (!slug) return '';
  const found =
    COLLAB_CATEGORIES.find((c) => c.value === slug) ||
    CIVIC_CATEGORIES.find((c) => c.value === slug);
  if (found) return found.label;
  return slug
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const DEMO_USER_EMAIL = 'priya.sharma@example.com';
