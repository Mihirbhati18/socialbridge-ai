const PRIORITY_WEIGHTS: Record<string, number> = {
  URGENT: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
};

const STATUS_WEIGHTS: Record<string, number> = {
  OPEN: 100,
  ASSIGNED: 70,
  IN_PROGRESS: 40,
  RESOLVED: 10,
};

function getTimeScore(createdAt: Date | string): number {
  const hoursAgo =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 1) return 100;
  if (hoursAgo < 6) return 95;
  if (hoursAgo < 24) return 85;
  if (hoursAgo < 72) return 70;
  if (hoursAgo < 168) return 50;
  if (hoursAgo < 720) return 30;
  if (hoursAgo < 2160) return 15;
  return 5;
}

function getUpvoteScore(upvotes: number, maxUpvotes: number): number {
  if (maxUpvotes === 0) return 0;
  return Math.round((upvotes / maxUpvotes) * 100);
}

function getDepartmentScore(department: string | null): number {
  return department ? 50 : 100;
}

export function computeRankingScore(
  issue: {
    createdAt: Date | string;
    priority: string;
    status: string;
    upvotes: number;
    department: string | null;
  },
  maxUpvotes: number
): { rankingScore: number; timeScore: number; priorityScore: number; statusScore: number; upvoteScore: number; departmentScore: number } {
  const timeScore = getTimeScore(issue.createdAt);
  const priorityScore = PRIORITY_WEIGHTS[issue.priority] || 50;
  const statusScore = STATUS_WEIGHTS[issue.status] || 50;
  const upvoteScore = getUpvoteScore(issue.upvotes, maxUpvotes);
  const departmentScore = getDepartmentScore(issue.department);

  const rankingScore = Math.round(
    timeScore * 0.35 +
      priorityScore * 0.3 +
      statusScore * 0.15 +
      upvoteScore * 0.15 +
      departmentScore * 0.05
  );

  return { rankingScore, timeScore, priorityScore, statusScore, upvoteScore, departmentScore };
}


