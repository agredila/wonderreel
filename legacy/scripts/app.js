/* ==========================================
   WonderReel - Main Application
   ========================================== */

// Configuration
const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';
const STORAGE_KEY = 'wonderreel_data';
const LANG_STORAGE_KEY = 'wonderreel_lang';
const GENERATED_LESSONS_KEY = 'wonderreel_generated_lessons';

function getApiBaseUrl() {
  try {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get('api');
    if (fromQuery) return fromQuery.replace(/\/+$/, '');
  } catch (e) {
    void e;
  }

  const stored = localStorage.getItem('wonderreel_api_base_url');
  if (stored) return stored.replace(/\/+$/, '');

  return DEFAULT_API_BASE_URL;
}

function toAbsoluteAssetUrl(maybeRelativeUrl) {
  if (!maybeRelativeUrl) return null;
  if (/^https?:\/\//i.test(maybeRelativeUrl)) return maybeRelativeUrl;

  const apiBase = getApiBaseUrl();
  const baseOrigin = apiBase.replace(/\/api\/?$/i, '');
  const path = maybeRelativeUrl.startsWith('/') ? maybeRelativeUrl : `/${maybeRelativeUrl}`;
  return `${baseOrigin}${path}`;
}

const SUPPORTED_LANGS = ['en', 'id', 'zh', 'ar'];

const I18N = {
  en: {
    nav_home: 'Home',
    nav_lessons: 'Lessons',
    nav_create: 'Create',
    nav_mylist: 'My List',
    brand_badge: 'WonderReel Kids',
    headline_adventure: 'Where Every Lesson Becomes an Adventure',
    headline_subtitle: 'Type a prompt, generate a short film, and learn together.',
    hero_prompt_placeholder: 'Try: A gentle ocean story teaching colors for kids',
    hero_duration_label: 'Max Duration',
    hero_duration_6: '6 seconds',
    hero_duration_30: '30 seconds',
    hero_duration_60: '1 minute',
    hero_duration_120: '2 minutes',
    hero_duration_180: '3 minutes',
    hero_prompt_btn: 'Create',
    cta_create: 'Create a New Video',
    cta_view: 'View Lessons',
    stat_total: 'Total Lessons',
    stat_favorites: 'Favorites',
    stat_avg_rating: 'Avg Rating',
    recent_title: '🎥 Recent Lessons',
    row_featured: 'Featured Lessons',
    row_new: 'New & Noteworthy',
    row_favorites: 'Your Favorites',
    row_favorites_empty: 'Save a lesson to see it here',
    gallery_title: '🎬 Lesson Gallery',
    gallery_subtitle: 'Choose an educational video for your child.',
    filter_all: 'All',
    filter_ocean: '🦈 Ocean',
    filter_numbers: '🔢 Numbers',
    filter_colors: '🎨 Colors',
    create_title: '✨ Create a New Video',
    create_subtitle: 'Use AI to generate an educational video.',
    prompt_label: '💡 Video Prompt',
    prompt_placeholder: 'Example: Colorful cartoon fish swimming in ocean for children',
    prompt_hint: 'Describe the video you want to create. Keep it child-friendly.',
    duration_prefix: '⏱️ Duration:',
    duration_suffix: 'seconds',
    category_label: '📚 Category',
    cat_general: 'General',
    cat_ocean: 'Ocean',
    cat_animals: 'Animals',
    cat_numbers: 'Numbers',
    cat_colors: 'Colors',
    cat_alphabet: 'Alphabet',
    generate_btn: 'Generate Video',
    gen_title: '🎬 Generating video...',
    gen_cancel: 'Cancel',
    gen_preparing: 'Preparing...',
    gen_eta: '⏱️ Estimated time: 2–5 minutes',
    sample_prompts: '💡 Sample Prompts',
    prompt_ocean_title: 'Ocean Animals',
    prompt_numbers_title: 'Numbers 1–10',
    prompt_colors_title: 'Bright Colors',
    mylist_title: '❤️ My List',
    mylist_subtitle: 'Your saved lessons',
    mylist_empty_title: 'No favorites yet',
    mylist_empty_desc: 'Save a lesson to find it quickly later.',
    mylist_browse: 'Browse Lessons',
    favorite_add: 'Add to My List',
    favorite_remove: 'Remove from My List',
    rating_title: '⭐ Rate this lesson',
    rating_none: 'No rating yet',
    comments_title: '💬 Comments',
    comment_placeholder: 'Write a comment...',
    comment_send: 'Send',
    empty_lessons_title: 'No lessons yet',
    empty_lessons_desc: 'No lessons available for this filter.',
    toast_favorite_updated: 'Favorites updated!',
    toast_prompt_used: 'Prompt applied!',
    toast_comment_required: 'Please write a comment first',
    toast_comment_added: 'Comment added! 💬',
    toast_rating_given: (n) => `You rated ${n}/5 ⭐`,
    toast_generation_success: 'Video generated! 🎬',
    toast_generation_cancelled: 'Generation cancelled',
    toast_prompt_required: 'Please enter a prompt first',
    toast_generation_failed: (msg) => `Failed to generate video: ${msg}`,
    progress_prefix: 'Progress:',
    rating_you: (n) => `Your rating: ${n}/5 ⭐`,
    rating_global: (n) => `Global rating: ${n}/5 ⭐`,
    no_comments: 'No comments yet',
    you_label: 'You'
  },
  id: {
    nav_home: 'Home',
    nav_lessons: 'Lessons',
    nav_create: 'Buat',
    nav_mylist: 'My List',
    brand_badge: 'WonderReel Kids',
    headline_adventure: 'Di Mana Setiap Pelajaran Jadi Petualangan',
    headline_subtitle: 'Tulis prompt, buat film pendek, dan belajar bersama.',
    hero_prompt_placeholder: 'Coba: Kisah laut lembut untuk mengajarkan warna pada anak',
    hero_duration_label: 'Durasi Maks',
    hero_duration_6: '6 detik',
    hero_duration_30: '30 detik',
    hero_duration_60: '1 menit',
    hero_duration_120: '2 menit',
    hero_duration_180: '3 menit',
    hero_prompt_btn: 'Buat',
    cta_create: 'Buat Video Baru',
    cta_view: 'Lihat Lessons',
    stat_total: 'Total Lessons',
    stat_favorites: 'Favorit',
    stat_avg_rating: 'Rata-rata',
    recent_title: '🎥 Lessons Terbaru',
    row_featured: 'Pilihan Utama',
    row_new: 'Baru & Menarik',
    row_favorites: 'Favorit Anda',
    row_favorites_empty: 'Simpan lesson agar muncul di sini',
    gallery_title: '🎬 Galeri Lessons',
    gallery_subtitle: 'Pilih video edukasi untuk anak Anda.',
    filter_all: 'Semua',
    filter_ocean: '🦈 Laut',
    filter_numbers: '🔢 Angka',
    filter_colors: '🎨 Warna',
    create_title: '✨ Buat Video Baru',
    create_subtitle: 'Gunakan AI untuk membuat video edukasi.',
    prompt_label: '💡 Prompt Video',
    prompt_placeholder: 'Contoh: Ikan kartun warna-warni berenang di laut untuk anak-anak',
    prompt_hint: 'Jelaskan video yang ingin dibuat. Pastikan ramah anak.',
    duration_prefix: '⏱️ Durasi:',
    duration_suffix: 'detik',
    category_label: '📚 Kategori',
    cat_general: 'Umum',
    cat_ocean: 'Hewan Laut',
    cat_animals: 'Hewan',
    cat_numbers: 'Angka',
    cat_colors: 'Warna',
    cat_alphabet: 'Huruf',
    generate_btn: 'Generate Video',
    gen_title: '🎬 Sedang membuat video...',
    gen_cancel: 'Batal',
    gen_preparing: 'Menyiapkan...',
    gen_eta: '⏱️ Perkiraan: 2–5 menit',
    sample_prompts: '💡 Contoh Prompt',
    prompt_ocean_title: 'Hewan Laut',
    prompt_numbers_title: 'Angka 1–10',
    prompt_colors_title: 'Warna Cerah',
    mylist_title: '❤️ My List',
    mylist_subtitle: 'Video tersimpan Anda',
    mylist_empty_title: 'Belum ada favorit',
    mylist_empty_desc: 'Simpan lesson agar mudah ditemukan lagi.',
    mylist_browse: 'Jelajahi Lessons',
    favorite_add: 'Tambah ke My List',
    favorite_remove: 'Hapus dari My List',
    rating_title: '⭐ Beri Rating',
    rating_none: 'Belum ada rating',
    comments_title: '💬 Komentar',
    comment_placeholder: 'Tulis komentar...',
    comment_send: 'Kirim',
    empty_lessons_title: 'Belum ada lesson',
    empty_lessons_desc: 'Tidak ada lesson untuk filter ini.',
    toast_favorite_updated: 'Favorit diperbarui!',
    toast_prompt_used: 'Prompt digunakan! ✨',
    toast_comment_required: 'Tulis komentar dulu ya',
    toast_comment_added: 'Komentar ditambahkan! 💬',
    toast_rating_given: (n) => `Rating ${n}/5 diberikan! ⭐`,
    toast_generation_success: 'Video berhasil digenerate! 🎬',
    toast_generation_cancelled: 'Generation dibatalkan',
    toast_prompt_required: 'Masukkan prompt terlebih dahulu',
    toast_generation_failed: (msg) => `Gagal generate video: ${msg}`,
    progress_prefix: 'Progress:',
    rating_you: (n) => `Rating Anda: ${n}/5 ⭐`,
    rating_global: (n) => `Rating global: ${n}/5 ⭐`,
    no_comments: 'Belum ada komentar',
    you_label: 'Anda'
  },
  zh: {
    nav_home: '首页',
    nav_lessons: '课程',
    nav_create: '生成',
    nav_mylist: '收藏',
    brand_badge: 'WonderReel Kids',
    headline_adventure: '让每一堂课都变成一场冒险',
    headline_subtitle: '输入提示词，生成短片，一起学习。',
    hero_prompt_placeholder: '试试：温柔的海洋故事，用来教孩子认识颜色',
    hero_duration_label: '最长时长',
    hero_duration_6: '6 秒',
    hero_duration_30: '30 秒',
    hero_duration_60: '1 分钟',
    hero_duration_120: '2 分钟',
    hero_duration_180: '3 分钟',
    hero_prompt_btn: '创建',
    cta_create: '生成新视频',
    cta_view: '查看课程',
    stat_total: '课程总数',
    stat_favorites: '已收藏',
    stat_avg_rating: '平均评分',
    recent_title: '🎥 最新课程',
    row_featured: '精选课程',
    row_new: '最新与热门',
    row_favorites: '你的收藏',
    row_favorites_empty: '收藏一个课程后会显示在这里',
    gallery_title: '🎬 课程库',
    gallery_subtitle: '为孩子选择一段教育视频。',
    filter_all: '全部',
    filter_ocean: '🦈 海洋',
    filter_numbers: '🔢 数字',
    filter_colors: '🎨 颜色',
    create_title: '✨ 生成新视频',
    create_subtitle: '使用 AI 生成教育视频。',
    prompt_label: '💡 视频提示词',
    prompt_placeholder: '示例：色彩鲜艳的卡通小鱼在海里游泳，适合儿童',
    prompt_hint: '描述你想生成的视频内容，保持儿童友好。',
    duration_prefix: '⏱️ 时长：',
    duration_suffix: '秒',
    category_label: '📚 分类',
    cat_general: '通用',
    cat_ocean: '海洋',
    cat_animals: '动物',
    cat_numbers: '数字',
    cat_colors: '颜色',
    cat_alphabet: '字母',
    generate_btn: '开始生成',
    gen_title: '🎬 正在生成视频...',
    gen_cancel: '取消',
    gen_preparing: '准备中...',
    gen_eta: '⏱️ 预计：2–5 分钟',
    sample_prompts: '💡 示例提示词',
    prompt_ocean_title: '海洋动物',
    prompt_numbers_title: '数字 1–10',
    prompt_colors_title: '明亮颜色',
    mylist_title: '❤️ 收藏',
    mylist_subtitle: '你保存的课程',
    mylist_empty_title: '还没有收藏',
    mylist_empty_desc: '收藏一个课程，方便下次快速找到。',
    mylist_browse: '浏览课程',
    favorite_add: '加入收藏',
    favorite_remove: '移出收藏',
    rating_title: '⭐ 评分',
    rating_none: '暂无评分',
    comments_title: '💬 评论',
    comment_placeholder: '写下评论...',
    comment_send: '发送',
    empty_lessons_title: '暂无课程',
    empty_lessons_desc: '该筛选条件下暂无课程。',
    toast_favorite_updated: '收藏已更新！',
    toast_prompt_used: '已应用提示词！✨',
    toast_comment_required: '请先输入评论内容',
    toast_comment_added: '评论已添加！💬',
    toast_rating_given: (n) => `你评分为 ${n}/5 ⭐`,
    toast_generation_success: '视频生成成功！🎬',
    toast_generation_cancelled: '已取消生成',
    toast_prompt_required: '请先输入提示词',
    toast_generation_failed: (msg) => `生成失败：${msg}`,
    progress_prefix: '进度：',
    rating_you: (n) => `你的评分：${n}/5 ⭐`,
    rating_global: (n) => `全站评分：${n}/5 ⭐`,
    no_comments: '暂无评论',
    you_label: '你'
  },
  ar: {
    nav_home: 'الرئيسية',
    nav_lessons: 'الدروس',
    nav_create: 'إنشاء',
    nav_mylist: 'قائمتي',
    brand_badge: 'WonderReel Kids',
    headline_adventure: 'حيث يتحول كل درس إلى مغامرة',
    headline_subtitle: 'اكتب النص، أنشئ فيلمًا قصيرًا، وتعلّموا معًا.',
    hero_prompt_placeholder: 'جرّب: قصة بحرية لطيفة لتعليم الألوان للأطفال',
    hero_duration_label: 'المدة القصوى',
    hero_duration_6: '6 ثوانٍ',
    hero_duration_30: '30 ثانية',
    hero_duration_60: 'دقيقة واحدة',
    hero_duration_120: 'دقيقتان',
    hero_duration_180: '3 دقائق',
    hero_prompt_btn: 'أنشئ',
    cta_create: 'إنشاء فيديو جديد',
    cta_view: 'عرض الدروس',
    stat_total: 'إجمالي الدروس',
    stat_favorites: 'المفضلة',
    stat_avg_rating: 'متوسط التقييم',
    recent_title: '🎥 أحدث الدروس',
    row_featured: 'دروس مميزة',
    row_new: 'جديد ومميز',
    row_favorites: 'مفضلاتك',
    row_favorites_empty: 'احفظ درسًا ليظهر هنا',
    gallery_title: '🎬 معرض الدروس',
    gallery_subtitle: 'اختر فيديو تعليميًا لطفلك.',
    filter_all: 'الكل',
    filter_ocean: '🦈 البحر',
    filter_numbers: '🔢 الأرقام',
    filter_colors: '🎨 الألوان',
    create_title: '✨ إنشاء فيديو جديد',
    create_subtitle: 'استخدم الذكاء الاصطناعي لإنشاء فيديو تعليمي.',
    prompt_label: '💡 نص الفيديو',
    prompt_placeholder: 'مثال: أسماك كرتونية ملونة تسبح في البحر للأطفال',
    prompt_hint: 'صف الفيديو الذي تريد إنشاءه مع مراعاة أن يكون مناسبًا للأطفال.',
    duration_prefix: '⏱️ المدة:',
    duration_suffix: 'ثانية',
    category_label: '📚 الفئة',
    cat_general: 'عام',
    cat_ocean: 'البحر',
    cat_animals: 'حيوانات',
    cat_numbers: 'أرقام',
    cat_colors: 'ألوان',
    cat_alphabet: 'حروف',
    generate_btn: 'إنشاء الفيديو',
    gen_title: '🎬 جارٍ إنشاء الفيديو...',
    gen_cancel: 'إلغاء',
    gen_preparing: 'جارٍ التحضير...',
    gen_eta: '⏱️ الوقت المتوقع: ٢–٥ دقائق',
    sample_prompts: '💡 أمثلة للنصوص',
    prompt_ocean_title: 'حيوانات البحر',
    prompt_numbers_title: 'الأرقام ١–١٠',
    prompt_colors_title: 'ألوان زاهية',
    mylist_title: '❤️ قائمتي',
    mylist_subtitle: 'الدروس المحفوظة',
    mylist_empty_title: 'لا توجد مفضلة بعد',
    mylist_empty_desc: 'احفظ درسًا لتجده بسهولة لاحقًا.',
    mylist_browse: 'تصفح الدروس',
    favorite_add: 'إضافة إلى قائمتي',
    favorite_remove: 'إزالة من قائمتي',
    rating_title: '⭐ قيّم الدرس',
    rating_none: 'لا يوجد تقييم بعد',
    comments_title: '💬 التعليقات',
    comment_placeholder: 'اكتب تعليقًا...',
    comment_send: 'إرسال',
    empty_lessons_title: 'لا توجد دروس',
    empty_lessons_desc: 'لا توجد دروس لهذا الفلتر.',
    toast_favorite_updated: 'تم تحديث المفضلة!',
    toast_prompt_used: 'تم استخدام النص! ✨',
    toast_comment_required: 'يرجى كتابة تعليق أولاً',
    toast_comment_added: 'تمت إضافة التعليق! 💬',
    toast_rating_given: (n) => `تم التقييم ${n}/5 ⭐`,
    toast_generation_success: 'تم إنشاء الفيديو! 🎬',
    toast_generation_cancelled: 'تم إلغاء الإنشاء',
    toast_prompt_required: 'يرجى إدخال النص أولاً',
    toast_generation_failed: (msg) => `فشل إنشاء الفيديو: ${msg}`,
    progress_prefix: 'التقدم:',
    rating_you: (n) => `تقييمك: ${n}/5 ⭐`,
    rating_global: (n) => `التقييم العام: ${n}/5 ⭐`,
    no_comments: 'لا توجد تعليقات بعد',
    you_label: 'أنت'
  }
};

function normalizeLang(lang) {
  if (!lang) return 'en';
  const normalized = String(lang).toLowerCase();
  return SUPPORTED_LANGS.includes(normalized) ? normalized : 'en';
}

function getDirForLang(lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

function setDocumentLang(lang) {
  document.documentElement.lang =
    lang === 'zh' ? 'zh-Hans' : lang === 'id' ? 'id' : lang === 'ar' ? 'ar' : 'en';
  document.documentElement.dir = getDirForLang(lang);
}

function t(key, ...args) {
  const lang = normalizeLang(appState.lang);
  const value = I18N?.[lang]?.[key] ?? I18N.en[key] ?? '';
  return typeof value === 'function' ? value(...args) : value;
}

// Sample Lessons Data
const sampleLessons = [
  {
    id: 'ocean-animals',
    title: { en: 'Ocean Animals', id: 'Hewan Laut', zh: '海洋动物', ar: 'حيوانات البحر' },
    description: {
      en: 'Learn about ocean animals with cheerful visuals.',
      id: 'Belajar tentang hewan laut dengan visual ceria.',
      zh: '用有趣的画面认识海洋动物。',
      ar: 'تعرّف على حيوانات البحر بصور ممتعة.'
    },
    category: 'numbers',
    duration: 30,
    videoUrl: 'assets/videos/ocean-animals-part1.mp4',
    thumbnail: 'assets/images/hero-bg.jpg',
    rating: 4.5,
    tags: ['ocean', 'animals', 'education']
  },
  {
    id: 'numbers-1-10',
    title: { en: 'Numbers 1–10', id: 'Angka 1–10', zh: '数字 1–10', ar: 'الأرقام ١–١٠' },
    description: {
      en: 'Practice counting with playful animations.',
      id: 'Belajar menghitung dengan animasi yang menyenangkan.',
      zh: '用可爱的动画练习数数。',
      ar: 'تعلّم العدّ مع رسوم متحركة ممتعة.'
    },
    category: 'numbers',
    duration: 30,
    videoUrl: 'assets/videos/ocean-animals-part2.mp4',
    thumbnail: 'assets/images/hero-bg.jpg',
    rating: 4.8,
    tags: ['numbers', 'math', 'education']
  },
  {
    id: 'colors-rainbow',
    title: { en: 'Bright Colors', id: 'Warna Cerah', zh: '明亮颜色', ar: 'ألوان زاهية' },
    description: {
      en: 'Explore bright colors in a fun way.',
      id: 'Kenali warna-warna cerah dengan cara yang seru.',
      zh: '用有趣的方式认识明亮的颜色。',
      ar: 'تعرّف على الألوان الزاهية بطريقة ممتعة.'
    },
    category: 'numbers',
    duration: 30,
    videoUrl: 'assets/videos/ocean-animals-part1.mp4',
    thumbnail: 'assets/images/hero-bg.jpg',
    rating: 4.2,
    tags: ['colors', 'rainbow', 'education']
  },
  {
    id: 'numbers-demo-1',
    title: { en: 'Numbers Demo 1' },
    description: { en: 'Demo lesson video.' },
    category: 'numbers',
    duration: 30,
    videoUrl: 'assets/videos/wonderreel_task_1780123050481_zadsewfg5.mp4',
    thumbnail: 'assets/images/hero-bg.jpg',
    rating: 4.9,
    tags: ['numbers', 'demo']
  },
  {
    id: 'numbers-demo-2',
    title: { en: 'Numbers Demo 2' },
    description: { en: 'Demo lesson video.' },
    category: 'numbers',
    duration: 30,
    videoUrl: 'assets/videos/wonderreel_task_1780129496002_dv07iiwb7.mp4',
    thumbnail: 'assets/images/hero-bg.jpg',
    rating: 4.9,
    tags: ['numbers', 'demo']
  },
  {
    id: 'numbers-demo-3',
    title: { en: 'Numbers Demo 3' },
    description: { en: 'Demo lesson video.' },
    category: 'numbers',
    duration: 30,
    videoUrl: 'assets/videos/wonderreel_task_1780131616348_wx3dww1ag.mp4',
    thumbnail: 'assets/images/hero-bg.jpg',
    rating: 4.9,
    tags: ['numbers', 'demo']
  },
  {
    id: 'numbers-demo-4',
    title: { en: 'Numbers Demo 4' },
    description: { en: 'Demo lesson video.' },
    category: 'numbers',
    duration: 30,
    videoUrl: 'assets/videos/wonderreel_task_1780132148732_4gfvgr19t.mp4',
    thumbnail: 'assets/images/hero-bg.jpg',
    rating: 4.9,
    tags: ['numbers', 'demo']
  },
  {
    id: 'numbers-demo-5',
    title: { en: 'Numbers Demo 5' },
    description: { en: 'Demo lesson video.' },
    category: 'numbers',
    duration: 30,
    videoUrl: 'assets/videos/wonderreel_task_1780132423847_l5fqoxel5.mp4',
    thumbnail: 'assets/images/hero-bg.jpg',
    rating: 4.9,
    tags: ['numbers', 'demo']
  }
];

function getGeneratedLessons() {
  const stored = localStorage.getItem(GENERATED_LESSONS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    void e;
    return [];
  }
}

function saveGeneratedLessons(lessons) {
  try {
    localStorage.setItem(GENERATED_LESSONS_KEY, JSON.stringify(lessons));
  } catch (e) {
    void e;
  }
}

function getAllLessons() {
  return [...getGeneratedLessons(), ...sampleLessons];
}

// Application State
let appState = {
  currentLesson: null,
  generationTaskId: null,
  generationPollInterval: null,
  lang: 'en',
  heroCategory: 'general'
};

const HERO_CATEGORY_PROMPTS = {
  general: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video — the friendly intro.
Subject & action: a cute round owl mascot with big sparkly eyes waves hello and hops happily on a
floating storybook island surrounded by drifting clouds and twinkling stars.
Camera: slow gentle push-in with a soft bounce.
Lighting: warm morning sunlight, soft and glowing.
Visual style: soft 3D Pixar-style, rounded shapes, bright pastel palette, glossy, kawaii.
Scene purpose: warmly welcome kids and set a safe, playful mood for learning.`,
  ocean: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about the ocean.
Subject & action: a smiling baby sea turtle glides past a colorful coral reef while a friendly clownfish
and a cheerful dolphin swim playfully nearby, gentle bubbles rising.
Camera: smooth underwater glide following the turtle.
Lighting: bright sun rays filtering through clear blue water, sparkling caustics.
Visual style: soft 3D Pixar-style, rounded shapes, vivid aqua-and-coral palette, glossy, kawaii.
Scene purpose: introduce ocean animals and spark a love for the sea.`,
  animals: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about animals.
Subject & action: a playful lion cub, a gentle elephant flapping its ears, and a hopping bunny greet the
viewer one by one in a sunny green meadow with rolling hills.
Camera: light bouncy pan across the three animals.
Lighting: golden afternoon sun, warm and soft.
Visual style: soft 3D Pixar-style, rounded shapes, bright pastel palette, glossy, kawaii.
Scene purpose: teach common animal names and their sounds.`,
  numbers: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about counting.
Subject & action: big friendly 3D numbers 1, 2, 3 bounce up one by one, each followed by matching objects
popping in — one red apple, two yellow balloons, three orange stars.
Camera: playful bounce and slight zoom with each number.
Lighting: bright even studio light, cheerful.
Visual style: soft 3D Pixar-style, rounded shapes, bright pastel palette, glossy, kawaii.
Scene purpose: teach counting from 1 to 3 with clear visual matching.`,
  colors: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about colors.
Subject & action: a cheerful paintbrush character splashes a rainbow — red, then yellow, blue, and green —
across the screen, each splash blooming into a matching balloon.
Camera: quick playful whip between splashes, then settle.
Lighting: bright, vibrant, saturated.
Visual style: soft 3D Pixar-style, rounded shapes, bright pastel palette, glossy, kawaii.
Scene purpose: teach primary color names through joyful color reveals.`,
  alphabet: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about the alphabet.
Subject & action: large glossy 3D letters A, B, C pop up one by one, each with a friendly object —
A with a shiny apple, B with a bouncing ball, C with a smiling cat.
Camera: gentle pop-and-zoom on each letter.
Lighting: bright and cheerful, soft shadows.
Visual style: soft 3D Pixar-style, rounded shapes, bright pastel palette, glossy, kawaii.
Scene purpose: introduce letters A–C and beginning phonics.`
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎬 WonderReel Initialized');
  initializeApp();
});

function initializeApp() {
  loadAppState();
  initLanguage();
  setupNavigation();
  setupEventListeners();
  applyTranslations();
  initHeroDefaults();
  renderDashboard();
  renderGallery();
  renderMyList();
  updateStats();
}

function initHeroDefaults() {
  const categoryTags = document.querySelectorAll('.category-tag');
  const selected = appState.heroCategory || 'general';
  categoryTags.forEach((tag) => {
    tag.classList.toggle('active', tag.dataset.category === selected);
  });

  const heroPromptInput = document.getElementById('heroPromptInput');
  if (heroPromptInput) {
    heroPromptInput.value = HERO_CATEGORY_PROMPTS[selected] || HERO_CATEGORY_PROMPTS.general;
  }

  const heroDuration = document.getElementById('heroDurationSelect');
  if (heroDuration) {
    heroDuration.value = '6';
  }
}

function initLanguage() {
  const storedLang = normalizeLang(localStorage.getItem(LANG_STORAGE_KEY));
  appState.lang = storedLang || 'en';
  setDocumentLang(appState.lang);

  const select = document.getElementById('langSelect');
  if (select) {
    select.value = appState.lang;
  }
}

// ==================== STATE MANAGEMENT ====================

function loadAppState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      appState = { ...appState, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Error loading state:', e);
    }
  }
}

