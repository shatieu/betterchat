import FileRef from './FileRef';
import ImageRef from './ImageRef';
import LobeArtifact from './LobeArtifact';
import LobeThinking from './LobeThinking';
import LocalFile from './LocalFile';
import Mention from './Mention';
import PastedText from './PastedText';
import Thinking from './Thinking';
import { type MarkdownElement } from './type';

export type { MarkdownElement } from './type';

export const markdownElements: MarkdownElement[] = [
  Thinking,
  LobeArtifact,
  LobeThinking,
  LocalFile,
  Mention,
  ImageRef,
  FileRef,
  PastedText,
];
