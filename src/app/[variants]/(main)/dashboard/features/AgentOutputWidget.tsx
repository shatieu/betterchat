'use client';

import { Empty, List } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bot } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { lambdaClient } from '@/libs/trpc/client/lambda';
import { agentCronJobService } from '@/services/agentCronJob';

import DashboardWidgetCard from './DashboardWidgetCard';

dayjs.extend(relativeTime);

const AgentOutputWidget = memo(() => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();

  const { data: jobs, isLoading } = useSWR(
    'dashboardAgentOutput',
    async () => {
      const result = await agentCronJobService.list({ limit: 5 });
      return result.data;
    },
    { revalidateOnFocus: false },
  );

  return (
    <DashboardWidgetCard
      icon={Bot}
      loading={isLoading}
      title={t('widgets.agentOutput.title')}
    >
      {!jobs || jobs.length === 0 ? (
        <Empty description={t('widgets.agentOutput.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={jobs}
          renderItem={(job: any) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '8px 0' }}
              onClick={() => navigate(`/agent/${job.agentId}/cron/${job.id}`)}
            >
              <List.Item.Meta
                description={
                  job.lastExecutedAt
                    ? dayjs(job.lastExecutedAt).fromNow()
                    : t('widgets.agentOutput.empty')
                }
                title={job.name || `Job ${job.id.slice(0, 8)}`}
              />
            </List.Item>
          )}
          size="small"
        />
      )}
    </DashboardWidgetCard>
  );
});

AgentOutputWidget.displayName = 'AgentOutputWidget';

export default AgentOutputWidget;
