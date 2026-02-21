import type { WidgetManifest } from '@/types/widget';

export const cronStatsManifest: WidgetManifest = {
  dataSchema: {
    properties: {
      activeJobs: { type: 'number' },
      pausedJobs: { type: 'number' },
      totalExecutions: { type: 'number' },
      totalJobs: { type: 'number' },
    },
    type: 'object',
  },
  dataSource: { type: 'none' },
  description: 'Statistics for scheduled cron jobs',
  id: 'cron-stats',
  name: 'Cron Stats',
  sizes: {
    default: 'medium',
    supported: ['small', 'medium'],
  },
  trust: 'builtin',
  version: '1.0.0',
};
