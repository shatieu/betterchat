import type { WidgetManifest } from '@/types/widget';

export const agentOutputManifest: WidgetManifest = {
  dataSchema: {
    properties: {
      jobs: {
        items: {
          properties: {
            agentId: { type: 'string' },
            id: { type: 'string' },
            lastExecutedAt: { type: 'string' },
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
  description: 'Latest output from scheduled agent jobs',
  events: {
    emits: [{ name: 'navigate', payload: { chatId: 'string', target: 'string' } }],
    listens: [],
  },
  id: 'agent-output',
  name: 'Agent Output',
  sizes: {
    default: 'medium',
    supported: ['medium', 'large'],
  },
  trust: 'builtin',
  version: '1.0.0',
};
