import { createRemarkCustomTagWithAttributesPlugin } from '../remarkPlugins/createRemarkCustomTagWithAttributesPlugin';
import { type MarkdownElement } from '../type';
import Component from './Render';

const PASTED_TEXT_TAG = 'pastedText';

const PastedText: MarkdownElement = {
  Component,
  remarkPlugin: createRemarkCustomTagWithAttributesPlugin(PASTED_TEXT_TAG),
  scope: 'all',
  tag: PASTED_TEXT_TAG,
};

export default PastedText;
