import { Flexbox, Text } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { PaperclipIcon } from 'lucide-react';
import { memo } from 'react';

import { useChatStore } from '@/store/chat';

const styles = createStaticStyles(({ css }) => ({
  chip: css`
    cursor: pointer;

    display: inline-flex;
    gap: 4px;
    align-items: center;

    padding-block: 2px;
    padding-inline: 8px;

    font-size: 12px;
    line-height: 1.4;

    background: ${cssVar.colorFillQuaternary};
    border-radius: 4px;

    transition: background 0.2s;

    &:hover {
      background: ${cssVar.colorFillTertiary};
    }
  `,
  container: css`
    flex-wrap: wrap;
  `,
}));

interface FileRefItem {
  id: string;
  name: string;
}

interface InlineFileRefsProps {
  items: FileRefItem[];
}

const InlineFileRefs = memo<InlineFileRefsProps>(({ items }) => {
  const openFilePreview = useChatStore((s) => s.openFilePreview);

  if (!items || items.length === 0) return null;

  return (
    <Flexbox className={styles.container} gap={6} horizontal wrap={'wrap'}>
      {items.map((item) => (
        <span
          className={styles.chip}
          key={item.id}
          role="button"
          tabIndex={0}
          onClick={() => openFilePreview({ fileId: item.id })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') openFilePreview({ fileId: item.id });
          }}
        >
          <PaperclipIcon size={14} />
          <Text ellipsis style={{ fontSize: 12, maxWidth: 200 }}>
            {item.name}
          </Text>
        </span>
      ))}
    </Flexbox>
  );
});

export default InlineFileRefs;
