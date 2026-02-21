import type { WidgetManifest } from '@/types/widget';

export const quickActionsManifest: WidgetManifest = {
  dataSource: { type: 'none' },
  description: 'Quick action buttons for common tasks',
  events: {
    emits: [
      { name: 'navigate', payload: { target: 'string' } },
      { name: 'action', payload: { content: 'string', type: 'string' } },
    ],
    listens: [],
  },
  id: 'quick-actions',
  name: 'Quick Actions',
  sizes: {
    default: 'small',
    supported: ['small', 'medium'],
  },
  trust: 'builtin',
  version: '1.0.0',
};
