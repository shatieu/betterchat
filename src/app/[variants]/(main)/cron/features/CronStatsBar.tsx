'use client';

import { Flexbox } from '@lobehub/ui';
import { Skeleton, Statistic } from 'antd';
import { Activity, Clock, Pause, Play } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { createStyles } from 'antd-style';

import { useCronStore } from '@/store/cron';

const useStyles = createStyles(({ css, token }) => ({
  statsBar: css`
    display: flex;
    gap: 16px;
    padding: 16px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgLayout};
  `,
  statItem: css`
    flex: 1;
    padding: 12px 16px;
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorBgContainer};
  `,
}));

const CronStatsBar = memo(() => {
  const { t } = useTranslation('cron');
  const { styles } = useStyles();
  const { data: stats, isLoading } = useCronStore((s) => s.useFetchCronStats());

  if (isLoading) {
    return (
      <div className={styles.statsBar}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div className={styles.statItem} key={i}>
            <Skeleton.Input active size="small" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsBar}>
      <div className={styles.statItem}>
        <Statistic
          prefix={<Clock size={16} />}
          title={t('stats.total')}
          value={stats?.totalJobs ?? 0}
        />
      </div>
      <div className={styles.statItem}>
        <Statistic
          prefix={<Play size={16} />}
          title={t('stats.active')}
          value={stats?.activeJobs ?? 0}
          valueStyle={{ color: '#52c41a' }}
        />
      </div>
      <div className={styles.statItem}>
        <Statistic
          prefix={<Pause size={16} />}
          title={t('stats.paused')}
          value={stats?.pausedJobs ?? 0}
          valueStyle={{ color: '#faad14' }}
        />
      </div>
      <div className={styles.statItem}>
        <Statistic
          prefix={<Activity size={16} />}
          title={t('stats.executions')}
          value={stats?.totalExecutions ?? 0}
        />
      </div>
    </div>
  );
});

CronStatsBar.displayName = 'CronStatsBar';

export default CronStatsBar;
