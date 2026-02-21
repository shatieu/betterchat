'use client';

import { Typography } from 'antd';
import { memo } from 'react';

import type { WidgetProps } from '@/types/widget';

interface MarkdownData {
  content: string;
}

const MarkdownWidget = memo<WidgetProps<MarkdownData>>(({ data, size }) => {
  const content = data.content || '*No content available*';

  return (
    <div
      style={{
        fontSize: size === 'large' ? 14 : 13,
        lineHeight: 1.6,
        maxHeight: size === 'large' ? 400 : 200,
        overflow: 'auto',
      }}
    >
      <Typography.Paragraph
        ellipsis={size === 'medium' ? { rows: 8 } : false}
        style={{ marginBottom: 0 }}
      >
        {content}
      </Typography.Paragraph>
    </div>
  );
});

MarkdownWidget.displayName = 'MarkdownWidget';

export default MarkdownWidget;