function applyTranslations() {
  setDocumentLang(appState.lang);

  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    el.textContent = t(key);
  });

  const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (!key) return;
    el.setAttribute('placeholder', t(key));
  });
}

function saveAppState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

function getUserData() {
  const stored = localStorage.getItem('wonderreel_user_data');
  if (!stored) {
    const userData = {
      favorites: [],
      ratings: {},
      comments: {}
    };
    localStorage.setItem('wonderreel_user_data', JSON.stringify(userData));
    return userData;
  }
  return JSON.parse(stored);
}

function saveUserData(userData) {
  localStorage.setItem('wonderreel_user_data', JSON.stringify(userData));
}

// ==================== NAVIGATION ====================

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href').substring(1);
      
      // Update nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Update sections
      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetId) {
          section.classList.add('active');
        }
      });
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Update URL hash
      history.pushState(null, '', `#${targetId}`);
    });
  });
  
  // Handle initial hash
  const hash = window.location.hash.substring(1);
  if (hash) {
    navigateTo(hash);
  }
}

function navigateTo(sectionId) {
  const navItem = document.querySelector(`.nav-item[href="#${sectionId}"]`);
  if (navItem) {
    navItem.click();
  }
}

function startFromHero(autoGenerate = false) {
  const heroInput = document.getElementById('heroPromptInput');
  const heroDuration = document.getElementById('heroDurationSelect');

  const promptInput = document.getElementById('promptInput');
  const categoryInput = document.getElementById('categoryInput');
  const durationInput = document.getElementById('durationInput');
  const durationValue = document.getElementById('durationValue');

  const promptValue = heroInput ? heroInput.value.trim() : '';

  if (promptInput && promptValue) {
    promptInput.value = promptValue;
  }

  if (categoryInput) {
    categoryInput.value = appState.heroCategory || 'general';
  }

  if (durationInput && heroDuration) {
    durationInput.value = heroDuration.value;
    if (durationValue) durationValue.textContent = heroDuration.value;
  }

  navigateTo('generate');

  const promptInputAfter = document.getElementById('promptInput');
  if (promptInputAfter) {
    promptInputAfter.focus();
  }

  if (autoGenerate && promptValue) {
    setTimeout(() => {
      generateVideo();
    }, 250);
  }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Language selector
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const lang = normalizeLang(e.target.value);
      appState.lang = lang;
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      applyTranslations();
      renderDashboard();
      renderGallery(getActiveFilter());
      renderMyList();
      updateStats();
      if (appState.currentLesson) {
        openLessonModal(appState.currentLesson.id);
      }
    });
  }

  const categoryTags = document.querySelectorAll('.category-tag');
  categoryTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      categoryTags.forEach((t) => t.classList.remove('active'));
      tag.classList.add('active');
      const category = tag.dataset.category || 'general';
      appState.heroCategory = category;
      const heroPromptInput = document.getElementById('heroPromptInput');
      if (heroPromptInput) {
        heroPromptInput.value = HERO_CATEGORY_PROMPTS[category] || HERO_CATEGORY_PROMPTS.general;
        heroPromptInput.focus();
      }
      const heroDuration = document.getElementById('heroDurationSelect');
      if (heroDuration) {
        heroDuration.value = '6';
      }
    });
  });

  // Duration slider
  const durationInput = document.getElementById('durationInput');
  const durationValue = document.getElementById('durationValue');
  if (durationInput && durationValue) {
    durationInput.addEventListener('input', (e) => {
      durationValue.textContent = e.target.value;
    });
  }
  
  // Filter chips
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      renderGallery(filter);
    });
  });
  
  // Star rating
  const stars = document.querySelectorAll('.star-rating .star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      setRating(rating);
    });
  });
  
  // Close modal on background click
  const modal = document.getElementById('videoModal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function getActiveFilter() {
  const active = document.querySelector('.filter-chip.active');
  return active?.dataset?.filter || 'all';
}

