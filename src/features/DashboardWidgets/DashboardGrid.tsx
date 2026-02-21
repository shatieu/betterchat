'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';

import { useDashboardStore } from '@/store/dashboard';

import WidgetContainer from './WidgetContainer';
import WidgetRuntime from './WidgetRuntime';
import { getWidget } from './widgetRegistry';

const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: minmax(200px, auto);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }
  `,
}));

interface DashboardGridProps {
  theme: 'light' | 'dark';
}

const DashboardGrid = memo<DashboardGridProps>(({ theme }) => {
  const { styles } = useStyles();
  const layout = useDashboardStore((s) => s.layout);

  return (
    <div className={styles.grid}>
      {layout.widgets.map((instance) => {
        const registration = getWidget(instance.widgetId);
        if (!registration) return null;

        return (
          <WidgetContainer
            instanceId={instance.instanceId}
            key={instance.instanceId}
            manifest={registration.manifest}
            size={instance.size}
          >
            <WidgetRuntime instance={instance} theme={theme} />
          </WidgetContainer>
        );
      })}
    </div>
  );
});

DashboardGrid.displayName = 'DashboardGrid';

export default DashboardGrid;
