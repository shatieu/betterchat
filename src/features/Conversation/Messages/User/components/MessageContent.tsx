import { Flexbox } from '@lobehub/ui';
import { memo, useMemo } from 'react';

import MarkdownMessage from '@/features/Conversation/Markdown';
import { type UIChatMessage } from '@/types/index';

import { useMarkdown } from '../useMarkdown';
import FileListViewer from './FileListViewer';
import InlineFileRefs from './InlineFileRefs';
import InlineImageRefs from './InlineImageRefs';
import ImageFileListViewer from './ImageFileListViewer';
import PageSelections from './PageSelections';
import VideoFileListViewer from './VideoFileListViewer';

const UserMessageContent = memo<UIChatMessage>(
  ({ id, content, imageList, videoList, fileList, metadata }) => {
    const markdownProps = useMarkdown(id);
    const pageSelections = metadata?.pageSelections;

    const hasImages = !!imageList && imageList.length > 0;
    const hasFiles = !!fileList && fileList.length > 0;
    const hasInlineRefs = hasImages || hasFiles;

    const imageRefItems = useMemo(
      () => imageList?.map((img) => ({ alt: img.alt, id: img.id })) ?? [],
      [imageList],
    );

    const fileRefItems = useMemo(
      () => fileList?.map((f) => ({ id: f.id, name: f.name })) ?? [],
      [fileList],
    );

    return (
      <Flexbox gap={8} id={id}>
        {pageSelections && pageSelections.length > 0 && (
          <PageSelections selections={pageSelections} />
        )}
        {hasInlineRefs && content && (
          <Flexbox gap={6} horizontal wrap={'wrap'}>
            {hasImages && <InlineImageRefs items={imageRefItems} />}
            {hasFiles && <InlineFileRefs items={fileRefItems} />}
          </Flexbox>
        )}
        {content && <MarkdownMessage {...markdownProps}>{content}</MarkdownMessage>}
        {hasImages && <ImageFileListViewer items={imageList} />}
        {videoList && videoList?.length > 0 && <VideoFileListViewer items={videoList} />}
        {hasFiles && <FileListViewer items={fileList} />}
      </Flexbox>
    );
  },
);

export default UserMessageContent;
