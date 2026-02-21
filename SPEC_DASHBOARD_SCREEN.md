# Spec: Dashboard Screen

> New `/dashboard` route with card-style widgets. Home screen stays unchanged.

---

## Overview

A separate dashboard screen with a grid of widget cards. Each widget is a self-contained component that fetches its own data. The layout uses a responsive card grid.

---

## Route & Layout

**Route**: `/dashboard`
**Router config**: Add to `desktopRouter.config.tsx` inside the main layout children array.

```
{
  children: [
    { index: true, element: <DashboardScreen /> },
  ],
  element: <DashboardLayout />,
  path: 'dashboard',
}
```

**Layout**: `src/app/[variants]/(main)/dashboard/_layout/index.tsx`
- Simple layout with `NavHeader` and scrollable content area
- Optional: sidebar with widget settings/visibility toggles via `NavPanelPortal`

---

## Widget Card Base Component

`DashboardWidgetCard` - reusable card wrapper:

```
┌─────────────────────────────────────┐
│ 📝 Notes                    [•••]  │  <- title + icon + menu
│─────────────────────────────────────│
│                                     │
│         Widget Body                 │  <- slot for widget content
│                                     │
│─────────────────────────────────────│
│ Last updated: 2m ago               │  <- optional footer
└─────────────────────────────────────┘
```

Props:
- `title: string`
- `icon: LucideIcon`
- `children: ReactNode` (body)
- `footer?: ReactNode`
- `menu?: MenuProps['items']` (dropdown actions)
- `loading?: boolean`
- `span?: 1 | 2` (grid column span)

Styling: Use antd `Card` or `@lobehub/ui` `Flexbox` with `antd-style` CSS-in-JS. Match the visual style of existing cards in the codebase (e.g., CronJobCards).

---

## Widgets

### Widget 1: Notes

**Purpose**: Quick text notes for the user.
**Data**: Stored in zustand store with localStorage persistence (no backend needed initially).

Content:
- Textarea/editor for free-form notes
- Auto-save on change (debounced)
- Character count in footer

### Widget 2: Agent Output

**Purpose**: Show latest cron job execution results.
**Data**: Fetch recent cron job topics via `lambdaClient.topic.getCronTopicsGroupedByCronJob`

Content:
- List of last 5 cron execution results
- Each row: agent name, job name, timestamp, status indicator
- Click row -> navigate to `/agent/:aid/cron/:cronId`

### Widget 3: Calendar

**Purpose**: Mini calendar showing upcoming scheduled cron jobs.
**Data**: Fetch all active cron jobs via `agentCronJobService.list({ enabled: true })`

Content:
- Small monthly calendar view (use antd `Calendar` in `fullscreen={false}` mode)
- Dots on dates where jobs are scheduled
- Click date -> show popover with jobs for that day
- Parse cron patterns to calculate upcoming execution dates (use `cron-parser` or manual calculation)

### Widget 4: Cron Stats

**Purpose**: Overview of cron job health.
**Data**: `agentCronJobService.getStats()` (endpoint already exists)

Content:
- 4 stat numbers: Total / Active / Paused / Completed Executions
- Optional: near-depletion warnings via `agentCronJobService.getNearDepletion()`
- Small trend indicator (if historical data available)

### Widget 5: Recent Conversations

**Purpose**: Quick access to recent chat topics.
**Data**: Reuse existing `RecentTopic` data from home store

Content:
- List of last 5-8 recent topics
- Agent avatar + topic title + relative time
- Click -> navigate to `/agent/:aid` with topic

---

## Grid Layout

Desktop: 2-column grid
Responsive: 1-column on narrow screens

```
┌───────────────────┬───────────────────┐
│   Notes           │   Agent Output    │
│   (span: 1)       │   (span: 1)       │
├───────────────────┼───────────────────┤
│   Calendar        │   Cron Stats      │
│   (span: 1)       │   (span: 1)       │
├───────────────────┴───────────────────┤
│   Recent Conversations (span: 2)      │
└───────────────────────────────────────┘
```

Use CSS Grid: `grid-template-columns: repeat(2, 1fr)` with gap.

---

## Zustand Store

**Location**: `src/store/dashboard/`

State:
- `notes: string` - notes widget content
- `widgetVisibility: Record<string, boolean>` - which widgets are shown
- `widgetOrder: string[]` - widget display order (future: drag to reorder)

Persistence: `zustand/persist` with localStorage

Actions:
- `updateNotes(content: string)`
- `toggleWidget(widgetId: string)`

---

## Navigation Item

Add "Dashboard" to sidebar nav.
Icon: `LayoutDashboard` from `lucide-react`
Position: Near the top of nav, before or after the Home item.

---

## i18n Keys

Add to `src/locales/default/dashboard.ts`:
- `dashboard.title` - "Dashboard"
- `dashboard.widgets.notes.*` - Notes widget labels
- `dashboard.widgets.agentOutput.*` - Agent output labels
- `dashboard.widgets.calendar.*` - Calendar labels
- `dashboard.widgets.cronStats.*` - Stats labels
- `dashboard.widgets.recentConversations.*` - Recent conversations labels

---

## File Structure

```
src/app/[variants]/(main)/dashboard/
├── _layout/
│   └── index.tsx              # Layout with NavHeader
├── index.tsx                  # Dashboard page with widget grid
└── features/
    ├── DashboardWidgetCard.tsx # Base widget card component
    ├── NotesWidget.tsx         # Notes widget
    ├── AgentOutputWidget.tsx   # Agent output widget
    ├── CalendarWidget.tsx      # Calendar widget
    ├── CronStatsWidget.tsx     # Cron stats widget
    └── RecentConversationsWidget.tsx  # Recent conversations widget

src/store/dashboard/
├── index.ts
├── store.ts
└── initialState.ts
```
