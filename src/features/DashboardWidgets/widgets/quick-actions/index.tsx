'use client';

import { Flexbox } from '@lobehub/ui';
import { Button } from 'antd';
import { Bot, MessageSquarePlus, Settings, Timer } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { WidgetProps } from '@/types/widget';

const QuickActionsWidget = memo<WidgetProps>(({ size }) => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();

  const actions = [
    {
      icon: <MessageSquarePlus size={16} />,
      key: 'new-chat',
      label: t('widgetSystem.quickActions.newChat'),
      onClick: () => navigate('/'),
    },
    {
      icon: <Bot size={16} />,
      key: 'agents',
      label: t('widgetSystem.quickActions.agents'),
      onClick: () => navigate('/community/agent'),
    },
    {
      icon: <Timer size={16} />,
      key: 'cron',
      label: t('widgetSystem.quickActions.cron'),
      onClick: () => navigate('/cron'),
    },
    {
      icon: <Settings size={16} />,
      key: 'settings',
      label: t('widgetSystem.quickActions.settings'),
      onClick: () => navigate('/settings'),
    },
  ];

  const visibleActions = size === 'small' ? actions.slice(0, 2) : actions;

  return (
    <Flexbox gap={8} horizontal={size !== 'small'} style={{ flexWrap: 'wrap' }}>
      {visibleActions.map((action) => (
        <Button
          block={size === 'small'}
          icon={action.icon}
          key={action.key}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </Flexbox>
  );
});

QuickActionsWidget.displayName = 'QuickActionsWidget';

export default QuickActionsWidget;
