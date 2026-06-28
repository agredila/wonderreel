import { KidShell } from '@/components/KidShell';

export default function KidLayout({ children }: { children: React.ReactNode }) {
  return <KidShell>{children}</KidShell>;
}
