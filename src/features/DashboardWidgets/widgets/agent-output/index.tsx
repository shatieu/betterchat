'use client';

import { Empty, List } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { agentCronJobService } from '@/services/agentCronJob';
import type { WidgetProps } from '@/types/widget';

dayjs.extend(relativeTime);

const AgentOutputWidget = memo<WidgetProps>(({ size }) => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();

  const limit = size === 'large' ? 10 : 5;

  const { data: jobs } = useSWR(
    `dashboardAgentOutput-${limit}`,
    async () => {
      const result = await agentCronJobService.list({ limit });
      return result.data;
    },
    { revalidateOnFocus: false },
  );

  if (!jobs || jobs.length === 0) {
    return <Empty description={t('widgets.agentOutput.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
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
  );
});

AgentOutputWidget.displayName = 'AgentOutputWidget';

export default AgentOutputWidget;
