export interface DashboardStoreState {
  notes: string;
  widgetOrder: string[];
  widgetVisibility: Record<string, boolean>;
}

export const initialDashboardState: DashboardStoreState = {
  notes: '',
  widgetOrder: ['notes', 'agentOutput', 'calendar', 'cronStats', 'recentConversations'],
  widgetVisibility: {
    agentOutput: true,
    calendar: true,
    cronStats: true,
    notes: true,
    recentConversations: true,
  },
};
