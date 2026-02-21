import { Flexbox } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ArrowRightIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useConversationStore } from '../../../store';

const styles = createStaticStyles(({ css }) => ({
  chip: css`
    cursor: pointer;
    user-select: none;

    display: inline-flex;
    gap: 4px;
    align-items: center;

    padding-block: 4px;
    padding-inline: 12px;

    font-size: 13px;
    line-height: 1.4;

    background: ${cssVar.colorFillQuaternary};
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 16px;

    transition: all 0.2s;

    &:hover {
      background: ${cssVar.colorFillTertiary};
      border-color: ${cssVar.colorBorder};
    }

    &:active {
      background: ${cssVar.colorFillSecondary};
    }
  `,
  container: css`
    flex-wrap: wrap;
    padding-block-start: 4px;
  `,
}));

interface Chip {
  label: string;
  prompt: string;
}

interface ResponseChipsProps {
  content?: string;
}

const ResponseChips = memo<ResponseChipsProps>(({ content }) => {
  const { t } = useTranslation('chat');
  const sendMessage = useConversationStore((s) => s.sendMessage);

  const chips: Chip[] = useMemo(() => {
    const defaultChips: Chip[] = [
      { label: t('responseChips.continue', { defaultValue: 'Continue' }), prompt: 'Continue' },
      {
        label: t('responseChips.explain', { defaultValue: 'Explain more' }),
        prompt: 'Can you explain that in more detail?',
      },
      {
        label: t('responseChips.example', { defaultValue: 'Show example' }),
        prompt: 'Can you show me a concrete example?',
      },
    ];

    // Parse response for question marks or numbered options to generate contextual chips
    if (content) {
      const lines = content.split('\n');
      const questionLines = lines.filter(
        (line) => line.trim().endsWith('?') && line.trim().length > 10 && line.trim().length < 100,
      );

      if (questionLines.length > 0) {
        // Use the last question from the response as a chip
        const lastQuestion = questionLines.at(-1)!.trim();
        // Replace the "Explain more" chip with the detected question
        defaultChips[1] = {
          label: lastQuestion.length > 40 ? lastQuestion.slice(0, 37) + '...' : lastQuestion,
          prompt: `Regarding "${lastQuestion}" — yes, please go ahead.`,
        };
      }
    }

    return defaultChips;
  }, [content, t]);

  const handleChipClick = useCallback(
    (prompt: string) => {
      sendMessage({ message: prompt });
    },
    [sendMessage],
  );

  return (
    <Flexbox className={styles.container} gap={8} horizontal wrap={'wrap'}>
      {chips.map((chip) => (
        <span
          className={styles.chip}
          key={chip.prompt}
          role="button"
          tabIndex={0}
          onClick={() => handleChipClick(chip.prompt)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleChipClick(chip.prompt);
          }}
        >
          {chip.label}
          <ArrowRightIcon size={14} />
        </span>
      ))}
    </Flexbox>
  );
});

export default ResponseChips;
