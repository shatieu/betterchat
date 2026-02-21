'use client';

import { createStyles } from 'antd-style';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { useDashboardStore } from '@/store/dashboard';

import { type BentoPlacement, computeBentoLayout, computeGridRows } from './bentoLayout';
import WidgetContainer from './WidgetContainer';
import WidgetRuntime from './WidgetRuntime';
import { getWidget } from './widgetRegistry';

// ---- Breakpoints ----
const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1024;

const getColumnsForWidth = (width: number): number => {
  if (width <= BREAKPOINT_MOBILE) return 1;
  if (width <= BREAKPOINT_TABLET) return 2;
  return 4;
};

// ---- Row height (px) for the explicit grid template ----
const ROW_HEIGHT = 200;
const GAP = 16;

const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    gap: ${GAP}px;
  `,
}));

interface DashboardGridProps {
  theme: 'light' | 'dark';
}

const DashboardGrid = memo<DashboardGridProps>(({ theme }) => {
  const { styles } = useStyles();
  const widgets = useDashboardStore((s) => s.layout.widgets);

  // ---- Responsive column count ----
  const [columns, setColumns] = useState(() =>
    typeof window !== 'undefined' ? getColumnsForWidth(window.innerWidth) : 4,
  );

  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumnsForWidth(window.innerWidth));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---- Compute bento placements whenever widgets or column count change ----
  const placements = useMemo<BentoPlacement[]>(
    () => computeBentoLayout(widgets, columns),
    [widgets, columns],
  );

  const totalRows = useMemo(() => computeGridRows(placements), [placements]);

  // Quick lookup: instanceId → placement
  const placementMap = useMemo(() => {
    const map = new Map<string, BentoPlacement>();
    for (const p of placements) {
      map.set(p.instanceId, p);
    }
    return map;
  }, [placements]);

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: totalRows > 0 ? `repeat(${totalRows}, minmax(${ROW_HEIGHT}px, auto))` : undefined,
    }),
    [columns, totalRows],
  );

  return (
    <div className={styles.grid} style={gridStyle}>
      {widgets.map((instance) => {
        const registration = getWidget(instance.widgetId);
        if (!registration) return null;

        const placement = placementMap.get(instance.instanceId);
        if (!placement) return null;

        return (
          <WidgetContainer
            colSpan={placement.colSpan}
            gridColumn={placement.col + 1}
            gridRow={placement.row + 1}
            instanceId={instance.instanceId}
            key={instance.instanceId}
            manifest={registration.manifest}
            rowSpan={placement.rowSpan}
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
