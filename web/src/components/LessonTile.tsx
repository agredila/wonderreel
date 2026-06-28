'use client';

import type { CatalogLesson } from '@/lib/catalog';
import { lessonTitle } from '@/lib/catalog';
import { VideoThumbnail } from '@/components/VideoThumbnail';
import { formatDuration, useVideoDuration } from '@/lib/useVideoDuration';

type Props = {
  lesson: CatalogLesson;
  locale: string;
  onClick?: () => void;
};

export function LessonTile({ lesson, locale, onClick }: Props) {
  const durationSec = useVideoDuration(lesson.videoUrl, lesson.duration);

  return (
    <button type="button" className="lesson-card" data-lesson-id={lesson.id} onClick={onClick}>
      <div className="lesson-thumbnail">
        <VideoThumbnail videoUrl={lesson.videoUrl} fallbackEmoji={lesson.emoji} />
      </div>
      <div className="lesson-info">
        <h3 className="lesson-title">{lessonTitle(lesson, locale)}</h3>
        <p className="lesson-meta">{formatDuration(durationSec)} · {lesson.category}</p>
      </div>
    </button>
  );
}

export function LessonRow({ title, lessons, locale, onSelect }: { title: string; lessons: CatalogLesson[]; locale: string; onSelect: (l: CatalogLesson) => void }) {
  if (lessons.length === 0) return null;
  return (
    <div className="row fade-in">
      <div className="row-header">
        <h2 className="row-title">{title}</h2>
      </div>
      <div className="row-scroller">
        {lessons.map((lesson) => (
          <LessonTile key={lesson.id} lesson={lesson} locale={locale} onClick={() => onSelect(lesson)} />
        ))}
      </div>
    </div>
  );
}
