'use client';

import { Flexbox } from '@lobehub/ui';
import { App, Button } from 'antd';
import { Pause, Play, Trash2 } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { agentCronJobService } from '@/services/agentCronJob';
import { useCronStore } from '@/store/cron';

const BulkActions = memo(() => {
  const { t } = useTranslation('cron');
  const { modal } = App.useApp();
  const [selectedIds, clearSelection] = useCronStore((s) => [s.selectedIds, s.clearSelection]);

  const handleBatchEnable = useCallback(async () => {
    await agentCronJobService.batchUpdateStatus(selectedIds, true);
    clearSelection();
  }, [selectedIds, clearSelection]);

  const handleBatchDisable = useCallback(async () => {
    await agentCronJobService.batchUpdateStatus(selectedIds, false);
    clearSelection();
  }, [selectedIds, clearSelection]);

  const handleBatchDelete = useCallback(() => {
    modal.confirm({
      content: t('actions.deleteConfirm'),
      okButtonProps: { danger: true },
      okText: t('actions.delete'),
      title: t('actions.deleteTitle'),
      onOk: async () => {
        for (const id of selectedIds) {
          await agentCronJobService.delete(id);
        }
        clearSelection();
      },
    });
  }, [selectedIds, clearSelection, modal, t]);

  if (selectedIds.length === 0) return null;

  return (
    <Flexbox align="center" gap={8} horizontal style={{ padding: '8px 0' }}>
      <span>{t('actions.selectedCount', { count: selectedIds.length })}</span>
      <Button icon={<Play size={14} />} size="small" onClick={handleBatchEnable}>
        {t('actions.batchEnable')}
      </Button>
      <Button icon={<Pause size={14} />} size="small" onClick={handleBatchDisable}>
        {t('actions.batchDisable')}
      </Button>
      <Button danger icon={<Trash2 size={14} />} size="small" onClick={handleBatchDelete}>
        {t('actions.batchDelete')}
      </Button>
    </Flexbox>
  );
});

BulkActions.displayName = 'BulkActions';

export default BulkActions;
