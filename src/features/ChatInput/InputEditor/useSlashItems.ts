import { type SlashOptions, INSERT_TABLE_COMMAND } from '@lobehub/editor';
import { BookOpenTextIcon, LanguagesIcon, SpellCheckIcon, Table2Icon, TextSearchIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const SNIPPET_PROMPTS = {
  explain: 'Please explain this step by step:\n\n',
  fix: 'Please fix the grammar and spelling in the following text:\n\n',
  summarize: 'Please provide a concise summary of the following:\n\n',
  translate: 'Please translate the following to English:\n\n',
};

export const useSlashItems = (): SlashOptions['items'] => {
  const { t } = useTranslation('editor');

  return useMemo(
    () => [
      {
        icon: Table2Icon,
        key: 'table',
        label: t('typobar.table'),
        onSelect: (editor) => {
          editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
        },
      },
      {
        icon: BookOpenTextIcon,
        key: 'snippet-summarize',
        label: t('slash.snippets.summarize'),
        onSelect: (editor) => {
          const current = String(editor.getDocument('markdown') || '');
          editor.setDocument('markdown', current + SNIPPET_PROMPTS.summarize);
        },
      },
      {
        icon: TextSearchIcon,
        key: 'snippet-explain',
        label: t('slash.snippets.explain'),
        onSelect: (editor) => {
          const current = String(editor.getDocument('markdown') || '');
          editor.setDocument('markdown', current + SNIPPET_PROMPTS.explain);
        },
      },
      {
        icon: LanguagesIcon,
        key: 'snippet-translate',
        label: t('slash.snippets.translate'),
        onSelect: (editor) => {
          const current = String(editor.getDocument('markdown') || '');
          editor.setDocument('markdown', current + SNIPPET_PROMPTS.translate);
        },
      },
      {
        icon: SpellCheckIcon,
        key: 'snippet-fix',
        label: t('slash.snippets.fix'),
        onSelect: (editor) => {
          const current = String(editor.getDocument('markdown') || '');
          editor.setDocument('markdown', current + SNIPPET_PROMPTS.fix);
        },
      },
    ],
    [t],
  );
};
