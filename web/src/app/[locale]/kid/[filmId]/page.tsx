import { KidFilmPageClient } from '@/components/pages/KidFilmPageClient';

type PageProps = {
  params: Promise<{ locale: string; filmId: string }>;
};

export default async function KidFilmPage({ params }: PageProps) {
  const { filmId } = await params;
  return <KidFilmPageClient filmId={filmId} />;
}
