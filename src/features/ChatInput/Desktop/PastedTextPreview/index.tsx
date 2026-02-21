import { ActionIcon, Flexbox, Text } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ChevronDownIcon, ChevronRightIcon, ClipboardPasteIcon, XIcon } from 'lucide-react';
import { memo, useState } from 'react';

const PREVIEW_CHARS = 80;

const styles = createStaticStyles(({ css }) => ({
  card: css`
    overflow: hidden;

    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 8px;

    background: ${cssVar.colorFillQuaternary};
  `,
  expandedContent: css`
    overflow: auto;

    max-height: 200px;
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
    padding-inline: 8px 4px;

    font-size: 12px;
  `,
}));

interface PastedTextPreviewProps {
  onDismiss: () => void;
  text: string;
}

const PastedTextPreview = memo<PastedTextPreviewProps>(({ text, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);
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
          <ClipboardPasteIcon size={14} />
          <Text ellipsis style={{ fontSize: 12 }}>
            Pasted text ({text.length.toLocaleString()} chars): &ldquo;{preview}&rdquo;
          </Text>
        </Flexbox>
        <ActionIcon
          icon={XIcon}
          size={'small'}
          title="Dismiss"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        />
      </Flexbox>
      {expanded && <div className={styles.expandedContent}>{text}</div>}
    </div>
  );
});

export default PastedTextPreview;
