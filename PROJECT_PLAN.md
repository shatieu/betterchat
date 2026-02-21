# Project Plan

> Master plan document for new features. Each task is tracked with a status checkbox.
> Detailed specs are in separate files linked below.

---

## Current State Summary

### What Exists

| Layer | Component | Status |
|-------|-----------|--------|
| **DB Schema** | `agentCronJobs` table (pattern, timezone, executions, conditions) | Done |
| **DB Model** | `AgentCronJobModel` - full CRUD, pagination, stats, batch ops | Done |
| **TRPC Router** | `agentCronJobRouter` - 9 endpoints (create, update, delete, list, findByAgent, findById, getStats, getNearDepletion, batchUpdateStatus, resetExecutions) | Done |
| **Client Service** | `agentCronJobService` - mirrors all router endpoints | Done |
| **Zustand Store** | `agent/slices/cron` - create job, fetch cron topics with job info | Done |
| **Types** | `@lobechat/types` - InsertAgentCronJob, UpdateAgentCronJob, ExecutionConditions schemas | Done |
| **UI - Detail Page** | `/agent/:aid/cron/:cronId` - full edit page with schedule config, content editor, auto-save | Done |
| **UI - Sidebar** | Cron topic list in agent sidebar with accordion groups | Done |
| **UI - Profile Cards** | CronJobCards on agent profile page | Done |
| **Agent Definition** | Schema (model, systemRole, tools, plugins, knowledge bases, skills, evals), profile editor | Done |
| **Home Screen** | Welcome, InputArea, RecentTopic, RecentPage, CommunityAgents, RecentResource | Done |

### What Is Missing

| Feature | Gap |
|---------|-----|
| **Cron Jobs Screen** | No global top-level screen to view/manage all cron jobs across agents |
| **Cron Execution Engine** | `AgentCronWorkflow` referenced but lives in cloud layer; no local scheduler |
| **Dashboard Screen** | No `/dashboard` route; Home is a landing page, not a widget dashboard |
| **Communication Channels** | No schema, service, or UI for agent output channels (email, webhook, Slack, etc.) |

---

## Feature 1: Cron Jobs Screen

> Spec: [`SPEC_CRON_JOBS_SCREEN.md`](./SPEC_CRON_JOBS_SCREEN.md)

A new top-level `/cron` screen showing all cron jobs across all agents, while keeping the existing per-agent cron views intact.

### Tasks

- [ ] **1.1** Add `/cron` route in `desktopRouter.config.tsx` with layout component
- [ ] **1.2** Create `CronLayout` component (`src/app/[variants]/(main)/cron/_layout/`)
- [ ] **1.3** Create `CronScreen` index page with list/table of all user cron jobs
- [ ] **1.4** Add nav item to sidebar footer or header for "Cron Jobs" (`NavPanel`)
- [ ] **1.5** Create `NavPanelPortal` sidebar for cron screen (filter by agent, status, search)
- [ ] **1.6** Build cron job list component with columns: name, agent, schedule, status, last run, next run, actions
- [ ] **1.7** Add cron job detail drawer/panel (reuse existing `CronJobDetailPage` components)
- [ ] **1.8** Add global cron stats summary bar (active, paused, total, completed executions)
- [ ] **1.9** Add bulk actions (enable/disable/delete selected)
- [ ] **1.10** Add "Create Cron Job" flow with agent selector
- [ ] **1.11** Add i18n keys for cron screen (`src/locales/default/cron.ts`)
- [ ] **1.12** Create zustand store slice or extend home store for global cron state
- [ ] **1.13** Add cron execution history view (topic list per job, expandable)

---

## Feature 2: Dashboard Screen

> Spec: [`SPEC_DASHBOARD_SCREEN.md`](./SPEC_DASHBOARD_SCREEN.md)

A new `/dashboard` route with card-style widgets. The existing Home screen remains unchanged.

### Tasks

