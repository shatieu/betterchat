// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { agentChannels, agents, users } from '../../schemas';
import { LobeChatDatabase } from '../../type';
import { AgentChannelModel } from '../agentChannel';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'agent-channel-model-test-user-id';
const agentChannelModel = new AgentChannelModel(serverDB, userId);

let testAgentId: string;

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }]);

  // Create a test agent
  const [agent] = await serverDB
    .insert(agents)
    .values({ id: 'test-agent-for-channels', userId })
    .returning();
  testAgentId = agent.id;
});

afterEach(async () => {
  await serverDB.delete(agentChannels);
  await serverDB.delete(agents);
  await serverDB.delete(users).where(eq(users.id, userId));
});

describe('AgentChannelModel', () => {
  describe('create', () => {
    it('should create a new channel', async () => {
      const channel = await agentChannelModel.create({
        agentId: testAgentId,
        config: { url: 'https://example.com/hook' },
        name: 'Test Webhook',
        type: 'webhook',
      });

      expect(channel).toBeDefined();
      expect(channel.id).toBeDefined();
      expect(channel.name).toBe('Test Webhook');
      expect(channel.type).toBe('webhook');
      expect(channel.userId).toBe(userId);
    });

    it('should create an email channel', async () => {
      const channel = await agentChannelModel.create({
        agentId: testAgentId,
        config: { recipients: ['test@example.com'] },
        name: 'Test Email',
        type: 'email',
      });

      expect(channel.type).toBe('email');
      expect(channel.config).toMatchObject({ recipients: ['test@example.com'] });
    });

    it('should create a slack channel', async () => {
      const channel = await agentChannelModel.create({
        agentId: testAgentId,
        config: { channel: '#reports', webhookUrl: 'https://hooks.slack.com/services/test' },
        name: 'Test Slack',
        type: 'slack',
      });

      expect(channel.type).toBe('slack');
    });
  });

  describe('findById', () => {
    it('should find a channel by id', async () => {
      const created = await agentChannelModel.create({
        agentId: testAgentId,
        config: { url: 'https://example.com/hook' },
        name: 'Find Me',
        type: 'webhook',
      });

      const found = await agentChannelModel.findById(created.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const found = await agentChannelModel.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findByAgentId', () => {
    it('should find all channels for an agent', async () => {
      await agentChannelModel.create({
        agentId: testAgentId,
        config: { url: 'https://example.com/hook1' },
        name: 'Channel 1',
        type: 'webhook',
      });
      await agentChannelModel.create({
        agentId: testAgentId,
        config: { recipients: ['a@b.com'] },
        name: 'Channel 2',
        type: 'email',
      });

      const channels = await agentChannelModel.findByAgentId(testAgentId);
      expect(channels).toHaveLength(2);
    });
  });

  describe('findByUserId', () => {
    it('should find all channels for the user', async () => {
      await agentChannelModel.create({
        agentId: testAgentId,
        config: { url: 'https://example.com/hook' },
        name: 'User Channel',
        type: 'webhook',
      });

      const channels = await agentChannelModel.findByUserId();
      expect(channels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('findByType', () => {
    it('should find channels by type', async () => {
      await agentChannelModel.create({
        agentId: testAgentId,
        config: { url: 'https://example.com/hook' },
        name: 'Webhook Chan',
        type: 'webhook',
      });
      await agentChannelModel.create({
        agentId: testAgentId,
        config: { recipients: ['a@b.com'] },
        name: 'Email Chan',
        type: 'email',
      });

      const webhooks = await agentChannelModel.findByType('webhook');
      expect(webhooks.length).toBeGreaterThanOrEqual(1);
      expect(webhooks.every((ch) => ch.type === 'webhook')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a channel', async () => {
      const created = await agentChannelModel.create({
        agentId: testAgentId,
        config: { url: 'https://example.com/hook' },
        name: 'Original',
        type: 'webhook',
      });

      const updated = await agentChannelModel.update(created.id, {
        enabled: false,
        name: 'Updated',
      });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated');
      expect(updated!.enabled).toBe(false);
    });

    it('should return null when updating non-existent channel', async () => {
      const result = await agentChannelModel.update('non-existent', { name: 'test' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a channel', async () => {
      const created = await agentChannelModel.create({
        agentId: testAgentId,
        config: { url: 'https://example.com/hook' },
        name: 'To Delete',
        type: 'webhook',
      });

      const deleted = await agentChannelModel.delete(created.id);
      expect(deleted).toBe(true);

      const found = await agentChannelModel.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent channel', async () => {
      const deleted = await agentChannelModel.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });
});
