'use client';

import { Flexbox } from '@lobehub/ui';
import { Button, Typography } from 'antd';
import { Radio } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type ChannelConfig, type ChannelType } from '@lobechat/types';
import { useAgentStore } from '@/store/agent';
import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';

import ChannelCards from './ChannelCard';
import ChannelFormModal from './ChannelFormModal';
import { useAgentChannels } from './hooks/useAgentChannels';

const { Title } = Typography;

const AgentChannels = memo(() => {
  const { t } = useTranslation('channels');
  const agentId = useAgentStore((s) => s.activeAgentId);
  const enableBusinessFeatures = useServerConfigStore(serverConfigSelectors.enableBusinessFeatures);
  const [modalOpen, setModalOpen] = useState(false);

  const { channels, loading, createChannel, deleteChannel, testChannel, updateChannel } =
    useAgentChannels(agentId, enableBusinessFeatures);

  const handleCreate = useCallback(
    async (data: { config: ChannelConfig; enabled: boolean; name: string; type: ChannelType }) => {
      await createChannel(data);
    },
    [createChannel],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteChannel(id);
    },
    [deleteChannel],
  );

  const handleTest = useCallback(
    async (id: string) => {
      await testChannel(id);
    },
    [testChannel],
  );

  const handleToggleEnabled = useCallback(
    async (id: string, enabled: boolean) => {
      await updateChannel(id, { enabled });
    },
    [updateChannel],
  );

  if (!enableBusinessFeatures) return null;
  if (!agentId) return null;

  return (
    <Flexbox gap={12} style={{ marginBottom: 16, marginTop: 16 }}>
      <Flexbox horizontal align="center" justify="space-between">
        <Title level={5} style={{ margin: 0 }}>
          <Flexbox horizontal align="center" gap={8}>
            <Radio size={16} />
            {t('title')}
          </Flexbox>
        </Title>
        <Button size="small" type="primary" onClick={() => setModalOpen(true)}>
          {t('actions.add')}
        </Button>
      </Flexbox>

      {channels.length > 0 && (
        <ChannelCards
          channels={channels}
          loading={loading}
          onDelete={handleDelete}
          onTest={handleTest}
          onToggleEnabled={handleToggleEnabled}
        />
      )}

      <ChannelFormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </Flexbox>
  );
});

export default AgentChannels;