// ==================== RENDERING ====================

function renderDashboard() {
  renderHomeRows();
}

function renderHomeRows() {
  const featuredEl = document.getElementById('rowFeatured');
  const newEl = document.getElementById('rowNew');
  const favoritesEl = document.getElementById('rowFavorites');

  if (!featuredEl || !newEl || !favoritesEl) return;

  const userData = getUserData();

  const all = getAllLessons();
  const featured = all.slice(0, 10);
  const newest = [...all].reverse().slice(0, 10);
  const favorites = all.filter((lesson) => userData.favorites.includes(lesson.id));

  featuredEl.innerHTML = featured.map((lesson) => createLessonTile(lesson)).join('');
  newEl.innerHTML = newest.map((lesson) => createLessonTile(lesson)).join('');

  if (favorites.length === 0) {
    favoritesEl.innerHTML = createEmptyTile(t('row_favorites_empty'));
  } else {
    favoritesEl.innerHTML = favorites.map((lesson) => createLessonTile(lesson)).join('');
  }

  [featuredEl, newEl, favoritesEl].forEach((container) => {
    container.querySelectorAll('[data-lesson-id]').forEach((card) => {
      card.addEventListener('click', () => openLessonModal(card.dataset.lessonId));
    });
  });
}

function createEmptyTile(text) {
  return `
    <article class="lesson-tile lesson-tile-empty">
      <div class="lesson-tile-empty-inner">
        <div class="lesson-tile-empty-icon">❤️</div>
        <div class="lesson-tile-empty-text">${text}</div>
      </div>
    </article>
  `;
}

