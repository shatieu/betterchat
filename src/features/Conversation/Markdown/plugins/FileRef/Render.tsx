'use client';

import { Text } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { PaperclipIcon } from 'lucide-react';
import { memo } from 'react';

import { type MarkdownElementProps } from '../type';

const styles = createStaticStyles(({ css }) => ({
  chip: css`
    cursor: pointer;

    display: inline-flex;
    gap: 4px;
    align-items: center;
    vertical-align: baseline;

    padding-block: 1px;
    padding-inline: 6px;
    margin-inline: 2px;

    font-size: 0.85em;
    line-height: 1.4;

    background: ${cssVar.colorFillQuaternary};
    border-radius: 4px;

    transition: background 0.2s;

    &:hover {
      background: ${cssVar.colorFillTertiary};
    }
  `,
}));

interface FileRefProps {
  name: string;
}

const Render = memo<MarkdownElementProps<FileRefProps>>(({ node }) => {
  const name = node?.properties?.name || '';
  const label = name || 'file';

  return (
    <span className={styles.chip} title={label}>
      <PaperclipIcon size={14} style={{ flexShrink: 0 }} />
      <Text ellipsis style={{ fontSize: '0.85em', maxWidth: 200 }}>
        {label}
      </Text>
    </span>
  );
});

Render.displayName = 'FileRefRender';

export default Render;
