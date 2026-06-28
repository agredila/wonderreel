import { Suspense } from 'react';
import { CreatePageClient } from '@/components/pages/CreatePageClient';

export default function CreatePage() {
  return (
    <Suspense fallback={<section className="section active"><div className="container"><p>Loading…</p></div></section>}>
      <CreatePageClient />
    </Suspense>
  );
}
