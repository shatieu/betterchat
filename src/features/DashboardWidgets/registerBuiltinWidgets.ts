import { registerWidget } from './widgetRegistry';
import AgentOutputWidget from './widgets/agent-output';
import { agentOutputManifest } from './widgets/agent-output/manifest';
import CalendarWidget from './widgets/calendar';
import { calendarManifest } from './widgets/calendar/manifest';
import ClockWidget from './widgets/clock';
import { clockManifest } from './widgets/clock/manifest';
import CronStatsWidget from './widgets/cron-stats';
import { cronStatsManifest } from './widgets/cron-stats/manifest';
import MarkdownWidget from './widgets/markdown';
import { markdownManifest } from './widgets/markdown/manifest';
import MetricWidget from './widgets/metric';
import { metricManifest } from './widgets/metric/manifest';
import NotesWidget from './widgets/notes';
import { notesManifest } from './widgets/notes/manifest';
import QuickActionsWidget from './widgets/quick-actions';
import { quickActionsManifest } from './widgets/quick-actions/manifest';
import RecentConversationsWidget from './widgets/recent-conversations';
import { recentConversationsManifest } from './widgets/recent-conversations/manifest';

let registered = false;

export const registerBuiltinWidgets = () => {
  if (registered) return;
  registered = true;

  registerWidget(notesManifest, NotesWidget);
  registerWidget(calendarManifest, CalendarWidget);
  registerWidget(agentOutputManifest, AgentOutputWidget);
  registerWidget(cronStatsManifest, CronStatsWidget);
  registerWidget(recentConversationsManifest, RecentConversationsWidget);
  registerWidget(clockManifest, ClockWidget);
  registerWidget(quickActionsManifest, QuickActionsWidget);
  registerWidget(metricManifest, MetricWidget);
  registerWidget(markdownManifest, MarkdownWidget);
};
