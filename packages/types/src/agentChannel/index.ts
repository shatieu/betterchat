import { z } from 'zod';

// Channel type enum
export type ChannelType = 'email' | 'webhook' | 'slack';

// Type-specific config interfaces
export interface EmailChannelConfig {
  recipients: string[];
  subjectTemplate?: string;
}

export interface WebhookChannelConfig {
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT';
  payloadFormat?: 'json' | 'text';
  url: string;
}

export interface SlackChannelConfig {
  channel?: string;
  username?: string;
  webhookUrl: string;
}

// Union type for channel config
export type ChannelConfig = EmailChannelConfig | SlackChannelConfig | WebhookChannelConfig;

// Zod schemas for validation
export const EmailChannelConfigSchema = z.object({
  recipients: z.array(z.string().email()),
  subjectTemplate: z.string().optional(),
});

export const WebhookChannelConfigSchema = z.object({
  headers: z.record(z.string(), z.string()).optional(),
  method: z.enum(['GET', 'POST', 'PUT']).optional().default('POST'),
  payloadFormat: z.enum(['json', 'text']).optional().default('json'),
  url: z.string().url(),
});

export const SlackChannelConfigSchema = z.object({
  channel: z.string().optional(),
  username: z.string().optional(),
  webhookUrl: z.string().url(),
});

export const ChannelConfigSchema = z.union([
  EmailChannelConfigSchema,
  WebhookChannelConfigSchema,
  SlackChannelConfigSchema,
]);

// Insert schema for creating channels
export const InsertAgentChannelSchema = z.object({
  agentId: z.string(),
  config: z.record(z.string(), z.any()),
  enabled: z.boolean().optional().default(true),
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(['email', 'webhook', 'slack']),
  userId: z.string().optional(),
});

// Update schema (all fields optional except id)
export const UpdateAgentChannelSchema = InsertAgentChannelSchema.partial().omit({
  agentId: true,
  userId: true,
});

// Type exports
export type InsertAgentChannel = z.infer<typeof InsertAgentChannelSchema>;
export type UpdateAgentChannel = z.infer<typeof UpdateAgentChannelSchema>;
