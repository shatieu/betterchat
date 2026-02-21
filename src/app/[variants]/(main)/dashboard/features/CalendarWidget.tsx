'use client';

import { Badge, Calendar } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { CalendarDays } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { type AgentCronJob } from '@/database/schemas/agentCronJob';
import { agentCronJobService } from '@/services/agentCronJob';

import DashboardWidgetCard from './DashboardWidgetCard';

// Simple cron pattern parser: extract day-of-week info for calendar dots
const getDaysWithJobs = (jobs: AgentCronJob[]): Set<string> => {
  // For simplicity, mark today and future dates for active jobs
  const days = new Set<string>();
  const now = dayjs();

  for (const job of jobs) {
    if (!job.enabled) continue;
    // Mark next 30 days as having potential executions
    for (let i = 0; i < 30; i++) {
      const date = now.add(i, 'day');
      const parts = job.cronPattern.split(' ');
      // If pattern has weekday restriction (5th field)
      if (parts.length >= 5 && parts[4] !== '*') {
        const weekdays = parts[4].split(',').map(Number);
        if (weekdays.includes(date.day())) {
          days.add(date.format('YYYY-MM-DD'));
        }
      } else {
        days.add(date.format('YYYY-MM-DD'));
      }
    }
  }
  return days;
};

const CalendarWidget = memo(() => {
  const { t } = useTranslation('dashboard');

  const { data: jobs, isLoading } = useSWR(
    'dashboardCalendarJobs',
    async () => {
      const result = await agentCronJobService.list({ enabled: true, limit: 100 });
      return result.data;
    },
    { revalidateOnFocus: false },
  );

  const daysWithJobs = useMemo(() => getDaysWithJobs(jobs || []), [jobs]);

  const dateCellRender = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    if (daysWithJobs.has(dateStr)) {
      return <Badge color="blue" dot />;
    }
    return null;
  };

  return (
    <DashboardWidgetCard icon={CalendarDays} loading={isLoading} title={t('widgets.calendar.title')}>
      <Calendar
        cellRender={(date, info) => {
          if (info.type === 'date') return dateCellRender(date);
          return null;
        }}
        fullscreen={false}
      />
    </DashboardWidgetCard>
  );
});

CalendarWidget.displayName = 'CalendarWidget';

export default CalendarWidget;
