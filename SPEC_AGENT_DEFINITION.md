# Spec: Agent Definition - Communication Channels

> Extend agent definition with communication channels for delivering agent output (cron results, notifications).

---

## Overview

Agents currently have: model, systemRole, tools/plugins, knowledge bases, skills, evals, cron jobs.

**Missing**: A way for agents to send output through configured channels. When a cron job runs, the result stays in a topic. Users want results pushed to external channels (email, webhook, Slack, etc.).

---

## Data Model

### New Schema: `agent_channels`

**File**: `packages/database/src/schemas/agentChannel.ts`

```
agent_channels
├── id              text PK
├── agent_id        text FK -> agents.id (cascade)
├── user_id         text FK -> users.id (cascade)
├── name            text              # "My Slack", "Team Webhook"
├── type            text              # enum: 'email', 'webhook', 'slack'
├── config          jsonb             # type-specific config (see below)
├── enabled         boolean           # default true
├── created_at      timestamp
├── updated_at      timestamp
```

### Channel Config by Type

**Email**:
```json
{
  "recipients": ["user@example.com"],
  "subject_template": "{{agent_name}} - {{job_name}} Report"
}
```

**Webhook**:
```json
{
  "url": "https://example.com/hook",
  "method": "POST",
  "headers": { "Authorization": "Bearer xxx" },
  "payload_format": "json"
}
```

**Slack**:
```json
{
  "webhook_url": "https://hooks.slack.com/services/xxx",
  "channel": "#reports",
  "username": "LobeBot"
}
```

### Link to Cron Jobs

Add optional `channel_id` to `agent_cron_jobs` table:

```sql
ALTER TABLE agent_cron_jobs
ADD COLUMN channel_id text REFERENCES agent_channels(id) ON DELETE SET NULL;
```

This is a Drizzle migration adding the column to the existing schema.

---

## Backend Stack

### DB Model: `AgentChannelModel`

**File**: `packages/database/src/models/agentChannel.ts`

Methods:
- `create(data)` - create a channel
- `findById(id)` - get by ID with user ownership check
- `findByAgentId(agentId)` - all channels for an agent
- `findByUserId()` - all channels for user
- `update(id, data)` - update config
- `delete(id)` - delete channel
- `findByType(type)` - filter by channel type

### TRPC Router: `agentChannelRouter`

**File**: `src/server/routers/lambda/agentChannel.ts`

Endpoints:
- `create` - mutation
- `findByAgent` - query
- `findById` - query
- `update` - mutation
- `delete` - mutation
- `list` - query (all user channels)
- `test` - mutation (send test message through channel)

### Client Service: `agentChannelService`

**File**: `src/services/agentChannel.ts`

Mirrors TRPC router methods.

### Types

**File**: `packages/types/src/agentChannel/index.ts`

- `ChannelType` enum: `'email' | 'webhook' | 'slack'`
- `EmailChannelConfig`, `WebhookChannelConfig`, `SlackChannelConfig` interfaces
- `ChannelConfig` union type
- `InsertAgentChannelSchema` - zod schema
- `UpdateAgentChannelSchema` - zod schema

---

## UI Components

### Agent Profile Page Addition

**Location**: `src/app/[variants]/(main)/agent/profile/features/`

Add a "Channels" section below the existing cron jobs section on the agent profile page:

```
┌─────────────────────────────────────┐
│ 📡 Communication Channels          │
│                                     │
│ ┌─────────┐ ┌─────────┐ ┌────────┐│
│ │ Email   │ │ Webhook │ │ Slack  ││
│ │ 2 setup │ │ 1 setup │ │ 0     ││
│ └─────────┘ └─────────┘ └────────┘│
│                                     │
│ [+ Add Channel]                     │
└─────────────────────────────────────┘
```

- Click card -> modal to edit channel config
- "+ Add Channel" -> modal with type selector + config form

### Cron Job Detail Page Addition

**Location**: `src/app/[variants]/(main)/agent/cron/[cronId]/`

Add channel selector below schedule config:

```
Delivery Channel: [ None ▼ ]
                   [ My Slack ]
                   [ Team Webhook ]
```

- Dropdown populated from `agentChannelService.getByAgentId(agentId)`
- Selection saved to `agentCronJobs.channelId`

---

## Channel Execution (Runtime)

**Integration point**: Where `AgentCronWorkflow` finishes execution (cloud layer).

After cron job execution completes:
1. Check if `channelId` is set on the job
2. Fetch channel config
3. Format output based on channel type
4. Send via appropriate transport (nodemailer, fetch, etc.)

This is a cloud/runtime concern and will be implemented as a post-execution hook.

---

## Tasks Breakdown

| # | Task | Depends On |
|---|------|------------|
| 3.1 | Create `agentChannel.ts` schema | - |
| 3.2 | Create `AgentChannelModel` | 3.1 |
| 3.3 | Create `agentChannelRouter` | 3.2 |
| 3.4 | Create `agentChannelService` | 3.3 |
| 3.5 | Add types to `@lobechat/types` | - |
| 3.6 | Add channel UI on agent profile | 3.4 |
| 3.7 | Add channel selector to cron detail page | 3.4, 3.9 |
| 3.8 | Build channel test functionality | 3.3 |
| 3.9 | Add `channelId` FK to `agentCronJobs` schema + migration | 3.1 |
| 3.10 | Add i18n keys | - |
| 3.11 | Implement channel execution in agent runtime | 3.2 |

---

## i18n Keys

Add to `src/locales/default/channels.ts`:
- `channels.title` - "Communication Channels"
- `channels.types.*` - type labels (Email, Webhook, Slack)
- `channels.form.*` - form field labels
- `channels.actions.*` - action labels (Add, Edit, Test, Delete)
- `channels.test.*` - test result messages

---

## File Structure

```
packages/database/src/schemas/agentChannel.ts     # Schema
packages/database/src/models/agentChannel.ts      # Model
packages/types/src/agentChannel/index.ts          # Types
src/server/routers/lambda/agentChannel.ts         # TRPC router
src/services/agentChannel.ts                      # Client service
src/app/[variants]/(main)/agent/profile/features/
├── AgentChannels/
│   ├── index.tsx                                 # Channel section
│   ├── ChannelCard.tsx                           # Single channel card
│   ├── ChannelFormModal.tsx                      # Create/edit modal
│   └── hooks/
│       └── useAgentChannels.ts                   # Data hook
src/locales/default/channels.ts                   # i18n
```
