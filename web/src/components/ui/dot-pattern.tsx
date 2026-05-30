'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type DotPatternProps = React.HTMLAttributes<HTMLDivElement>;

export function DotPattern({ className, ...props }: DotPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(0,0,0,0.12)_1px,transparent_1px)] [background-size:18px_18px]',
        className
      )}
      {...props}
    />
  );
}

