import { remark } from 'remark';
import { describe, expect, it } from 'vitest';

import { createRemarkBracketRefPlugin } from './createRemarkBracketRefPlugin';

const processToAST = (input: string, tagName: string, prefix: string) => {
  const processor = remark().use(createRemarkBracketRefPlugin(tagName, prefix));
  return processor.runSync(processor.parse(input));
};

// Helper to find nodes of a given type in the AST
const findNodes = (tree: any, type: string): any[] => {
  const results: any[] = [];
  const walk = (node: any) => {
    if (node.type === type) results.push(node);
    if (node.children) node.children.forEach(walk);
  };
  walk(tree);
  return results;
};

describe('createRemarkBracketRefPlugin', () => {
  it('should convert [image: filename.png] to an imageRef node', () => {
    const tree = processToAST(
      'Here is [image: screenshot.png] in the text',
      'imageRef',
      'image',
    );
    const refs = findNodes(tree, 'imageRef');
    expect(refs).toHaveLength(1);
    expect(refs[0].data.hProperties.name).toBe('screenshot.png');
  });

  it('should convert [file: report.pdf] to a fileRef node', () => {
    const tree = processToAST('Check [file: report.pdf] for details', 'fileRef', 'file');
    const refs = findNodes(tree, 'fileRef');
    expect(refs).toHaveLength(1);
    expect(refs[0].data.hProperties.name).toBe('report.pdf');
  });

  it('should handle multiple markers in the same text', () => {
    const tree = processToAST(
      'Compare [image: a.png] with [image: b.png]',
      'imageRef',
      'image',
    );
    const refs = findNodes(tree, 'imageRef');
    expect(refs).toHaveLength(2);
    expect(refs[0].data.hProperties.name).toBe('a.png');
    expect(refs[1].data.hProperties.name).toBe('b.png');
  });

  it('should handle marker without colon value like [image]', () => {
    const tree = processToAST('See this [image] here', 'imageRef', 'image');
    const refs = findNodes(tree, 'imageRef');
    expect(refs).toHaveLength(1);
    expect(refs[0].data.hProperties.name).toBe('');
  });

  it('should preserve text that does not match', () => {
    const tree = processToAST('No markers here', 'imageRef', 'image');
    const refs = findNodes(tree, 'imageRef');
    expect(refs).toHaveLength(0);
  });

  it('should be case-insensitive', () => {
    const tree = processToAST('[Image: test.png]', 'imageRef', 'image');
    const refs = findNodes(tree, 'imageRef');
    expect(refs).toHaveLength(1);
  });

  it('should preserve surrounding text nodes', () => {
    const tree = processToAST('before [image: pic.png] after', 'imageRef', 'image');
    const paragraph = tree.children[0];
    // Should have: text("before "), imageRef, text(" after")
    expect(paragraph.children).toHaveLength(3);
    expect(paragraph.children[0].type).toBe('text');
    expect(paragraph.children[0].value).toBe('before ');
    expect(paragraph.children[1].type).toBe('imageRef');
    expect(paragraph.children[2].type).toBe('text');
    expect(paragraph.children[2].value).toBe(' after');
  });
});
