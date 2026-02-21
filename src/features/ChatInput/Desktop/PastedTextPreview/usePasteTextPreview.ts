import { type IEditor } from '@lobehub/editor';
import { useCallback, useEffect, useState } from 'react';

const PASTE_TEXT_THRESHOLD = 500;

/**
 * Wrap large pasted text in <pastedText> tags inside the editor content.
 * This enables the markdown renderer to display them as collapsible sections.
 * Uses a microtask to run after the editor has processed the paste.
 */
const wrapPastedTextInEditor = (editor: IEditor, pastedText: string) => {
  queueMicrotask(() => {
    const current = String(editor.getDocument('markdown') || '');
    const charCount = pastedText.length;

    // Find the pasted text in the current editor content and wrap it
    const idx = current.indexOf(pastedText);
    if (idx === -1) return;

    const wrapped = `<pastedText chars="${charCount}">\n${pastedText}\n</pastedText>`;
    const updated = current.slice(0, idx) + wrapped + current.slice(idx + pastedText.length);
    editor.setDocument('markdown', updated);
  });
};

/**
 * Hook that detects large text pastes and stores them for preview display.
 * Also wraps large pasted text in <pastedText> tags so they render as
 * collapsible sections in sent messages.
 */
export const usePasteTextPreview = (editor: IEditor | undefined) => {
  const [pastedTexts, setPastedTexts] = useState<string[]>([]);

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (!event.clipboardData) return;

      // Only track plain text pastes (not file pastes)
      const hasFiles = Array.from(event.clipboardData.items).some(
        (item) => item.kind === 'file',
      );
      if (hasFiles) return;

      const text = event.clipboardData.getData('text/plain');
      if (text && text.length >= PASTE_TEXT_THRESHOLD) {
        setPastedTexts((prev) => [...prev, text]);

        // Wrap the pasted text in <pastedText> tags for collapsible rendering
        if (editor) {
          wrapPastedTextInEditor(editor, text);
        }
      }
    },
    [editor],
  );

  useEffect(() => {
    if (!editor) return;

    editor.on('onPaste', handlePaste);
    return () => {
      editor.off('onPaste', handlePaste);
    };
  }, [editor, handlePaste]);

  const dismissPastedText = useCallback((index: number) => {
    setPastedTexts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllPastedTexts = useCallback(() => {
    setPastedTexts([]);
  }, []);

  return {
    clearAllPastedTexts,
    dismissPastedText,
    pastedTexts,
  };
};
