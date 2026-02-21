import { type ChannelConfig, type ChannelType } from '@lobechat/types';
import { message } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { agentChannelService } from '@/services/agentChannel';

export const useAgentChannels = (agentId?: string, enabled: boolean = true) => {
  const { t } = useTranslation('channels');

  const {
    data: channels,
    error,
    isLoading: loading,
    mutate,
  } = useSWR(
    enabled && agentId ? `/api/agent-channels/${agentId}` : null,
    enabled && agentId ? () => agentChannelService.getByAgentId(agentId) : null,
    {
      onError: (error) => {
        console.error('Failed to fetch channels:', error);
      },
    },
  );

  const createChannel = useCallback(
    async (data: { config: ChannelConfig; enabled?: boolean; name: string; type: ChannelType }) => {
      if (!agentId) return;

      try {
        const result = await agentChannelService.create({
          ...data,
          agentId,
        });

        if (result.success) {
          message.success(t('test.success'));
          await mutate();
          return result.data;
        }
      } catch (error) {
        console.error('Failed to create channel:', error);
        message.error(t('test.error'));
        throw error;
      }
    },
    [agentId, mutate, t],
  );

  const updateChannel = useCallback(
    async (
      id: string,
      data: Partial<{ config: ChannelConfig; enabled: boolean; name: string; type: ChannelType }>,
    ) => {
      try {
        const result = await agentChannelService.update(id, data);

        if (result.success) {
          await mutate();
          return result.data;
        }
      } catch (error) {
        console.error('Failed to update channel:', error);
        throw error;
      }
    },
    [mutate],
  );

  const deleteChannel = useCallback(
    async (id: string) => {
      try {
        const result = await agentChannelService.delete(id);

        if (result.success) {
          await mutate();
        }
      } catch (error) {
        console.error('Failed to delete channel:', error);
        throw error;
      }
    },
    [mutate],
  );

  const testChannel = useCallback(
    async (id: string) => {
      try {
        const result = await agentChannelService.test(id);

        if (result.success) {
          message.success(t('test.success'));
        }
      } catch (error) {
        console.error('Failed to test channel:', error);
        message.error(t('test.error'));
        throw error;
      }
    },
    [t],
  );

  return {
    channels: channels?.data || [],
    createChannel,
    deleteChannel,
    error,
    loading,
    refetch: mutate,
    testChannel,
    updateChannel,
  };
};
