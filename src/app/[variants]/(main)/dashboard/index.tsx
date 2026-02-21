'use client';

import { Flexbox } from '@lobehub/ui';
import { Button } from 'antd';
import { Plus } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DashboardGrid, WidgetPicker, registerBuiltinWidgets } from '@/features/DashboardWidgets';
import { useIsDark } from '@/hooks/useIsDark';

const DashboardScreen = memo(() => {
  const { t } = useTranslation('dashboard');
  const isDark = useIsDark();
  const [pickerOpen, setPickerOpen] = useState(false);

  // Register built-in widgets on mount
  useEffect(() => {
    registerBuiltinWidgets();
  }, []);

  return (
    <Flexbox
      gap={16}
      style={{
        height: '100%',
        overflow: 'auto',
        padding: 24,
      }}
    >
      <Flexbox align="center" horizontal justify="space-between">
        <h2 style={{ margin: 0 }}>{t('title')}</h2>
        <Button
          icon={<Plus size={16} />}
          onClick={() => setPickerOpen(true)}
          type="default"
        >
          {t('widgetSystem.addWidget')}
        </Button>
      </Flexbox>
      <DashboardGrid theme={isDark ? 'dark' : 'light'} />
      <WidgetPicker onClose={() => setPickerOpen(false)} open={pickerOpen} />
    </Flexbox>
  );
});

DashboardScreen.displayName = 'DashboardScreen';

export default DashboardScreen;
