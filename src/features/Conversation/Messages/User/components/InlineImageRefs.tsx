import { Flexbox, Text } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ImageIcon } from 'lucide-react';
import { memo } from 'react';

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

interface ImageRefItem {
  alt?: string;
  id: string;
}

interface InlineImageRefsProps {
  items: ImageRefItem[];
  onImageClick?: (id: string) => void;
}

const InlineImageRefs = memo<InlineImageRefsProps>(({ items, onImageClick }) => {
  if (!items || items.length === 0) return null;

  return (
    <Flexbox className={styles.container} gap={6} horizontal wrap={'wrap'}>
      {items.map((item, index) => (
        <span
          className={styles.chip}
          key={item.id}
          role="button"
          tabIndex={0}
          onClick={() => onImageClick?.(item.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onImageClick?.(item.id);
          }}
        >
          <ImageIcon size={14} />
          <Text style={{ fontSize: 12 }}>
            {item.alt || `image${items.length > 1 ? ` ${index + 1}` : ''}`}
          </Text>
        </span>
      ))}
    </Flexbox>
  );
});

export default InlineImageRefs;
