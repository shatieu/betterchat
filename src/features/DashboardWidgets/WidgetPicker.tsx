'use client';

import { Flexbox } from '@lobehub/ui';
import { Card, Modal, Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDashboardStore } from '@/store/dashboard';

import { getAllWidgets } from './widgetRegistry';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: ${token.colorPrimary};
    }
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  `,
}));

interface WidgetPickerProps {
  onClose: () => void;
  open: boolean;
}

const WidgetPicker = memo<WidgetPickerProps>(({ open, onClose }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('dashboard');
  const addWidget = useDashboardStore((s) => s.addWidget);

  const widgets = useMemo(() => getAllWidgets(), []);

  const handleAddWidget = (widgetId: string) => {
    addWidget(widgetId);
    onClose();
  };

  return (
    <Modal
      footer={null}
      onCancel={onClose}
      open={open}
      title={t('widgetSystem.addWidget')}
      width={560}
    >
      <div className={styles.grid}>
        {widgets.map((reg) => (
          <Card
            className={styles.card}
            key={reg.manifest.id}
            size="small"
            onClick={() => handleAddWidget(reg.manifest.id)}
          >
            <Flexbox gap={4}>
              <Typography.Text strong>{reg.manifest.name}</Typography.Text>
              <Typography.Text style={{ fontSize: 12 }} type="secondary">
                {reg.manifest.description}
              </Typography.Text>
              <Flexbox gap={4} horizontal style={{ flexWrap: 'wrap', marginTop: 4 }}>
                {reg.manifest.sizes.supported.map((size) => (
                  <Tag key={size} style={{ margin: 0 }}>
                    {size}
                  </Tag>
                ))}
              </Flexbox>
            </Flexbox>
          </Card>
        ))}
      </div>
    </Modal>
  );
});

WidgetPicker.displayName = 'WidgetPicker';

export default WidgetPicker;