function createLessonTile(lesson) {
  const userData = getUserData();
  const isFavorite = userData.favorites.includes(lesson.id);
  const lang = normalizeLang(appState.lang);
  const title = lesson.title?.[lang] ?? lesson.title?.en ?? '';
  const categoryLabel = getCategoryLabel(lesson.category);

  return `
    <article class="lesson-tile" data-lesson-id="${lesson.id}">
      <div class="lesson-tile-thumb">
        <img src="${lesson.thumbnail}" alt="${title}" loading="lazy">
        <div class="lesson-tile-overlay">
          <div class="lesson-tile-badge">${categoryLabel}</div>
          <div class="lesson-tile-actions">
            <div class="lesson-tile-play">▶</div>
            ${isFavorite ? '<div class="lesson-tile-fav">❤️</div>' : ''}
          </div>
        </div>
      </div>
      <div class="lesson-tile-meta">
        <div class="lesson-tile-title">${title}</div>
        <div class="lesson-tile-sub">
          <span class="lesson-tile-rating">⭐ ${lesson.rating}</span>
          <span class="lesson-tile-dot">•</span>
          <span class="lesson-tile-duration">⏱️ ${lesson.duration}s</span>
        </div>
      </div>
    </article>
  `;
}

function renderGallery(filter = 'all') {
  const galleryContainer = document.getElementById('galleryLessons');
  let lessons = getAllLessons();
  
  if (filter !== 'all') {
    lessons = lessons.filter(lesson => lesson.category === filter);
  }
  
  if (lessons.length === 0) {
    galleryContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🎬</div>
        <h3>${t('empty_lessons_title')}</h3>
        <p>${t('empty_lessons_desc')}</p>
      </div>
    `;
    return;
  }
  
  galleryContainer.innerHTML = lessons.map(lesson => createLessonCard(lesson)).join('');
  
  // Add click listeners
  galleryContainer.querySelectorAll('.lesson-card').forEach(card => {
    card.addEventListener('click', () => openLessonModal(card.dataset.lessonId));
  });
}

function renderMyList() {
  const myListContainer = document.getElementById('myListLessons');
  const emptyState = document.getElementById('emptyMyList');
  const userData = getUserData();
  
  if (userData.favorites.length === 0) {
    myListContainer.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  const favoriteLessons = getAllLessons().filter(lesson => 
    userData.favorites.includes(lesson.id)
  );
  
  myListContainer.innerHTML = favoriteLessons.map(lesson => createLessonCard(lesson)).join('');
  
  // Add click listeners
  myListContainer.querySelectorAll('.lesson-card').forEach(card => {
    card.addEventListener('click', () => openLessonModal(card.dataset.lessonId));
  });
}

function createLessonCard(lesson) {
  const userData = getUserData();
  const isFavorite = userData.favorites.includes(lesson.id);
  const lang = normalizeLang(appState.lang);
  const title = lesson.title?.[lang] ?? lesson.title?.en ?? '';
  const categoryLabel = getCategoryLabel(lesson.category);
  
  return `
    <article class="lesson-card" data-lesson-id="${lesson.id}">
      <div class="lesson-thumbnail">
        <img src="${lesson.thumbnail}" alt="${title}" loading="lazy">
        <div class="play-overlay">▶️</div>
      </div>
      <div class="lesson-content">
        <h3 class="lesson-title">${title}</h3>
        <div class="lesson-meta">
          <span class="lesson-category">${categoryLabel}</span>
          <span class="lesson-rating">⭐ ${lesson.rating}</span>
        </div>
        <p style="font-size: 0.85rem; color: #666;">
          ⏱️ ${lesson.duration}s
          ${isFavorite ? '<span style="color: #FF6B9D;"> ❤️</span>' : ''}
        </p>
      </div>
    </article>
  `;
}

function getCategoryLabel(category) {
  const map = {
    ocean: { emoji: '🦈', key: 'cat_ocean' },
    animals: { emoji: '🐾', key: 'cat_animals' },
    numbers: { emoji: '🔢', key: 'cat_numbers' },
    colors: { emoji: '🎨', key: 'cat_colors' },
    alphabet: { emoji: '🔤', key: 'cat_alphabet' },
    general: { emoji: '✨', key: 'cat_general' }
  };
  const meta = map[category] || map.general;
  return `${meta.emoji} ${t(meta.key)}`;
}

function updateStats() {
  const userData = getUserData();
  
  // Total lessons
  const totalEl = document.getElementById('totalLessons');
  if (totalEl) totalEl.textContent = getAllLessons().length;
  
  // Favorites count
  const favEl = document.getElementById('favoritesCount');
  if (favEl) favEl.textContent = userData.favorites.length;
  
  // Average rating
  const ratings = Object.values(userData.ratings);
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '0.0';
  const avgEl = document.getElementById('avgRating');
  if (avgEl) avgEl.textContent = avgRating;
}

// ==================== VIDEO MODAL ====================

function openLessonModal(lessonId) {
  const lesson = getAllLessons().find(l => l.id === lessonId);
  if (!lesson) return;
  
  appState.currentLesson = lesson;
  const lang = normalizeLang(appState.lang);
  const title = lesson.title?.[lang] ?? lesson.title?.en ?? '';
  const description = lesson.description?.[lang] ?? lesson.description?.en ?? '';
  
  const modal = document.getElementById('videoModal');
  
  // Update modal content
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDescription').textContent = description;
  document.getElementById('modalDuration').textContent = `⏱️ ${lesson.duration}s`;
  document.getElementById('modalCategory').textContent = getCategoryLabel(lesson.category);
  
  // Update video source
  const video = document.getElementById('modalVideo');
  if (lesson.videoUrl) {
    video.src = lesson.videoUrl;
    video.poster = lesson.thumbnail;
  } else {
    video.src = '';
    video.poster = lesson.thumbnail;
  }
  
  // Update favorite button
  updateFavoriteButton();
  
  // Update rating display
  updateRatingDisplay();
  
  // Load comments
  loadComments();
  
  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('videoModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  
  // Stop video
  const video = document.getElementById('modalVideo');
  video.pause();
  video.src = '';
  
  appState.currentLesson = null;
}

// ==================== FAVORITES ====================

function updateFavoriteButton() {
  if (!appState.currentLesson) return;
  
  const userData = getUserData();
  const isFavorite = userData.favorites.includes(appState.currentLesson.id);
  
  const icon = document.getElementById('favoriteIcon');
  const text = document.getElementById('favoriteText');
  
  icon.textContent = isFavorite ? '❤️' : '🤍';
  text.textContent = isFavorite ? t('favorite_remove') : t('favorite_add');
}

function toggleFavorite() {
  if (!appState.currentLesson) return;
  
  const userData = getUserData();
  const lessonId = appState.currentLesson.id;
  
  if (userData.favorites.includes(lessonId)) {
    userData.favorites = userData.favorites.filter(id => id !== lessonId);
  } else {
    userData.favorites.push(lessonId);
  }
  
  saveUserData(userData);
  updateFavoriteButton();
  updateStats();
  renderMyList();
  
  // Show feedback
  showToast(t('toast_favorite_updated'), 'success');
}

// ==================== RATINGS ====================

function updateRatingDisplay() {
  if (!appState.currentLesson) return;
  
  const userData = getUserData();
  const userRating = userData.ratings[appState.currentLesson.id] || 0;
  const lessonRating = appState.currentLesson.rating;
  
  const stars = document.querySelectorAll('.star-rating .star');
  stars.forEach((star, index) => {
    if (index < userRating) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });
  
  const ratingText = document.getElementById('ratingText');
  if (userRating > 0) {
    ratingText.textContent = t('rating_you', userRating);
  } else {
    ratingText.textContent = t('rating_global', lessonRating);
  }
}

function setRating(rating) {
  if (!appState.currentLesson) return;
  
  const userData = getUserData();
  userData.ratings[appState.currentLesson.id] = rating;
  saveUserData(userData);
  
  updateRatingDisplay();
  updateStats();
  
  // Animation feedback
  const stars = document.querySelectorAll('.star-rating .star');
  stars.forEach((star, index) => {
    if (index < rating) {
      setTimeout(() => {
        star.classList.add('filled');
      }, index * 100);
    }
  });
  
  showToast(t('toast_rating_given', rating), 'success');
}

// ==================== COMMENTS ====================

function loadComments() {
  if (!appState.currentLesson) return;
  
  const userData = getUserData();
  const comments = userData.comments[appState.currentLesson.id] || [];
  
  const commentsList = document.getElementById('commentsList');
  
  if (comments.length === 0) {
    commentsList.innerHTML = `<p style="color: #666; text-align: center;">${t('no_comments')}</p>`;
    return;
  }
  
  commentsList.innerHTML = comments.map(comment => `
    <div class="comment-item">
      <div class="comment-author">${comment.author}</div>
      <div class="comment-text">${comment.text}</div>
      <div class="comment-time">${formatTimeAgo(comment.timestamp)}</div>
    </div>
  `).join('');
}

function addComment() {
  if (!appState.currentLesson) return;
  
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  
  if (!text) {
    showToast(t('toast_comment_required'), 'error');
    return;
  }
  
  const userData = getUserData();
  const lessonId = appState.currentLesson.id;
  
  if (!userData.comments[lessonId]) {
    userData.comments[lessonId] = [];
  }
  
  const comment = {
    author: t('you_label'),
    text: text,
    timestamp: Date.now()
  };
  
  userData.comments[lessonId].unshift(comment);
  saveUserData(userData);
  
  input.value = '';
  loadComments();
  
  showToast(t('toast_comment_added'), 'success');
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit yang lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam yang lalu`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari yang lalu`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('id-ID');
}

// ==================== VIDEO GENERATION ====================

async function generateVideo() {
  const promptInput = document.getElementById('promptInput');
  const durationInput = document.getElementById('durationInput');
  const categoryInput = document.getElementById('categoryInput');
  const generateBtn = document.getElementById('generateBtn');
  const progressCard = document.getElementById('generationProgress');
  
  const prompt = promptInput.value.trim();
  
  if (!prompt) {
    showToast(t('toast_prompt_required'), 'error');
    return;
  }
  
  // Show progress
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span>⏳</span> ...';
  progressCard.style.display = 'block';
  
  try {
    // Call backend API
    const response = await fetch(`${getApiBaseUrl()}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: parseInt(durationInput.value),
        category: categoryInput.value
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      appState.generationTaskId = result.data.taskId;
      startPolling();
    } else {
      throw new Error(result.error?.message || 'Generation failed');
    }
  } catch (error) {
    console.error('Generation error:', error);
    
    // For demo, simulate successful generation
    simulateGeneration();
  }
}

