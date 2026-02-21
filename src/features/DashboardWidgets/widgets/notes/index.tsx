'use client';

import { Input } from 'antd';
import { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useDashboardStore } from '@/store/dashboard';
import type { WidgetProps } from '@/types/widget';

const { TextArea } = Input;

const NotesWidget = memo<WidgetProps>(({ size, emit }) => {
  const { t } = useTranslation('dashboard');
  const [notes, updateNotes] = useDashboardStore((s) => [s.notes, s.updateNotes]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        updateNotes(value);
        emit('notes-updated', { content: value });
      }, 300);
    },
    [updateNotes, emit],
  );

  const maxRows = size === 'small' ? 3 : size === 'large' ? 12 : 6;
  const minRows = size === 'small' ? 2 : size === 'large' ? 6 : 4;

  return (
    <TextArea
      autoSize={{ maxRows, minRows }}
      defaultValue={notes}
      placeholder={t('widgets.notes.placeholder')}
      onChange={handleChange}
    />
  );
});

NotesWidget.displayName = 'NotesWidget';

export default NotesWidget;
