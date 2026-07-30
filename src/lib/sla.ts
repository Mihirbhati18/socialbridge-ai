import { toCategorySlug } from './categories';

export const SLA_POLICIES: Record<string, { targetHours: number; escalateAfterHours: number }> = {
  'garbage': { targetHours: 48, escalateAfterHours: 72 },
  'road': { targetHours: 168, escalateAfterHours: 240 }, // 7 days / 10 days
  'water': { targetHours: 24, escalateAfterHours: 48 },
  'electricity': { targetHours: 24, escalateAfterHours: 48 },
  'sanitation': { targetHours: 48, escalateAfterHours: 72 },
  'drainage': { targetHours: 72, escalateAfterHours: 120 },
  'default': { targetHours: 72, escalateAfterHours: 120 },
};

export function getSlaDeadline(category: string, createdAt: Date = new Date()): Date {
  const slug = toCategorySlug(category);
  const policy = SLA_POLICIES[slug] || SLA_POLICIES['default'];
  
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + policy.targetHours);
  
  return deadline;
}

export function getEscalationDeadline(category: string, createdAt: Date = new Date()): Date {
  const slug = toCategorySlug(category);
  const policy = SLA_POLICIES[slug] || SLA_POLICIES['default'];
  
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + policy.escalateAfterHours);
  
  return deadline;
}