- [ ] **2.1** Add `/dashboard` route in `desktopRouter.config.tsx` with layout component
- [ ] **2.2** Create `DashboardLayout` component (`src/app/[variants]/(main)/dashboard/_layout/`)
- [ ] **2.3** Create `DashboardScreen` index page with widget grid
- [ ] **2.4** Add nav item for "Dashboard" in sidebar
- [ ] **2.5** Build `DashboardWidgetCard` base component (title, icon, body, footer)
- [ ] **2.6** Build widget: **Notes** - quick text notes with local persistence
- [ ] **2.7** Build widget: **Agent Output** - latest cron job execution results (last N outputs)
- [ ] **2.8** Build widget: **Calendar** - upcoming scheduled cron jobs shown on mini-calendar
- [ ] **2.9** Build widget: **Cron Stats** - active/paused/total jobs, execution counts
- [ ] **2.10** Build widget: **Recent Conversations** - last N chat topics across agents
- [ ] **2.11** Add i18n keys for dashboard (`src/locales/default/dashboard.ts`)
- [ ] **2.12** Create zustand store for dashboard state (widget preferences, notes data)
- [ ] **2.13** Wire widgets to existing TRPC endpoints and services

---

## Feature 3: Agent Definition - Communication Channels

> Spec: [`SPEC_AGENT_DEFINITION.md`](./SPEC_AGENT_DEFINITION.md)

Extend agent definition with communication channels so agents can send output through configured channels (email, webhook, Slack, etc.), especially useful for cron job results.

### Tasks

- [ ] **3.1** Design and create `agent_channels` DB schema (Drizzle)
- [ ] **3.2** Create DB model `AgentChannelModel` with CRUD operations
- [ ] **3.3** Create TRPC router `agentChannelRouter` with endpoints
- [ ] **3.4** Create client service `agentChannelService`
- [ ] **3.5** Add `@lobechat/types` definitions for channel types (email, webhook, slack)
- [ ] **3.6** Add channel configuration UI on agent profile page
- [ ] **3.7** Add channel selector to cron job detail page (which channel to send output to)
- [ ] **3.8** Build channel test/preview functionality
- [ ] **3.9** Link channels to cron job schema (`channelId` foreign key on `agentCronJobs`)
- [ ] **3.10** Add i18n keys for channels (`src/locales/default/channels.ts`)
- [ ] **3.11** Create channel execution logic in agent runtime

---

## Implementation Order

Recommended sequence based on dependencies:

```
Phase 1: Cron Jobs Screen (1.1 - 1.13)
  - Foundation for global visibility into scheduled tasks
  - No new schemas needed; builds on existing backend

Phase 2: Dashboard Screen (2.1 - 2.13)
  - Depends on cron stats endpoints (already exist)
  - Agent Output widget benefits from cron screen being done first

Phase 3: Communication Channels (3.1 - 3.11)
  - New schema + backend work
  - Integration with existing cron job and agent systems
```

---

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Routing | SPA routes via `react-router-dom` in `desktopRouter.config.tsx` | Consistent with all other screens |
| State | Zustand slices per feature | Follows existing pattern (home, agent, chat stores) |
| Data fetching | SWR + TRPC lambdaClient | Consistent with cron job service, topic service, etc. |
| Nav | `NavPanelPortal` for sidebars, nav items in `SideBarLayout` footer | Same pattern as memory, resource, settings |
| UI components | `@lobehub/ui` + antd + antd-style | Project standard |
| i18n | Keys in `src/locales/default/`, translations in `locales/zh-CN/` and `locales/en-US/` | CLAUDE.md convention |

---

## File Locations Reference

```
src/app/[variants]/(main)/cron/              # NEW - Cron Jobs screen
src/app/[variants]/(main)/dashboard/         # NEW - Dashboard screen
src/store/cron/                              # NEW - Global cron store (or extend home)
src/store/dashboard/                         # NEW - Dashboard store
packages/database/src/schemas/agentChannel.ts   # NEW - Channel schema
packages/database/src/models/agentChannel.ts    # NEW - Channel model
src/server/routers/lambda/agentChannel.ts       # NEW - Channel router
src/services/agentChannel.ts                    # NEW - Channel client service
src/locales/default/cron.ts                     # NEW - Cron i18n
src/locales/default/dashboard.ts                # NEW - Dashboard i18n
src/locales/default/channels.ts                 # NEW - Channels i18n
```
