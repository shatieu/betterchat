'use client';

import { Flexbox } from '@lobehub/ui';
import { Statistic } from 'antd';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { memo } from 'react';

import type { WidgetProps } from '@/types/widget';

interface MetricData {
  label: string;
  trend?: 'up' | 'down' | 'flat';
  unit?: string;
  value: number;
}

const trendConfig = {
  down: { color: '#ff4d4f', icon: <ArrowDown size={14} /> },
  flat: { color: '#8c8c8c', icon: <ArrowRight size={14} /> },
  up: { color: '#52c41a', icon: <ArrowUp size={14} /> },
};

const MetricWidget = memo<WidgetProps<MetricData>>(({ data, size }) => {
  const trend = data.trend ? trendConfig[data.trend] : undefined;

  return (
    <Flexbox
      align="center"
      justify="center"
      style={{ height: '100%', textAlign: 'center' }}
    >
      <Statistic
        prefix={trend?.icon}
        suffix={data.unit}
        title={data.label || 'Metric'}
        value={data.value ?? 0}
        valueStyle={{
          color: trend?.color,
          fontSize: size === 'small' ? 28 : 36,
        }}
      />
    </Flexbox>
  );
});

MetricWidget.displayName = 'MetricWidget';

export default MetricWidget;
