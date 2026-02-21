'use client';

import { Empty, List } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MessageSquare } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { topicService } from '@/services/topic';

import DashboardWidgetCard from './DashboardWidgetCard';

dayjs.extend(relativeTime);

const RecentConversationsWidget = memo(() => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();

  const { data: topics, isLoading } = useSWR(
    'dashboardRecentTopics',
    async () => topicService.getRecentTopics(8),
    { revalidateOnFocus: false },
  );

  return (
    <DashboardWidgetCard
      icon={MessageSquare}
      loading={isLoading}
      span={2}
      title={t('widgets.recentConversations.title')}
    >
      {!topics || topics.length === 0 ? (
        <Empty
          description={t('widgets.recentConversations.empty')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
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
      )}
    </DashboardWidgetCard>
  );
});

RecentConversationsWidget.displayName = 'RecentConversationsWidget';

export default RecentConversationsWidget;