function startPolling() {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  let progress = 0;
  
  appState.generationPollInterval = setInterval(async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/generate/${appState.generationTaskId}`);
      const result = await response.json();
      
      if (result.success) {
        progress = result.data.progress;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${t('progress_prefix')} ${progress}%`;
        
        if (result.data.status === 'completed') {
          clearInterval(appState.generationPollInterval);
          completeGeneration(result.data);
        } else if (result.data.status === 'failed') {
          clearInterval(appState.generationPollInterval);
          failGeneration(result.data.error);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
      progress += 10;
      progressFill.style.width = `${Math.min(progress, 95)}%`;
      progressText.textContent = `Progress: ${Math.min(progress, 95)}%`;
      
      if (progress >= 95) {
        clearInterval(appState.generationPollInterval);
        simulateGeneration();
      }
    }
  }, 3000);
}

function simulateGeneration() {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const promptInput = document.getElementById('promptInput');
  const durationInput = document.getElementById('durationInput');
  const categoryInput = document.getElementById('categoryInput');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      completeGeneration({
        taskId: appState.generationTaskId || `demo_${Date.now()}`,
        status: 'completed',
        progress: 100,
        videoUrl: 'assets/videos/ocean-animals-part1.mp4',
        error: null,
        prompt: promptInput?.value || '',
        duration: parseInt(durationInput?.value || '6', 10),
        createdAt: new Date().toISOString()
      });
    }
    
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Progress: ${Math.floor(progress)}%`;
  }, 500);
}

function completeGeneration(taskData) {
  const generateBtn = document.getElementById('generateBtn');
  const progressCard = document.getElementById('generationProgress');
  const promptInput = document.getElementById('promptInput');
  const durationInput = document.getElementById('durationInput');
  const categoryInput = document.getElementById('categoryInput');
  
  generateBtn.disabled = false;
  generateBtn.innerHTML = `<span>✨</span> ${t('generate_btn')}`;
  progressCard.style.display = 'none';
  
  try {
    const prompt = (taskData?.prompt ?? promptInput?.value ?? '').trim();
    const duration = Number.parseInt(taskData?.duration ?? durationInput?.value ?? '6', 10);
    const category = (taskData?.category ?? categoryInput?.value ?? 'general');
    const videoUrl = toAbsoluteAssetUrl(taskData?.videoUrl) || 'assets/videos/ocean-animals-part1.mp4';
    const createdAt = taskData?.createdAt || new Date().toISOString();
    const id = taskData?.taskId || appState.generationTaskId || `gen_${Date.now()}`;

    const lessonTitle = {
      en: 'Generated Lesson',
      id: 'Lesson Buatan',
      zh: '生成课程',
      ar: 'درس مُولَّد'
    };

    const shortDesc = prompt ? prompt.slice(0, 140) : 'Generated video.';
    const lessonDesc = { en: shortDesc, id: shortDesc, zh: shortDesc, ar: shortDesc };

    const generatedLesson = {
      id,
      title: lessonTitle,
      description: lessonDesc,
      category,
      duration: Number.isFinite(duration) ? duration : 6,
      videoUrl,
      thumbnail: 'assets/images/hero-bg.jpg',
      rating: 5.0,
      tags: [category, 'generated']
    };

    const current = getGeneratedLessons();
    const next = [generatedLesson, ...current.filter((l) => l?.id !== id)].slice(0, 50);
    saveGeneratedLessons(next);
    renderDashboard();
    renderGallery(getActiveFilter());
    renderMyList();
    updateStats();
  } catch (e) {
    void e;
  }

  showToast(t('toast_generation_success'), 'success');
  
  // Navigate to gallery
  setTimeout(() => {
    navigateTo('gallery');
  }, 1500);
}

function failGeneration(error) {
  const generateBtn = document.getElementById('generateBtn');
  const progressCard = document.getElementById('generationProgress');
  
  generateBtn.disabled = false;
  generateBtn.innerHTML = `<span>✨</span> ${t('generate_btn')}`;
  progressCard.style.display = 'none';
  
  showToast(t('toast_generation_failed', error), 'error');
}

function cancelGeneration() {
  if (appState.generationPollInterval) {
    clearInterval(appState.generationPollInterval);
  }
  
  const generateBtn = document.getElementById('generateBtn');
  const progressCard = document.getElementById('generationProgress');
  
  generateBtn.disabled = false;
  generateBtn.innerHTML = `<span>✨</span> ${t('generate_btn')}`;
  progressCard.style.display = 'none';
  
  showToast(t('toast_generation_cancelled'), 'info');
}

function useHeroPrompt(element) {
  const promptText = element.querySelector('.prompt-content p').textContent;
  const heroPromptInput = document.getElementById('heroPromptInput');
  if (!heroPromptInput) return;
  heroPromptInput.value = promptText;
  heroPromptInput.focus();
  showToast(t('toast_prompt_used'), 'success');
}

function usePrompt(element) {
  const promptText = element.querySelector('.prompt-content p').textContent;
  const promptInput = document.getElementById('promptInput');
  promptInput.value = promptText;
  promptInput.focus();
  
  // Scroll to input
  promptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  showToast(t('toast_prompt_used'), 'success');
}

// ==================== TOAST NOTIFICATIONS ====================

function showToast(message, type = 'info') {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#4ECDC4' : type === 'error' ? '#FF6B9D' : '#6BCBFB'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 600;
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Auto remove
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
