'use client';

import { Flexbox } from '@lobehub/ui';
import { Card, Dropdown, type MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import { Maximize2, Minimize2, MoreHorizontal, Trash2 } from 'lucide-react';
import { type CSSProperties, type ReactNode, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDashboardStore } from '@/store/dashboard';
import type { WidgetManifest, WidgetSize } from '@/types/widget';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    height: 100%;
    border-radius: 12px;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: ${token.boxShadowSecondary};
    }
  `,
  container: css`
    min-height: 0;
    min-width: 0;
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
    overflow: hidden;
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

interface WidgetContainerProps {
  children: ReactNode;
  /** Column span computed by bento engine */
  colSpan: number;
  /** 1-based grid-column start from bento engine */
  gridColumn: number;
  /** 1-based grid-row start from bento engine */
  gridRow: number;
  instanceId: string;
  manifest: WidgetManifest;
  /** Row span computed by bento engine */
  rowSpan: number;
  size: WidgetSize;
}

const WidgetContainer = memo<WidgetContainerProps>(
  ({ children, colSpan, gridColumn, gridRow, instanceId, manifest, rowSpan, size }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('dashboard');
    const [resizeWidget, removeWidget] = useDashboardStore((s) => [
      s.resizeWidget,
      s.removeWidget,
    ]);

    const menuItems = useMemo<MenuProps['items']>(() => {
      const sizeItems: MenuProps['items'] = manifest.sizes.supported
        .filter((s) => s !== size)
        .map((s) => ({
          icon:
            s === 'small' || s === 'medium' ? (
              <Minimize2 size={14} />
            ) : (
              <Maximize2 size={14} />
            ),
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

    const containerStyle = useMemo<CSSProperties>(
      () => ({
        gridColumn: `${gridColumn} / span ${colSpan}`,
        gridRow: `${gridRow} / span ${rowSpan}`,
      }),
      [gridColumn, colSpan, gridRow, rowSpan],
    );

    return (
      <div className={styles.container} style={containerStyle}>
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
