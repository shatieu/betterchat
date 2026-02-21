'use client';

import { Flexbox } from '@lobehub/ui';
import { Card, Dropdown, type MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import { Maximize2, Minimize2, MoreHorizontal, Trash2 } from 'lucide-react';
import { type ReactNode, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDashboardStore } from '@/store/dashboard';
import type { WidgetManifest, WidgetSize } from '@/types/widget';
import { WIDGET_SIZE_GRID_SPAN } from '@/types/widget';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    height: 100%;
  `,
  container: css`
    min-height: 0;
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  menu: css`
    cursor: pointer;
    color: ${token.colorTextSecondary};

    &:hover {
      color: ${token.colorText};
    }
  `,
  title: css`
    flex: 1;
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  `,
}));

interface WidgetContainerProps {
  children: ReactNode;
  instanceId: string;
  manifest: WidgetManifest;
  size: WidgetSize;
}

const WidgetContainer = memo<WidgetContainerProps>(
  ({ children, instanceId, manifest, size }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('dashboard');
    const [resizeWidget, removeWidget] = useDashboardStore((s) => [
      s.resizeWidget,
      s.removeWidget,
    ]);

    const gridSpan = WIDGET_SIZE_GRID_SPAN[size];

    const menuItems = useMemo<MenuProps['items']>(() => {
      const sizeItems: MenuProps['items'] = manifest.sizes.supported
        .filter((s) => s !== size)
        .map((s) => ({
          icon: s === 'small' || s === 'medium' ? <Minimize2 size={14} /> : <Maximize2 size={14} />,
          key: `resize-${s}`,
          label: t(`widgetSystem.sizes.${s}`),
          onClick: () => resizeWidget(instanceId, s),
        }));

      return [
        ...(sizeItems.length > 0
          ? [
              {
                children: sizeItems,
                key: 'resize',
                label: t('widgetSystem.resize'),
              },
            ]
          : []),
        { type: 'divider' as const },
        {
          danger: true,
          icon: <Trash2 size={14} />,
          key: 'remove',
          label: t('widgetSystem.remove'),
          onClick: () => removeWidget(instanceId),
        },
      ];
    }, [manifest.sizes.supported, size, instanceId, resizeWidget, removeWidget, t]);

    return (
      <div
        className={styles.container}
        style={{
          gridColumn: `span ${gridSpan.cols}`,
          gridRow: `span ${gridSpan.rows}`,
        }}
      >
        <Card
          className={styles.card}
          size="small"
          title={
            <div className={styles.header}>
              <span className={styles.title}>{manifest.name}</span>
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <MoreHorizontal className={styles.menu} size={16} />
              </Dropdown>
            </div>
          }
        >
          <Flexbox gap={8} style={{ height: '100%' }}>
            {children}
          </Flexbox>
        </Card>
      </div>
    );
  },
);

WidgetContainer.displayName = 'WidgetContainer';

export default WidgetContainer;
