import { type IEditor } from '@lobehub/editor';
import { useCallback, useEffect, useState } from 'react';

const PASTE_TEXT_THRESHOLD = 500;

/**
 * Hook that detects large text pastes and stores them for preview display.
 * The text still goes into the editor normally — this just tracks it for the UI banner.
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
      }
    },
    [],
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
