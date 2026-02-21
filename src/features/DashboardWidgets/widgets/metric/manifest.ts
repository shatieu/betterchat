import type { WidgetManifest } from '@/types/widget';

export const metricManifest: WidgetManifest = {
  dataSchema: {
    properties: {
      label: { type: 'string' },
      trend: { enum: ['up', 'down', 'flat'], type: 'string' },
      unit: { type: 'string' },
      value: { type: 'number' },
    },
    required: ['value', 'label'],
    type: 'object',
  },
  dataSource: {
    prompt: 'Retrieve a single key metric value with label and optional trend indicator.',
    refreshInterval: 300,
    type: 'orchestrator',
  },
  description: 'Single number metric with label and trend indicator',
  id: 'metric',
  name: 'Metric',
  sizes: {
    default: 'small',
    supported: ['small', 'medium'],
  },
  trust: 'builtin',
  version: '1.0.0',
};
