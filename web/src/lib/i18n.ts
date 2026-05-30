import type { Lang } from '@/lib/prompts';

export const LANGS: Array<{ key: Lang; label: string; dir: 'ltr' | 'rtl' }> = [
  { key: 'en', label: 'English', dir: 'ltr' },
  { key: 'id', label: 'Bahasa', dir: 'ltr' },
  { key: 'zh', label: '中文', dir: 'ltr' },
  { key: 'ar', label: 'العربية', dir: 'rtl' }
];

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    headline: 'Turn Any Lesson Into a Short Film — in Minutes',
    subtitle: 'Write your prompt, generate a video, then manage it in My List.',
    tab_create: 'Create',
    tab_gallery: 'Created With Art',
    tab_mylist: 'My List',
    label_language: 'Language',
    label_category: 'Category',
    label_duration: 'Duration',
    btn_generate: 'Generate Video',
    btn_view: 'View',
    loading_title: 'Generating video…',
    loading_hint: 'Keep this tab open while we create your video.',
    duration_30: '30 seconds',
    duration_45: '45 seconds',
    duration_60: '60 seconds'
  },
  id: {
    headline: 'Ubah Pelajaran Apa Pun Jadi Film Pendek — Dalam Hitungan Menit',
    subtitle: 'Tulis prompt kamu, generate video, lalu kelola di My List.',
    tab_create: 'Buat',
    tab_gallery: 'Karya Video',
    tab_mylist: 'Daftar Saya',
    label_language: 'Bahasa',
    label_category: 'Kategori',
    label_duration: 'Durasi',
    btn_generate: 'Generate Video',
    btn_view: 'Lihat',
    loading_title: 'Sedang membuat video…',
    loading_hint: 'Biarkan tab ini terbuka saat video dibuat.',
    duration_30: '30 detik',
    duration_45: '45 detik',
    duration_60: '60 detik'
  },
  zh: {
    headline: '把任何课程变成短片 — 几分钟搞定',
    subtitle: '输入提示词生成视频，然后在“我的收藏”中管理。',
    tab_create: '生成',
    tab_gallery: '作品展示',
    tab_mylist: '我的收藏',
    label_language: '语言',
    label_category: '分类',
    label_duration: '时长',
    btn_generate: '生成视频',
    btn_view: '查看',
    loading_title: '正在生成视频…',
    loading_hint: '生成过程中请保持页面打开。',
    duration_30: '30 秒',
    duration_45: '45 秒',
    duration_60: '60 秒'
  },
  ar: {
    headline: 'حوّل أي درس إلى فيلم قصير — خلال دقائق',
    subtitle: 'اكتب الموجه، أنشئ فيديو، ثم قم بإدارته داخل قائمتي.',
    tab_create: 'إنشاء',
    tab_gallery: 'أعمالك',
    tab_mylist: 'قائمتي',
    label_language: 'اللغة',
    label_category: 'الفئة',
    label_duration: 'المدة',
    btn_generate: 'إنشاء فيديو',
    btn_view: 'عرض',
    loading_title: 'جاري إنشاء الفيديو…',
    loading_hint: 'اترك الصفحة مفتوحة أثناء الإنشاء.',
    duration_30: '30 ثانية',
    duration_45: '45 ثانية',
    duration_60: '60 ثانية'
  }
};

export function t(lang: Lang, key: string) {
  return DICT[lang]?.[key] ?? DICT.en[key] ?? key;
}
