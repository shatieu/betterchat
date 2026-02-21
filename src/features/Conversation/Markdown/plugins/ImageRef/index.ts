import { createRemarkBracketRefPlugin } from '../remarkPlugins/createRemarkBracketRefPlugin';
import { type MarkdownElement } from '../type';
import Component from './Render';

const IMAGE_REF_TAG = 'imageRef';

const ImageRef: MarkdownElement = {
  Component,
  remarkPlugin: createRemarkBracketRefPlugin(IMAGE_REF_TAG, 'image'),
  scope: 'all',
  tag: IMAGE_REF_TAG,
};

export default ImageRef;
