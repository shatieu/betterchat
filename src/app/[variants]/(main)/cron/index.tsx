'use client';

import { Flexbox } from '@lobehub/ui';
import { App } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import BulkActions from './features/BulkActions';
import CronJobTable from './features/CronJobTable';
import CronStatsBar from './features/CronStatsBar';

const CronScreen = memo(() => {
  const { t } = useTranslation('cron');

  return (
    <App>
      <Flexbox
        gap={16}
        style={{
          height: '100%',
          overflow: 'auto',
          padding: 24,
        }}
      >
        <h2 style={{ margin: 0 }}>{t('title')}</h2>
        <CronStatsBar />
        <BulkActions />
        <CronJobTable />
      </Flexbox>
    </App>
  );
});

CronScreen.displayName = 'CronScreen';

export default CronScreen;
