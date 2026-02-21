import type { WidgetManifest } from '@/types/widget';

export const calendarManifest: WidgetManifest = {
  dataSchema: {
    properties: {
      jobs: {
        items: {
          properties: {
            cronPattern: { type: 'string' },
            enabled: { type: 'boolean' },
            id: { type: 'string' },
            name: { type: 'string' },
          },
          type: 'object',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  dataSource: { type: 'none' },
  description: 'Calendar view with scheduled job indicators',
  id: 'calendar',
  name: 'Calendar',
  sizes: {
    default: 'medium',
    supported: ['small', 'medium', 'large'],
  },
  trust: 'builtin',
  version: '1.0.0',
};
