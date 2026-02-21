import type { WidgetManifest } from '@/types/widget';

export const markdownManifest: WidgetManifest = {
  dataSchema: {
    properties: {
      content: { type: 'string' },
    },
    required: ['content'],
    type: 'object',
  },
  dataSource: {
    prompt: 'Provide markdown content to display.',
    refreshInterval: 600,
    type: 'orchestrator',
  },
  description: 'Rendered markdown content display',
  id: 'markdown',
  name: 'Markdown',
  sizes: {
    default: 'medium',
    supported: ['medium', 'large'],
  },
  trust: 'builtin',
  version: '1.0.0',
};
