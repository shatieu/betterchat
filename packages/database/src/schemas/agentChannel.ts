/* eslint-disable sort-keys-fix/sort-keys-fix  */
import type { ChannelConfig } from '@lobechat/types';
import { boolean, index, jsonb, pgTable, text } from 'drizzle-orm/pg-core';

import { idGenerator } from '../utils/idGenerator';
import { timestamps } from './_helpers';
import { agents } from './agent';
import { users } from './user';

// Agent communication channels table
export const agentChannels = pgTable(
  'agent_channels',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('agentChannels'))
      .notNull(),

    // Foreign keys
    agentId: text('agent_id')
      .references(() => agents.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    // Channel identification
    name: text('name').notNull(),
    type: text('type').notNull(), // 'email' | 'webhook' | 'slack'

    // Type-specific configuration (stored as JSONB)
    config: jsonb('config').$type<ChannelConfig>().notNull(),

    // Status
    enabled: boolean('enabled').default(true),

    ...timestamps,
  },
  (t) => [
    index('agent_channels_agent_id_idx').on(t.agentId),
    index('agent_channels_user_id_idx').on(t.userId),
    index('agent_channels_type_idx').on(t.type),
  ],
);

// Type exports
export type NewAgentChannel = typeof agentChannels.$inferInsert;
export type AgentChannel = typeof agentChannels.$inferSelect;
