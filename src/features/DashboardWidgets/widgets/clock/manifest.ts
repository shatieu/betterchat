import type { WidgetManifest } from '@/types/widget';

export const clockManifest: WidgetManifest = {
  dataSource: { type: 'none' },
  description: 'Current time and timezone display',
  id: 'clock',
  name: 'Clock',
  sizes: {
    default: 'small',
    supported: ['small', 'medium'],
  },
  trust: 'builtin',
  version: '1.0.0',
};
