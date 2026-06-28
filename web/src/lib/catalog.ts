export type CatalogLesson = {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  category: string;
  duration: number;
  emoji: string;
  tags: string[];
  videoUrl?: string;
  source: 'catalog' | 'approved';
};

export const CATALOG_LESSONS: CatalogLesson[] = [
  {
    id: 'ocean-animals',
    title: { en: 'Ocean Animals', id: 'Hewan Laut', zh: '海洋动物', ar: 'حيوانات البحر' },
    description: { en: 'Learn about ocean animals with cheerful visuals.', id: 'Belajar tentang hewan laut.', zh: '认识海洋动物。', ar: 'تعرّف على حيوانات البحر.' },
    category: 'ocean',
    duration: 30,
    emoji: '🐢',
    tags: ['ocean', 'animals'],
    videoUrl: '/videos/ocean.mp4',
    source: 'catalog'
  },
  {
    id: 'colors-rainbow',
    title: { en: 'Bright Colors', id: 'Warna Cerah', zh: '明亮颜色', ar: 'ألوان زاهية' },
    description: { en: 'Explore bright colors in a fun way.', id: 'Kenali warna cerah.', zh: '认识颜色。', ar: 'تعرّف على الألوان.' },
    category: 'colors',
    duration: 30,
    emoji: '🌈',
    tags: ['colors'],
    videoUrl: '/videos/bright-colors.mp4',
    source: 'catalog'
  },
  {
    id: 'animal-friends',
    title: { en: 'Animal Friends', id: 'Teman Hewan', zh: '动物朋友', ar: 'أصدقاء الحيوانات' },
    description: { en: 'Meet friendly animals in the meadow.', id: 'Temui hewan ramah.', zh: '认识动物朋友。', ar: 'تعرّف على الحيوانات.' },
    category: 'animals',
    duration: 30,
    emoji: '🦁',
    tags: ['animals'],
    videoUrl: '/videos/animal-friends.mp4',
    source: 'catalog'
  },
  {
    id: 'animal-adventures',
    title: { en: 'Animal Adventures', id: 'Petualangan Hewan', zh: '动物冒险', ar: 'مغامرات الحيوانات' },
    description: { en: 'Discover more friendly animals on a sunny adventure.', id: 'Temukan hewan ramah lainnya.', zh: '发现更多可爱的动物朋友。', ar: 'اكتشف المزيد من الحيوانات الودودة.' },
    category: 'animals',
    duration: 30,
    emoji: '🐘',
    tags: ['animals'],
    videoUrl: '/videos/animals-2.mp4',
    source: 'catalog'
  },
  {
    id: 'alphabet-abc',
    title: { en: 'ABC Adventure', id: 'Petualangan ABC', zh: 'ABC 冒险', ar: 'مغامرة الحروف' },
    description: { en: 'Letters A, B, C come alive.', id: 'Huruf A, B, C hidup.', zh: '字母动起来。', ar: 'الحروف تنبض بالحياة.' },
    category: 'alphabet',
    duration: 30,
    emoji: '🔤',
    tags: ['alphabet'],
    videoUrl: '/videos/alphabet.mp4',
    source: 'catalog'
  }
];

export function hasPlayableVideo(lesson: CatalogLesson): boolean {
  return Boolean(lesson.videoUrl?.trim());
}

export function withPlayableVideo(lessons: CatalogLesson[]): CatalogLesson[] {
  return lessons.filter(hasPlayableVideo);
}

export function lessonTitle(lesson: CatalogLesson, locale: string) {
  return lesson.title[locale] || lesson.title.en || 'Lesson';
}

export function lessonDescription(lesson: CatalogLesson, locale: string) {
  return lesson.description[locale] || lesson.description.en || '';
}

export function filmToLesson(film: {
  id: string;
  title: Record<string, string>;
  duration_sec: number;
  video_url?: string;
  is_starter?: boolean;
}): CatalogLesson {
  return {
    id: film.id,
    title: film.title,
    description: { en: 'Your approved film.', id: '', zh: '', ar: '' },
    category: 'general',
    duration: film.duration_sec,
    emoji: film.is_starter ? '📚' : '🎬',
    tags: ['yours'],
    videoUrl: film.video_url,
    source: 'approved'
  };
}

export function mergeLessons(catalog: CatalogLesson[], approved: CatalogLesson[]) {
  const seen = new Set<string>();
  const out: CatalogLesson[] = [];
  for (const l of [...approved, ...catalog]) {
    if (seen.has(l.id)) continue;
    seen.add(l.id);
    out.push(l);
  }
  return withPlayableVideo(out);
}

export const CATEGORY_EMOJI: Record<string, string> = {
  general: '🦉',
  ocean: '🐢',
  animals: '🦁',
  numbers: '🔢',
  colors: '🌈',
  alphabet: '🔤'
};
