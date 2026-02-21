'use client';

import { Flexbox } from '@lobehub/ui';
import { memo, useEffect, useState } from 'react';

import type { WidgetProps } from '@/types/widget';

const formatTime = (date: Date) => {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  });
};

const ClockWidget = memo<WidgetProps>(({ size, theme }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Flexbox
      align="center"
      gap={size === 'small' ? 2 : 8}
      justify="center"
      style={{ height: '100%', textAlign: 'center' }}
    >
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: size === 'small' ? 28 : 40,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {formatTime(now)}
      </div>
      {size !== 'small' && (
        <>
          <div style={{ fontSize: 14, opacity: 0.75 }}>{formatDate(now)}</div>
          <div style={{ fontSize: 12, opacity: 0.45 }}>{timezone}</div>
        </>
      )}
    </Flexbox>
  );
});

ClockWidget.displayName = 'ClockWidget';

export default ClockWidget;
