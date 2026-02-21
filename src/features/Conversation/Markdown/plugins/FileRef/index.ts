import { createRemarkBracketRefPlugin } from '../remarkPlugins/createRemarkBracketRefPlugin';
import { type MarkdownElement } from '../type';
import Component from './Render';

const FILE_REF_TAG = 'fileRef';

const FileRef: MarkdownElement = {
  Component,
  remarkPlugin: createRemarkBracketRefPlugin(FILE_REF_TAG, 'file'),
  scope: 'all',
  tag: FILE_REF_TAG,
};

export default FileRef;
