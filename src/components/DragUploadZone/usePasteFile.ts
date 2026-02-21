import { type IEditor } from '@lobehub/editor';
import { useCallback, useEffect } from 'react';

import { getFileListFromDataTransferItems } from './useLocalDragUpload';

/**
 * Build a short inline reference marker for a file.
 * Images → `[image: name.png]` or `[image]`
 * Other  → `[file: name.ext]`
 */
export const buildFileMarker = (file: File): string => {
  if (file.type.startsWith('image')) {
    return file.name ? `[image: ${file.name}]` : '[image]';
  }
  return `[file: ${file.name}]`;
};

/**
 * Insert inline reference markers into the editor for each pasted file.
 * Appends to the current markdown content so the user sees where attachments relate.
 */
export const insertFileMarkers = (editor: IEditor, files: File[]) => {
  if (files.length === 0) return;

  const markers = files.map(buildFileMarker).join(' ');
  const current = String(editor.getDocument('markdown') || '').trimEnd();
  const separator = current.length > 0 ? ' ' : '';
  editor.setDocument('markdown', `${current}${separator}${markers}`);
};

/**
 * Hook for handling paste file uploads via @lobehub/editor.
 * Listens to editor's onPaste event and extracts files from clipboard.
 * Also inserts inline reference markers at the end of the editor content.
 *
 * @param editor - The editor instance from @lobehub/editor
 * @param onUploadFiles - Callback when files are pasted
 */
export const usePasteFile = (
  editor: IEditor | undefined,
  onUploadFiles: (files: File[]) => void | Promise<void>,
) => {
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      if (!event.clipboardData) return;

      const items = Array.from(event.clipboardData.items);
      const files = await getFileListFromDataTransferItems(items);

      if (files.length === 0) return;

      // Insert inline reference markers in the editor
      if (editor) {
        insertFileMarkers(editor, files);
      }

      onUploadFiles(files);
    },
    [editor, onUploadFiles],
  );

  useEffect(() => {
    if (!editor) return;

    editor.on('onPaste', handlePaste);

    return () => {
      editor.off('onPaste', handlePaste);
    };
  }, [editor, handlePaste]);
};
