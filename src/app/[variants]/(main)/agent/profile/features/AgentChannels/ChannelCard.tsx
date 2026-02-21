'use client';

import { ActionIcon, Flexbox, Icon } from '@lobehub/ui';
import { Badge, Card, Col, Popconfirm, Row, Switch, Typography } from 'antd';
import { type LucideIcon, Mail, Send, Trash2, Webhook } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { type ChannelType } from '@lobechat/types';

const { Text } = Typography;

interface ChannelItem {
  config: any;
  enabled: boolean | null;
  id: string;
  name: string;
  type: string;
}

interface ChannelCardsProps {
  channels: ChannelItem[];
  loading?: boolean;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

const CHANNEL_TYPE_ICONS: Record<ChannelType, LucideIcon> = {
  email: Mail,
  slack: Send,
  webhook: Webhook,
};

const CHANNEL_TYPE_COLORS: Record<ChannelType, string> = {
  email: '#1890ff',
  slack: '#4A154B',
  webhook: '#52c41a',
};

const ChannelCards = memo<ChannelCardsProps>(
  ({ channels, loading, onDelete, onTest, onToggleEnabled }) => {
    const { t } = useTranslation('channels');

    return (
      <Row gutter={[12, 12]}>
        {channels.map((channel) => {
          const channelType = channel.type as ChannelType;
          const TypeIcon = CHANNEL_TYPE_ICONS[channelType] || Webhook;
          const color = CHANNEL_TYPE_COLORS[channelType] || '#666';

          return (
            <Col key={channel.id} lg={8} md={12} xs={24}>
              <Card
                loading={loading}
                size="small"
                style={{ height: '100%' }}
                extra={
                  <Flexbox horizontal align="center" gap={4}>
                    <ActionIcon
                      icon={Send}
                      size="small"
                      title={t('actions.test')}
                      onClick={() => onTest(channel.id)}
                    />
                    <Popconfirm
                      title={t('actions.deleteConfirm')}
                      onConfirm={() => onDelete(channel.id)}
                    >
                      <ActionIcon icon={Trash2} size="small" title={t('actions.delete')} />
                    </Popconfirm>
                  </Flexbox>
                }
                styles={{
                  actions: { marginTop: 0 },
                  body: { paddingBottom: 12, paddingTop: 8 },
                  header: {
                    borderBottom: 'none',
                    marginTop: '8px',
                    minHeight: 0,
                    paddingBottom: 0,
                  },
                }}
                title={
                  <Flexbox horizontal align="center" justify="space-between">
                    <Flexbox horizontal align="center" gap={8} style={{ flex: 1 }}>
                      <Icon color={color} icon={TypeIcon} size={14} />
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {channel.name}
                      </span>
                      <Badge status={channel.enabled ? 'success' : 'default'} />
                    </Flexbox>
                    <Switch
                      checked={channel.enabled || false}
                      size="small"
                      onChange={(checked) => onToggleEnabled(channel.id, checked)}
                    />
                  </Flexbox>
                }
              >
                <Flexbox gap={4}>
                  <Text style={{ fontSize: '12px' }} type="secondary">
                    {t(`types.${channelType}` as any)}
                  </Text>
                </Flexbox>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  },
);

ChannelCards.displayName = 'ChannelCards';

export default ChannelCards;
