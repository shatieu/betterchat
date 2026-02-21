import { describe, expect, it, vi } from 'vitest';

// Mock the lambda client
vi.mock('@/libs/trpc/client/lambda', () => ({
  lambdaClient: {
    agentChannel: {
      create: { mutate: vi.fn().mockResolvedValue({ data: { id: 'ch_test' }, success: true }) },
      delete: { mutate: vi.fn().mockResolvedValue({ success: true }) },
      findByAgent: {
        query: vi.fn().mockResolvedValue({ data: [{ id: 'ch_1' }, { id: 'ch_2' }], success: true }),
      },
      findById: { query: vi.fn().mockResolvedValue({ data: { id: 'ch_1' }, success: true }) },
      list: { query: vi.fn().mockResolvedValue({ data: [], success: true }) },
      test: { mutate: vi.fn().mockResolvedValue({ success: true }) },
      update: {
        mutate: vi.fn().mockResolvedValue({ data: { id: 'ch_1', name: 'Updated' }, success: true }),
      },
    },
  },
}));

import { agentChannelService } from './agentChannel';

describe('AgentChannelService', () => {
  it('should create a channel', async () => {
    const result = await agentChannelService.create({
      agentId: 'agt_test',
      config: { url: 'https://example.com/hook' },
      name: 'Test',
      type: 'webhook',
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('ch_test');
  });

  it('should get channels by agent id', async () => {
    const result = await agentChannelService.getByAgentId('agt_test');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('should get channel by id', async () => {
    const result = await agentChannelService.getById('ch_1');

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('ch_1');
  });

  it('should list all channels', async () => {
    const result = await agentChannelService.list();

    expect(result.success).toBe(true);
  });

  it('should update a channel', async () => {
    const result = await agentChannelService.update('ch_1', { name: 'Updated' });

    expect(result.success).toBe(true);
  });

  it('should delete a channel', async () => {
    const result = await agentChannelService.delete('ch_1');

    expect(result.success).toBe(true);
  });

  it('should test a channel', async () => {
    const result = await agentChannelService.test('ch_1');

    expect(result.success).toBe(true);
  });
});
