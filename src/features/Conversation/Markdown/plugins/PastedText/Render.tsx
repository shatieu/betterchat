'use client';

import { ActionIcon, Flexbox, Text } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ChevronDownIcon, ChevronRightIcon, ClipboardPasteIcon } from 'lucide-react';
import { memo, useState } from 'react';

import { type MarkdownElementProps } from '../type';

const styles = createStaticStyles(({ css }) => ({
  card: css`
    overflow: hidden;

    margin-block: 4px;

    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 8px;

    background: ${cssVar.colorFillQuaternary};
  `,
  content: css`
    overflow: auto;

    max-height: 300px;
    padding: 8px 12px;

    font-family: monospace;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;

    background: ${cssVar.colorBgContainer};
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};
  `,
  header: css`
    cursor: pointer;
    user-select: none;

    padding-block: 6px;
    padding-inline: 8px 12px;

    font-size: 12px;
  `,
}));

const PREVIEW_CHARS = 80;

interface PastedTextProps {
  chars?: string;
}

const Render = memo<MarkdownElementProps<PastedTextProps>>(({ children, node }) => {
  const [expanded, setExpanded] = useState(false);

  // Extract the text content from children
  const text = typeof children === 'string' ? children : String(children || '');
  const charCount = node?.properties?.chars || text.length.toLocaleString();
  const preview = text.slice(0, PREVIEW_CHARS) + (text.length > PREVIEW_CHARS ? '...' : '');

  return (
    <div className={styles.card}>
      <Flexbox
        align={'center'}
        className={styles.header}
        gap={6}
        horizontal
        justify={'space-between'}
        onClick={() => setExpanded(!expanded)}
      >
        <Flexbox align={'center'} gap={6} horizontal style={{ minWidth: 0, overflow: 'hidden' }}>
          {expanded ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
          <ClipboardPasteIcon size={14} style={{ flexShrink: 0 }} />
          <Text ellipsis style={{ fontSize: 12 }}>
            Pasted text ({charCount} chars): &ldquo;{preview}&rdquo;
          </Text>
        </Flexbox>
      </Flexbox>
      {expanded && <div className={styles.content}>{text}</div>}
    </div>
  );
});

Render.displayName = 'PastedTextRender';

export default Render;
