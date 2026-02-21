'use client';

import { Empty, List, Skeleton } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { lambdaClient } from '@/libs/trpc/client/lambda';

dayjs.extend(relativeTime);

interface CronExecutionHistoryProps {
  agentId: string;
  cronJobId: string;
}

const CronExecutionHistory = memo<CronExecutionHistoryProps>(({ agentId, cronJobId }) => {
  const { t } = useTranslation('cron');
  const navigate = useNavigate();

  const { data: groups, isLoading } = useSWR(
    agentId ? ['cronTopicsForJob', agentId, cronJobId] : null,
    async () => {
      const allGroups = await lambdaClient.topic.getCronTopicsGroupedByCronJob.query({ agentId });
      return allGroups.find((g) => g.cronJobId === cronJobId);
    },
    { revalidateOnFocus: false },
  );

  if (isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;

  const topics = groups?.topics || [];

  if (topics.length === 0) {
    return <Empty description={t('history.empty')} />;
  }

  return (
    <List
      dataSource={topics.slice(0, 10)}
      renderItem={(topic: any) => (
        <List.Item
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/agent/${agentId}`)}
        >
          <List.Item.Meta
            description={dayjs(topic.createdAt).fromNow()}
            title={topic.title || `Execution at ${dayjs(topic.createdAt).format('YYYY-MM-DD HH:mm')}`}
          />
        </List.Item>
      )}
      size="small"
    />
  );
});

CronExecutionHistory.displayName = 'CronExecutionHistory';

export default CronExecutionHistory;
