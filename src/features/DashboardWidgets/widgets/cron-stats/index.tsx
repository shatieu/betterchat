'use client';

import { Flexbox } from '@lobehub/ui';
import { Statistic } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { agentCronJobService } from '@/services/agentCronJob';
import type { WidgetProps } from '@/types/widget';

const CronStatsWidget = memo<WidgetProps>(({ size }) => {
  const { t } = useTranslation('dashboard');

  const { data: stats } = useSWR(
    'dashboardCronStats',
    async () => {
      const result = await agentCronJobService.getStats();
      return result.data;
    },
    { revalidateOnFocus: false },
  );

  if (size === 'small') {
    return (
      <Flexbox align="center" gap={4}>
        <Statistic title={t('widgets.cronStats.active')} value={stats?.activeJobs ?? 0} />
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={16} horizontal style={{ flexWrap: 'wrap' }}>
      <Statistic title={t('widgets.cronStats.total')} value={stats?.totalJobs ?? 0} />
      <Statistic
        title={t('widgets.cronStats.active')}
        value={stats?.activeJobs ?? 0}
        valueStyle={{ color: '#52c41a' }}
      />
      <Statistic
        title={t('widgets.cronStats.paused')}
        value={stats?.pausedJobs ?? 0}
        valueStyle={{ color: '#faad14' }}
      />
      <Statistic
        title={t('widgets.cronStats.executions')}
        value={stats?.totalExecutions ?? 0}
      />
    </Flexbox>
  );
});

CronStatsWidget.displayName = 'CronStatsWidget';

export default CronStatsWidget;
