import type { WidgetManifest } from '@/types/widget';

export const notesManifest: WidgetManifest = {
  dataSource: { type: 'none' },
  description: 'Quick notes with auto-save',
  events: {
    emits: [{ name: 'notes-updated', payload: { content: 'string' } }],
    listens: [],
  },
  id: 'notes',
  name: 'Notes',
  sizes: {
    default: 'medium',
    supported: ['small', 'medium', 'large'],
  },
  trust: 'builtin',
  version: '1.0.0',
};
