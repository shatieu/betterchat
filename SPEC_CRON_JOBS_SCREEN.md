# Spec: Cron Jobs Screen

> Global top-level screen at `/cron` for managing all scheduled agent tasks.

---

## Overview

A dedicated screen accessible from the main navigation that shows **all cron jobs across all agents** for the current user. The existing per-agent cron views in `/agent/:aid/cron/:cronId` and the agent sidebar remain untouched.

---

## Route & Layout

**Route**: `/cron`
**Router config**: Add to `desktopRouter.config.tsx` inside the main layout children array.

```
{
  children: [
    { index: true, element: <CronScreen /> },
    { path: ':cronId', element: <CronDetailPanel /> },  // optional detail sub-route
  ],
  element: <CronLayout />,
  path: 'cron',
}
```

**Layout**: `src/app/[variants]/(main)/cron/_layout/index.tsx`
- Uses `NavPanelPortal` to render a sidebar with filters
- Main area renders outlet (list or detail)

---

## Sidebar (NavPanelPortal)

Contents:
- **Search input** - filter by job name
- **Filter: Agent** - dropdown of user's agents, filter jobs by agent
- **Filter: Status** - All / Active / Paused / Depleted
- **Stats summary** - total jobs, active, paused (small counts)
- **"New Cron Job" button** - opens agent selector then navigates to `/agent/:aid/cron/new`

---

## Main Content: Cron Job List

**Data source**: `agentCronJobService.list()` (already supports pagination, filtering by agentId, enabled)

**List columns / card fields**:

| Field | Source | Notes |
|-------|--------|-------|
| Name | `cronJob.name` | Primary text |
| Agent | Join with agent data | Show agent avatar + title |
| Schedule | `cronJob.cronPattern` | Human-readable (e.g., "Daily at 09:00") |
| Status | `cronJob.enabled` + `remainingExecutions` | Badge: Active / Paused / Depleted |
| Last Run | `cronJob.lastExecutedAt` | Relative time (e.g., "2h ago") |
| Total Runs | `cronJob.totalExecutions` | Number |
| Actions | - | Edit, Enable/Disable toggle, Delete |

**Interactions**:
- Click row -> navigate to `/agent/:aid/cron/:cronId` (reuse existing detail page)
- Toggle switch -> `agentCronJobService.update(id, { enabled })` inline
- Delete -> confirm modal -> `agentCronJobService.delete(id)`
- Bulk select -> enable/disable/delete via `agentCronJobService.batchUpdateStatus()`

---

## Stats Summary Bar

Top of the list, using `agentCronJobService.getStats()` (endpoint exists):

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Total Jobs  │  Active      │  Paused      │  Executions  │
│     12       │     8        │     4        │    1,247     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Backend Changes Needed

| Item | Change | Exists? |
|------|--------|---------|
| List all user jobs | `AgentCronJobModel.findByUserId()` | Yes |
| List with pagination | `AgentCronJobModel.findWithPagination()` | Yes |
| Stats | `AgentCronJobModel.getExecutionStats()` | Yes |
| Batch update | `AgentCronJobModel.batchUpdateStatus()` | Yes |
| Agent info in list | Need to join agent name/avatar when listing | **New**: extend `findWithPagination` to join agent data |
| List TRPC with agent join | Return agent title + avatar alongside each job | **New**: add `listWithAgent` query or extend `list` |

---

## Zustand Store

**Option A**: New `src/store/cron/` store (recommended for isolation)
**Option B**: Add slice to `src/store/home/`

Store state:
- `filters: { agentId?: string; enabled?: boolean; search?: string }`
- `pagination: { offset: number; limit: number }`

Actions:
- `setFilter(key, value)` - update filters
- `useFetchCronJobs()` - SWR hook for paginated list
- `useFetchCronStats()` - SWR hook for stats

---

## Navigation Item

Add to sidebar footer or header nav. Follow the pattern of existing nav items (Memory, Resource, etc.).

Icon: `Clock` or `Timer` from `lucide-react`

---

## i18n Keys

Add to `src/locales/default/cron.ts`:
- `cron.title` - "Scheduled Tasks"
- `cron.stats.*` - stat labels
- `cron.list.*` - column headers, empty states
- `cron.filter.*` - filter labels
- `cron.actions.*` - action labels

---

## File Structure

```
src/app/[variants]/(main)/cron/
├── _layout/
│   ├── index.tsx           # Layout with NavPanelPortal
│   └── Sidebar/
│       ├── index.tsx        # Sidebar content
│       ├── Filters.tsx      # Filter controls
│       └── StatsBar.tsx     # Mini stats
├── index.tsx                # Main list page
└── features/
    ├── CronJobTable.tsx     # Table/list component
    ├── CronJobRow.tsx       # Single row
    ├── CronStatsBar.tsx     # Stats summary
    └── BulkActions.tsx      # Bulk action toolbar
```
