'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { createStyles } from 'antd-style';

import { useDashboardStore } from '@/store/dashboard';

import AgentOutputWidget from './features/AgentOutputWidget';
import CalendarWidget from './features/CalendarWidget';
import CronStatsWidget from './features/CronStatsWidget';
import NotesWidget from './features/NotesWidget';
import RecentConversationsWidget from './features/RecentConversationsWidget';

const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  `,
}));

const DashboardScreen = memo(() => {
  const { t } = useTranslation('dashboard');
  const { styles } = useStyles();
  const widgetVisibility = useDashboardStore((s) => s.widgetVisibility);

  return (
    <Flexbox
      gap={16}
      style={{
        height: '100%',
        overflow: 'auto',
        padding: 24,
      }}
    >
      <h2 style={{ margin: 0 }}>{t('title')}</h2>
      <div className={styles.grid}>
        {widgetVisibility.notes && <NotesWidget />}
        {widgetVisibility.agentOutput && <AgentOutputWidget />}
        {widgetVisibility.calendar && <CalendarWidget />}
        {widgetVisibility.cronStats && <CronStatsWidget />}
        {widgetVisibility.recentConversations && <RecentConversationsWidget />}
      </div>
    </Flexbox>
  );
});

DashboardScreen.displayName = 'DashboardScreen';

export default DashboardScreen;
