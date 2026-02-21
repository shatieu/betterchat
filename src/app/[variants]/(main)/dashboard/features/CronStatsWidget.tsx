'use client';

import { Flexbox } from '@lobehub/ui';
import { Statistic } from 'antd';
import { Activity } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { agentCronJobService } from '@/services/agentCronJob';

import DashboardWidgetCard from './DashboardWidgetCard';

const CronStatsWidget = memo(() => {
  const { t } = useTranslation('dashboard');

  const { data: stats, isLoading } = useSWR(
    'dashboardCronStats',
    async () => {
      const result = await agentCronJobService.getStats();
      return result.data;
    },
    { revalidateOnFocus: false },
  );

  return (
    <DashboardWidgetCard icon={Activity} loading={isLoading} title={t('widgets.cronStats.title')}>
      <Flexbox gap={16} horizontal style={{ flexWrap: 'wrap' }}>
        <Statistic title={t('widgets.cronStats.total')} value={stats?.totalJobs ?? 0} />
        <Statistic
          title={t('widgets.cronStats.active')}
          value={stats?.activeJobs ?? 0}
          valueStyle={{ color: '#52c41a' }}
        />
        <Statistic
          title={t('widgets.cronStats.paused')}
          value={stats ? stats.totalJobs - stats.activeJobs : 0}
          valueStyle={{ color: '#faad14' }}
        />
        <Statistic
          title={t('widgets.cronStats.executions')}
          value={stats?.completedExecutions ?? 0}
        />
      </Flexbox>
    </DashboardWidgetCard>
  );
});

CronStatsWidget.displayName = 'CronStatsWidget';

export default CronStatsWidget;
