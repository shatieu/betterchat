'use client';

import { Empty, List } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { topicService } from '@/services/topic';
import type { WidgetProps } from '@/types/widget';

dayjs.extend(relativeTime);

const RecentConversationsWidget = memo<WidgetProps>(({ size }) => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();

  const limit = size === 'large' ? 12 : size === 'wide' ? 8 : 5;

  const { data: topics } = useSWR(
    `dashboardRecentTopics-${limit}`,
    async () => topicService.getRecentTopics(limit),
    { revalidateOnFocus: false },
  );

  if (!topics || topics.length === 0) {
    return (
      <Empty
        description={t('widgets.recentConversations.empty')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <List
      dataSource={topics}
      renderItem={(topic: any) => (
        <List.Item
          style={{ cursor: 'pointer', padding: '6px 0' }}
          onClick={() => navigate(`/agent/${topic.sessionId || ''}`)}
        >
          <List.Item.Meta
            description={dayjs(topic.updatedAt || topic.createdAt).fromNow()}
            title={topic.title || 'Untitled'}
          />
        </List.Item>
      )}
      size="small"
    />
  );
});

RecentConversationsWidget.displayName = 'RecentConversationsWidget';

export default RecentConversationsWidget;
