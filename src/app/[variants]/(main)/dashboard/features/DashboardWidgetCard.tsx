'use client';

import { Flexbox } from '@lobehub/ui';
import { Card, Dropdown, Skeleton, type MenuProps } from 'antd';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { type ReactNode, memo } from 'react';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    height: 100%;
  `,
  footer: css`
    padding-top: 8px;
    border-top: 1px solid ${token.colorBorderSecondary};
    color: ${token.colorTextSecondary};
    font-size: 12px;
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  icon: css`
    color: ${token.colorTextSecondary};
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

interface DashboardWidgetCardProps {
  children: ReactNode;
  footer?: ReactNode;
  icon: LucideIcon;
  loading?: boolean;
  menu?: MenuProps['items'];
  span?: 1 | 2;
  title: string;
}

const DashboardWidgetCard = memo<DashboardWidgetCardProps>(
  ({ title, icon: Icon, children, footer, menu, loading, span = 1 }) => {
    const { styles } = useStyles();

    return (
      <Card
        className={styles.card}
        style={{ gridColumn: span === 2 ? 'span 2' : undefined }}
        title={
          <div className={styles.header}>
            <Icon className={styles.icon} size={16} />
            <span className={styles.title}>{title}</span>
            {menu && (
              <Dropdown menu={{ items: menu }} trigger={['click']}>
                <MoreHorizontal className={styles.menu} size={16} />
              </Dropdown>
            )}
          </div>
        }
        size="small"
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <Flexbox gap={8}>
            {children}
            {footer && <div className={styles.footer}>{footer}</div>}
          </Flexbox>
        )}
      </Card>
    );
  },
);

DashboardWidgetCard.displayName = 'DashboardWidgetCard';

export default DashboardWidgetCard;
