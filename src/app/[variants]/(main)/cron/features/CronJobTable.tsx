'use client';

import { Flexbox } from '@lobehub/ui';
import { App, Badge, Button, Checkbox, Empty, Skeleton, Switch, Table } from 'antd';
import { type ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Edit3, Trash2 } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { type AgentCronJob } from '@/database/schemas/agentCronJob';
import { agentCronJobService } from '@/services/agentCronJob';
import { useCronStore } from '@/store/cron';

dayjs.extend(relativeTime);

const getStatusBadge = (job: AgentCronJob) => {
  if (!job.enabled) return { color: 'orange' as const, text: 'Paused' };
  if (job.remainingExecutions !== null && job.remainingExecutions <= 0)
    return { color: 'red' as const, text: 'Depleted' };
  return { color: 'green' as const, text: 'Active' };
};

const CronJobTable = memo(() => {
  const { t } = useTranslation('cron');
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const [selectedIds, toggleSelection, selectAll, clearSelection] = useCronStore((s) => [
    s.selectedIds,
    s.toggleSelection,
    s.selectAll,
    s.clearSelection,
  ]);
  const { data: result, isLoading, mutate } = useCronStore((s) => s.useFetchCronJobs());

  const jobs = result?.data || [];

  const handleToggleEnabled = useCallback(
    async (id: string, enabled: boolean) => {
      await agentCronJobService.update(id, { enabled });
      mutate();
    },
    [mutate],
  );

  const handleDelete = useCallback(
    (id: string) => {
      modal.confirm({
        content: t('actions.deleteConfirm'),
        okButtonProps: { danger: true },
        okText: t('actions.delete'),
        title: t('actions.deleteTitle'),
        onOk: async () => {
          await agentCronJobService.delete(id);
          mutate();
        },
      });
    },
    [modal, t, mutate],
  );

  const columns: ColumnsType<AgentCronJob> = useMemo(
    () => [
      {
        dataIndex: 'selection',
        key: 'selection',
        render: (_: unknown, record: AgentCronJob) => (
          <Checkbox
            checked={selectedIds.includes(record.id)}
            onChange={() => toggleSelection(record.id)}
          />
        ),
        title: (
          <Checkbox
            checked={jobs.length > 0 && selectedIds.length === jobs.length}
            indeterminate={selectedIds.length > 0 && selectedIds.length < jobs.length}
            onChange={(e) => {
              if (e.target.checked) {
                selectAll(jobs.map((j) => j.id));
              } else {
                clearSelection();
              }
            }}
          />
        ),
        width: 48,
      },
      {
        dataIndex: 'name',
        key: 'name',
        render: (name: string, record: AgentCronJob) => (
          <a onClick={() => navigate(`/agent/${record.agentId}/cron/${record.id}`)}>
            {name || `Cron Job ${record.id.slice(0, 8)}`}
          </a>
        ),
        title: t('list.name'),
      },
      {
        dataIndex: 'cronPattern',
        key: 'cronPattern',
        title: t('list.cronPattern'),
        width: 160,
      },
      {
        dataIndex: 'status',
        key: 'status',
        render: (_: unknown, record: AgentCronJob) => {
          const status = getStatusBadge(record);
          return <Badge color={status.color} text={t(`status.${status.text.toLowerCase()}`)} />;
        },
        title: t('list.status'),
        width: 120,
      },
      {
        dataIndex: 'lastExecutedAt',
        key: 'lastExecutedAt',
        render: (val: string | null) =>
          val ? dayjs(val).fromNow() : t('list.never'),
        title: t('list.lastRun'),
        width: 140,
      },
      {
        dataIndex: 'totalExecutions',
        key: 'totalExecutions',
        title: t('list.totalRuns'),
        width: 100,
      },
      {
        key: 'actions',
        render: (_: unknown, record: AgentCronJob) => (
          <Flexbox gap={4} horizontal>
            <Switch
              checked={record.enabled ?? false}
              size="small"
              onChange={(checked) => handleToggleEnabled(record.id, checked)}
            />
            <Button
              icon={<Edit3 size={14} />}
              size="small"
              type="text"
              onClick={() => navigate(`/agent/${record.agentId}/cron/${record.id}`)}
            />
            <Button
              danger
              icon={<Trash2 size={14} />}
              size="small"
              type="text"
              onClick={() => handleDelete(record.id)}
            />
          </Flexbox>
        ),
        title: t('list.actions'),
        width: 160,
      },
    ],
    [t, selectedIds, jobs, toggleSelection, selectAll, clearSelection, navigate, handleToggleEnabled, handleDelete],
  );

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (jobs.length === 0) {
    return (
      <Empty description={t('list.empty')}>
        <p>{t('list.emptyDescription')}</p>
      </Empty>
    );
  }

  return (
    <Table<AgentCronJob>
      columns={columns}
      dataSource={jobs}
      pagination={
        result?.pagination
          ? {
              current: Math.floor(result.pagination.offset / result.pagination.limit) + 1,
              pageSize: result.pagination.limit,
              total: result.pagination.total,
              onChange: (page, pageSize) => {
                useCronStore.getState().setPage((page - 1) * pageSize);
              },
            }
          : false
      }
      rowKey="id"
      size="middle"
    />
  );
});

CronJobTable.displayName = 'CronJobTable';

export default CronJobTable;
