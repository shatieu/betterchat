'use client';

import { Input } from 'antd';
import { StickyNote } from 'lucide-react';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useDashboardStore } from '@/store/dashboard';

import DashboardWidgetCard from './DashboardWidgetCard';

const { TextArea } = Input;

const NotesWidget = memo(() => {
  const { t } = useTranslation('dashboard');
  const [notes, updateNotes] = useDashboardStore((s) => [s.notes, s.updateNotes]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        updateNotes(value);
      }, 300);
    },
    [updateNotes],
  );

  return (
    <DashboardWidgetCard
      footer={t('widgets.notes.charCount', { count: notes.length })}
      icon={StickyNote}
      title={t('widgets.notes.title')}
    >
      <TextArea
        autoSize={{ maxRows: 8, minRows: 4 }}
        defaultValue={notes}
        placeholder={t('widgets.notes.placeholder')}
        onChange={handleChange}
      />
    </DashboardWidgetCard>
  );
});

NotesWidget.displayName = 'NotesWidget';

export default NotesWidget;
