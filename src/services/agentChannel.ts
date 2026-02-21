import { type ChannelConfig, type ChannelType } from '@lobechat/types';

import { lambdaClient } from '@/libs/trpc/client/lambda';

/**
 * Client-side service for Agent Channel operations
 */
class AgentChannelService {
  /**
   * Create a new channel
   */
  async create(data: {
    agentId: string;
    config: ChannelConfig;
    enabled?: boolean;
    name: string;
    type: ChannelType;
  }) {
    return await lambdaClient.agentChannel.create.mutate(data);
  }

  /**
   * Get channels for a specific agent
   */
  async getByAgentId(agentId: string) {
    return await lambdaClient.agentChannel.findByAgent.query({ agentId });
  }

  /**
   * Get a single channel by ID
   */
  async getById(id: string) {
    return await lambdaClient.agentChannel.findById.query({ id });
  }

  /**
   * List all channels for the user
   */
  async list() {
    return await lambdaClient.agentChannel.list.query();
  }

  /**
   * Update a channel
   */
  async update(
    id: string,
    data: Partial<{
      config: ChannelConfig;
      enabled: boolean;
      name: string;
      type: ChannelType;
    }>,
  ) {
    return await lambdaClient.agentChannel.update.mutate({ data, id });
  }

  /**
   * Delete a channel
   */
  async delete(id: string) {
    return await lambdaClient.agentChannel.delete.mutate({ id });
  }

  /**
   * Test a channel (send test message)
   */
  async test(id: string) {
    return await lambdaClient.agentChannel.test.mutate({ id });
  }
}

export const agentChannelService = new AgentChannelService();
