import type { DashboardLayout, WidgetDataState } from '@/types/widget';

// Default layout with the same widgets that shipped before the widget system
export const DEFAULT_LAYOUT: DashboardLayout = {
  columns: 4,
  widgets: [
    {
      instanceId: 'builtin-notes',
      position: { col: 0, row: 0 },
      size: 'medium',
      widgetId: 'notes',
    },
    {
      instanceId: 'builtin-agent-output',
      position: { col: 2, row: 0 },
      size: 'medium',
      widgetId: 'agent-output',
    },
    {
      instanceId: 'builtin-calendar',
      position: { col: 0, row: 1 },
      size: 'medium',
      widgetId: 'calendar',
    },
    {
      instanceId: 'builtin-cron-stats',
      position: { col: 2, row: 1 },
      size: 'medium',
      widgetId: 'cron-stats',
    },
    {
      instanceId: 'builtin-recent-conversations',
      position: { col: 0, row: 2 },
      size: 'wide',
      widgetId: 'recent-conversations',
    },
  ],
};

export interface DashboardStoreState {
  layout: DashboardLayout;
  // Legacy fields preserved for backward compat (used by NotesWidget internally)
  notes: string;
  // Runtime data cache per widget instance
  widgetData: Record<string, WidgetDataState>;
  // Legacy fields preserved for backward compat
  widgetOrder: string[];
  widgetVisibility: Record<string, boolean>;
}

export const initialDashboardState: DashboardStoreState = {
  layout: DEFAULT_LAYOUT,
  notes: '',
  widgetData: {},
  widgetOrder: ['notes', 'agentOutput', 'calendar', 'cronStats', 'recentConversations'],
  widgetVisibility: {
    agentOutput: true,
    calendar: true,
    cronStats: true,
    notes: true,
    recentConversations: true,
  },
};
