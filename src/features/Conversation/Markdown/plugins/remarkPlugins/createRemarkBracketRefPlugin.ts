import { type Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

/**
 * Creates a remark plugin that finds bracket-style reference markers in text nodes
 * and converts them into custom elements.
 *
 * Matches patterns like `[image: filename.png]` or `[file: report.pdf]`
 * and replaces them with a custom hast node so they render as styled inline chips.
 *
 * @param tagName - The custom element tag name (e.g., 'imageRef' or 'fileRef')
 * @param prefix  - The bracket prefix to match (e.g., 'image' or 'file')
 */
export const createRemarkBracketRefPlugin =
  (tagName: string, prefix: string): Plugin<[], any> =>
  () => {
    // Match [prefix: value] or [prefix] (without colon)
    // The value after colon is optional and captures the rest until closing bracket
    const pattern = new RegExp(`\\[${prefix}(?::\\s*([^\\]]+))?\\]`, 'gi');

    return (tree) => {
      // @ts-ignore
      visit(tree, 'text', (node: any, index: number, parent) => {
        if (
          !parent ||
          typeof index !== 'number' ||
          typeof node.value !== 'string' ||
          !node.value.toLowerCase().includes(`[${prefix.toLowerCase()}`)
        ) {
          return;
        }

        const text = node.value;
        let lastIndex = 0;
        const newChildren: any[] = [];
        let match;

        pattern.lastIndex = 0;

        while ((match = pattern.exec(text)) !== null) {
          const [fullMatch, value] = match;
          const matchIndex = match.index;

          // Add text before the match
          if (matchIndex > lastIndex) {
            newChildren.push({ type: 'text', value: text.slice(lastIndex, matchIndex) });
          }

          // Create custom node
          newChildren.push({
            children: [{ type: 'text', value: value?.trim() || prefix }],
            data: {
              hName: tagName,
              hProperties: { name: value?.trim() || '' },
            },
            type: tagName,
          });

          lastIndex = matchIndex + fullMatch.length;
        }

        if (newChildren.length > 0) {
          if (lastIndex < text.length) {
            newChildren.push({ type: 'text', value: text.slice(lastIndex) });
          }
          parent.children.splice(index, 1, ...newChildren);
          return [SKIP, index + newChildren.length];
        }
      });
    };
  };
