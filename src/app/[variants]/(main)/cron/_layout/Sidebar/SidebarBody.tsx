'use client';

import { Flexbox } from '@lobehub/ui';
import { Button, Input, Segmented, Select } from 'antd';
import { Plus } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useCronStore } from '@/store/cron';

const SidebarBody = memo(() => {
  const { t } = useTranslation('cron');
  const navigate = useNavigate();
  const [filters, setFilter] = useCronStore((s) => [s.filters, s.setFilter]);

  const statusOptions = useMemo(
    () => [
      { label: t('filter.statusAll'), value: 'all' },
      { label: t('filter.statusActive'), value: 'active' },
      { label: t('filter.statusPaused'), value: 'paused' },
    ],
    [t],
  );

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      setFilter('enabled', undefined);
    } else if (value === 'active') {
      setFilter('enabled', true);
    } else {
      setFilter('enabled', false);
    }
  };

  const currentStatus = filters.enabled === undefined ? 'all' : filters.enabled ? 'active' : 'paused';

  return (
    <Flexbox gap={12} paddingInline={8}>
      <Input
        allowClear
        placeholder={t('filter.search')}
        value={filters.search || ''}
        onChange={(e) => setFilter('search', e.target.value || undefined)}
      />
      <Segmented
        block
        options={statusOptions}
        value={currentStatus}
        onChange={handleStatusChange}
      />
      <Button
        block
        icon={<Plus size={16} />}
        type="primary"
        onClick={() => navigate('/cron')}
      >
        {t('actions.create')}
      </Button>
    </Flexbox>
  );
});

SidebarBody.displayName = 'CronSidebarBody';

export default SidebarBody;
