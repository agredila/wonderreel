'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type BlurFadeProps = React.PropsWithChildren<{
  delay?: number;
  inView?: boolean;
  className?: string;
}>;

export function BlurFade({ delay = 0, inView = true, className, children }: BlurFadeProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const shouldShow = mounted && inView;

  return (
    <div
      className={cn('blur-fade', shouldShow && 'blur-fade--show', className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

