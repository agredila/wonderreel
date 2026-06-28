'use client';

import { NotificationProvider } from '@/components/NotificationProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
