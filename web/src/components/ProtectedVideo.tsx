'use client';

import * as React from 'react';

const DEFAULT_CONTROLS_LIST = 'nodownload noremoteplayback';

type Props = React.ComponentPropsWithoutRef<'video'>;

function mergeClassName(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/** Phase 1 playback surface — blocks easy download/PiP; not DRM. */
export const ProtectedVideo = React.forwardRef<HTMLVideoElement, Props>(function ProtectedVideo(
  {
    className,
    controls,
    controlsList,
    disablePictureInPicture,
    disableRemotePlayback,
    onContextMenu,
    onDragStart,
    ...props
  },
  ref
) {
  const handleContextMenu = (event: React.MouseEvent<HTMLVideoElement>) => {
    event.preventDefault();
    onContextMenu?.(event);
  };

  const handleDragStart = (event: React.DragEvent<HTMLVideoElement>) => {
    event.preventDefault();
    onDragStart?.(event);
  };

  return (
    <video
      {...props}
      ref={ref}
      className={mergeClassName('protected-video', className)}
      controls={controls}
      controlsList={controls ? (controlsList ?? DEFAULT_CONTROLS_LIST) : controlsList}
      disablePictureInPicture={disablePictureInPicture ?? true}
      disableRemotePlayback={disableRemotePlayback ?? true}
      draggable={false}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
    />
  );
});
