import type { WidgetManifest } from '@/types/widget';

export const recentConversationsManifest: WidgetManifest = {
  dataSchema: {
    properties: {
      topics: {
        items: {
          properties: {
            createdAt: { type: 'string' },
            sessionId: { type: 'string' },
            title: { type: 'string' },
            updatedAt: { type: 'string' },
          },
          type: 'object',
        },
        type: 'array',
      },
    },
    type: 'object',
  },
  dataSource: { type: 'none' },
  description: 'Recent conversation topics',
  events: {
    emits: [{ name: 'navigate', payload: { chatId: 'string', target: 'string' } }],
    listens: [],
  },
  id: 'recent-conversations',
  name: 'Recent Conversations',
  sizes: {
    default: 'wide',
    supported: ['medium', 'wide', 'large'],
  },
  trust: 'builtin',
  version: '1.0.0',
};
