export type Lang = 'en' | 'id' | 'zh' | 'ar';
export type PromptCategory = 'general' | 'ocean' | 'animals' | 'numbers' | 'colors' | 'alphabet';

const RAW_TEMPLATES: Record<Lang, Record<PromptCategory, string>> = {
  en: {
    general: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video — the friendly intro.
Subject & action: a cute round owl mascot with big sparkly eyes waves hello and hops happily on a
floating storybook island surrounded by drifting clouds and twinkling stars.
Camera: slow gentle push-in with a soft bounce.
Lighting: warm morning sunlight, soft and glowing.
Visual style: soft 3D animated-movie style, rounded friendly shapes, bright pastel palette, glossy, kawaii.
Scene purpose: warmly welcome kids and set a safe, playful mood for learning.`,
    ocean: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about the ocean.
Subject & action: a smiling baby sea turtle glides past a colorful coral reef while a friendly clownfish
and a cheerful dolphin swim playfully nearby, gentle bubbles rising.
Camera: smooth underwater glide following the turtle.
Lighting: bright sun rays filtering through clear blue water, sparkling caustics.
Visual style: soft 3D animated-movie style, rounded friendly shapes, vivid aqua-and-coral palette, glossy, kawaii.
Scene purpose: introduce ocean animals and spark a love for the sea.`,
    animals: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about animals.
Subject & action: a playful lion cub, a gentle elephant flapping its ears, and a hopping bunny greet the
viewer one by one in a sunny green meadow with rolling hills.
Camera: light bouncy pan across the three animals.
Lighting: golden afternoon sun, warm and soft.
Visual style: soft 3D animated-movie style, rounded friendly shapes, bright pastel palette, glossy, kawaii.
Scene purpose: teach common animal names and their sounds.`,
    numbers: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about counting.
Subject & action: big friendly 3D numbers 1, 2, 3 bounce up one by one, each followed by matching objects
popping in — one red apple, two yellow balloons, three orange stars.
Camera: playful bounce and slight zoom with each number.
Lighting: bright even studio light, cheerful.
Visual style: soft 3D animated-movie style, rounded friendly shapes, bright pastel palette, glossy, kawaii.
Scene purpose: teach counting from 1 to 3 with clear visual matching.`,
    colors: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about colors.
Subject & action: a cheerful paintbrush character splashes a rainbow — red, then yellow, blue, and green —
across the screen, each splash blooming into a matching balloon.
Camera: quick playful whip between splashes, then settle.
Lighting: bright, vibrant, saturated.
Visual style: soft 3D animated-movie style, rounded friendly shapes, bright pastel palette, glossy, kawaii.
Scene purpose: teach primary color names through joyful color reveals.`,
    alphabet: `Use PixVerse V6 to generate a 6-second 16:9 shot for a children's educational video about the alphabet.
Subject & action: large glossy 3D letters A, B, C pop up one by one, each with a friendly object —
A with a shiny apple, B with a bouncing ball, C with a smiling cat.
Camera: gentle pop-and-zoom on each letter.
Lighting: bright and cheerful, soft shadows.
Visual style: soft 3D animated-movie style, rounded friendly shapes, bright pastel palette, glossy, kawaii.
Scene purpose: introduce letters A–C and beginning phonics.`
  },
  id: {
    general: `Gunakan PixVerse V6 untuk membuat shot 16:9 berdurasi 6 detik untuk video edukasi anak — intro yang ramah.
Subjek & aksi: maskot burung hantu bulat yang lucu dengan mata besar berkilau melambaikan tangan dan melompat gembira di
pulau buku cerita yang mengambang, dikelilingi awan yang bergerak perlahan dan bintang yang berkelip.
Kamera: push-in pelan dan lembut dengan sedikit bounce.
Pencahayaan: sinar matahari pagi yang hangat, lembut dan glowing.
Gaya visual: 3D animasi lembut, bentuk membulat ramah, palet pastel cerah, glossy, kawaii.
Tujuan scene: menyambut anak dengan hangat dan membangun mood belajar yang aman dan menyenangkan.`,
    ocean: `Gunakan PixVerse V6 untuk membuat shot 16:9 berdurasi 6 detik untuk video edukasi anak tentang lautan.
Subjek & aksi: bayi penyu yang tersenyum meluncur melewati terumbu karang warna-warni, ditemani ikan badut yang ramah
dan lumba-lumba ceria yang berenang bermain di dekatnya, gelembung halus naik perlahan.
Kamera: glide bawah air yang halus mengikuti penyu.
Pencahayaan: sinar matahari terang menembus air biru jernih, caustics berkilau.
Gaya visual: 3D animasi lembut, bentuk membulat ramah, palet aqua & coral yang vivid, glossy, kawaii.
Tujuan scene: mengenalkan hewan laut dan menumbuhkan rasa cinta pada lautan.`,
    animals: `Gunakan PixVerse V6 untuk membuat shot 16:9 berdurasi 6 detik untuk video edukasi anak tentang hewan.
Subjek & aksi: anak singa yang playful, gajah lembut yang mengepakkan telinga, dan kelinci yang melompat menyapa
penonton satu per satu di padang rumput hijau yang cerah dengan bukit-bukit bergelombang.
Kamera: pan ringan dan bouncy melintasi tiga hewan.
Pencahayaan: matahari sore keemasan, hangat dan lembut.
Gaya visual: 3D animasi lembut, bentuk membulat ramah, palet pastel cerah, glossy, kawaii.
Tujuan scene: mengajarkan nama hewan umum dan suara mereka.`,
    numbers: `Gunakan PixVerse V6 untuk membuat shot 16:9 berdurasi 6 detik untuk video edukasi anak tentang berhitung.
Subjek & aksi: angka 3D besar dan ramah 1, 2, 3 memantul satu per satu, diikuti objek yang sesuai muncul —
satu apel merah, dua balon kuning, tiga bintang oranye.
Kamera: bounce playful dan sedikit zoom pada tiap angka.
Pencahayaan: lampu studio terang merata, ceria.
Gaya visual: 3D animasi lembut, bentuk membulat ramah, palet pastel cerah, glossy, kawaii.
Tujuan scene: mengajarkan berhitung 1 sampai 3 dengan pencocokan visual yang jelas.`,
    colors: `Gunakan PixVerse V6 untuk membuat shot 16:9 berdurasi 6 detik untuk video edukasi anak tentang warna.
Subjek & aksi: karakter kuas cat yang ceria memercikkan pelangi — merah, lalu kuning, biru, dan hijau —
di layar, setiap percikan mekar menjadi balon dengan warna yang sama.
Kamera: whip cepat dan playful antar percikan, lalu settle.
Pencahayaan: terang, vibrant, saturated.
Gaya visual: 3D animasi lembut, bentuk membulat ramah, palet pastel cerah, glossy, kawaii.
Tujuan scene: mengajarkan nama warna primer lewat reveal warna yang menyenangkan.`,
    alphabet: `Gunakan PixVerse V6 untuk membuat shot 16:9 berdurasi 6 detik untuk video edukasi anak tentang alfabet.
Subjek & aksi: huruf 3D glossy besar A, B, C muncul satu per satu, masing-masing dengan objek ramah —
A dengan apel mengilap, B dengan bola yang memantul, C dengan kucing tersenyum.
Kamera: pop-and-zoom lembut pada tiap huruf.
Pencahayaan: terang dan ceria, bayangan lembut.
Gaya visual: 3D animasi lembut, bentuk membulat ramah, palet pastel cerah, glossy, kawaii.
Tujuan scene: mengenalkan huruf A–C dan fonik dasar.`
  },
  zh: {
    general: `使用 PixVerse V6 生成一段 6 秒、16:9 的儿童教育视频镜头——友好的开场。
主体与动作：一只圆滚滚的可爱猫头鹰吉祥物，闪亮的大眼睛眨呀眨，挥手打招呼，并在漂浮的故事书小岛上开心跳跃，
周围是缓缓飘动的云朵与闪烁的星星。
镜头：缓慢柔和推进，带一点轻盈弹跳感。
光照：温暖的清晨阳光，柔和发光。
视觉风格：柔软 3D 皮克斯风、圆润造型、明亮粉彩、光泽感、kawaii。
场景目的：温暖欢迎孩子，营造安全、好玩的学习氛围。`,
    ocean: `使用 PixVerse V6 生成一段 6 秒、16:9 的儿童教育视频镜头——海洋主题。
主体与动作：一只微笑的小海龟滑过色彩缤纷的珊瑚礁，旁边有友好的小丑鱼与开心的海豚一起玩耍，细小气泡缓缓上升。
镜头：平滑的水下跟随推进，跟着海龟滑行。
光照：明亮阳光穿透清澈蓝色海水，闪烁的水波光斑（caustics）。
视觉风格：柔软 3D 皮克斯风、圆润造型、鲜明的海蓝与珊瑚色调、光泽感、kawaii。
场景目的：介绍海洋动物，激发孩子对大海的喜爱。`,
    animals: `使用 PixVerse V6 生成一段 6 秒、16:9 的儿童教育视频镜头——动物主题。
主体与动作：一只爱玩的小狮子、温柔扇耳朵的大象、蹦蹦跳跳的小兔子在阳光草地上依次向观众打招呼，远处是起伏的小山丘。
镜头：轻快、带弹性的横向摇摄，依次扫过三只动物。
光照：金色的午后阳光，温暖柔和。
视觉风格：柔软 3D 皮克斯风、圆润造型、明亮粉彩、光泽感、kawaii。
场景目的：教孩子常见动物名称与它们的叫声。`,
    numbers: `使用 PixVerse V6 生成一段 6 秒、16:9 的儿童教育视频镜头——数数主题。
主体与动作：友好的 3D 大数字 1、2、3 依次弹跳出现，每个数字后面对应物体出现——1 个红苹果、2 个黄气球、3 颗橙色星星。
镜头：每个数字出现时轻快弹跳，并稍微推进缩放。
光照：明亮均匀的棚拍光，欢乐。
视觉风格：柔软 3D 皮克斯风、圆润造型、明亮粉彩、光泽感、kawaii。
场景目的：用清晰的对应关系教孩子从 1 数到 3。`,
    colors: `使用 PixVerse V6 生成一段 6 秒、16:9 的儿童教育视频镜头——颜色主题。
主体与动作：一支开心的画笔角色在屏幕上依次泼洒彩虹颜色——红色，然后黄色、蓝色、绿色；每次泼洒都会绽放成同色气球。
镜头：在每次泼洒之间快速、俏皮切换，然后稳定下来。
光照：明亮、鲜艳、饱和。
视觉风格：柔软 3D 皮克斯风、圆润造型、明亮粉彩、光泽感、kawaii。
场景目的：用快乐的颜色揭示教孩子基础颜色名称。`,
    alphabet: `使用 PixVerse V6 生成一段 6 秒、16:9 的儿童教育视频镜头——字母主题。
主体与动作：光泽感 3D 大字母 A、B、C 依次弹出，每个字母配一个友好物体——A 配闪亮苹果，B 配弹跳球，C 配微笑小猫。
镜头：每个字母出现时轻柔 pop-and-zoom。
光照：明亮欢乐，柔和阴影。
视觉风格：柔软 3D 皮克斯风、圆润造型、明亮粉彩、光泽感、kawaii。
场景目的：介绍 A–C 与简单自然拼读启蒙。`
  },
  ar: {
    general: `استخدم PixVerse V6 لإنشاء لقطة بنسبة 16:9 ومدتها 6 ثوانٍ لفيديو تعليمي للأطفال — مقدمة لطيفة وودودة.
الموضوع والحركة: تميمة بومة كروية لطيفة بعيون كبيرة لامعة تلوّح مرحبًا وتقفز بسعادة على
جزيرة كتاب قصص عائمة محاطة بسحب عابرة ونجوم متلألئة.
الكاميرا: اقتراب بطيء وناعم مع ارتداد خفيف.
الإضاءة: ضوء صباح دافئ، ناعم ومتوهج.
الأسلوب البصري: ثلاثي الأبعاد ناعم بأسلوب بيكسار، أشكال مستديرة، ألوان باستيل زاهية، لامع، كاوايي.
هدف المشهد: ترحيب دافئ بالأطفال ووضع مزاج آمن وممتع للتعلم.`,
    ocean: `استخدم PixVerse V6 لإنشاء لقطة بنسبة 16:9 ومدتها 6 ثوانٍ لفيديو تعليمي للأطفال عن المحيط.
الموضوع والحركة: سلحفاة بحرية صغيرة مبتسمة تنساب بجانب شعاب مرجانية ملونة، بينما يسبح بالقرب منها
سمك مهرّج ودود ودلفين مرح، مع فقاعات لطيفة تتصاعد.
الكاميرا: حركة انسيابية تحت الماء تتبع السلحفاة.
الإضاءة: أشعة شمس ساطعة تخترق ماءً أزرق صافياً مع تموجات ضوئية متلألئة.
الأسلوب البصري: ثلاثي الأبعاد ناعم بأسلوب بيكسار، أشكال مستديرة، لوحة ألوان زاهية بين الأزرق والمرجاني، لامع، كاوايي.
هدف المشهد: تقديم حيوانات المحيط وإشعال حب البحر.`,
    animals: `استخدم PixVerse V6 لإنشاء لقطة بنسبة 16:9 ومدتها 6 ثوانٍ لفيديو تعليمي للأطفال عن الحيوانات.
الموضوع والحركة: شبل أسد مرح، وفيل لطيف يرفرف بأذنيه، وأرنب يقفز لتحية المشاهد واحدًا تلو الآخر
في مرج أخضر مشمس مع تلال متموجة.
الكاميرا: حركة بان خفيفة ومرِحة عبر الحيوانات الثلاثة.
الإضاءة: شمس عصر ذهبية، دافئة وناعمة.
الأسلوب البصري: ثلاثي الأبعاد ناعم بأسلوب بيكسار، أشكال مستديرة، ألوان باستيل زاهية، لامع، كاوايي.
هدف المشهد: تعليم أسماء الحيوانات الشائعة وأصواتها.`,
    numbers: `استخدم PixVerse V6 لإنشاء لقطة بنسبة 16:9 ومدتها 6 ثوانٍ لفيديو تعليمي للأطفال عن العد.
الموضوع والحركة: أرقام ثلاثية الأبعاد كبيرة وودودة 1 و2 و3 تقفز واحدًا تلو الآخر، ويتبع كل رقم أشياء مطابقة تظهر —
تفاحة حمراء واحدة، بالونان أصفران، ثلاث نجوم برتقالية.
الكاميرا: ارتداد مرح مع تقريب بسيط عند كل رقم.
الإضاءة: إضاءة استوديو ساطعة ومتوازنة، مبهجة.
الأسلوب البصري: ثلاثي الأبعاد ناعم بأسلوب بيكسار، أشكال مستديرة، ألوان باستيل زاهية، لامع، كاوايي.
هدف المشهد: تعليم العد من 1 إلى 3 مع مطابقة بصرية واضحة.`,
    colors: `استخدم PixVerse V6 لإنشاء لقطة بنسبة 16:9 ومدتها 6 ثوانٍ لفيديو تعليمي للأطفال عن الألوان.
الموضوع والحركة: شخصية فرشاة طلاء مرِحة ترش ألوان قوس قزح — الأحمر ثم الأصفر والأزرق والأخضر —
عبر الشاشة، وتتحول كل رشّة إلى بالون بنفس اللون.
الكاميرا: انتقالات سريعة ومرِحة بين الرشّات ثم تثبت.
الإضاءة: ساطعة، نابضة، مشبعة.
الأسلوب البصري: ثلاثي الأبعاد ناعم بأسلوب بيكسار، أشكال مستديرة، ألوان باستيل زاهية، لامع، كاوايي.
هدف المشهد: تعليم أسماء الألوان الأساسية عبر كشف ألوان ممتع.`,
    alphabet: `استخدم PixVerse V6 لإنشاء لقطة بنسبة 16:9 ومدتها 6 ثوانٍ لفيديو تعليمي للأطفال عن الحروف الأبجدية.
الموضوع والحركة: حروف ثلاثية الأبعاد كبيرة ولامعة A وB وC تظهر واحدًا تلو الآخر، ومع كل حرف عنصر لطيف —
A مع تفاحة لامعة، B مع كرة ترتد، C مع قطة مبتسمة.
الكاميرا: ظهور لطيف مع تقريب بسيط لكل حرف.
الإضاءة: ساطعة ومبهجة مع ظلال ناعمة.
الأسلوب البصري: ثلاثي الأبعاد ناعم بأسلوب بيكسار، أشكال مستديرة، ألوان باستيل زاهية، لامع، كاوايي.
هدف المشهد: تقديم الحروف A–C وبدايات الفونكس.`
  }
};

export function buildPrompt(category: PromptCategory, durationSeconds: number, lang: Lang) {
  const pack = RAW_TEMPLATES[lang] ?? RAW_TEMPLATES.en;
  const base = pack[category] ?? pack.general;
  void durationSeconds;
  return base;
}

export const CATEGORY_LABELS: Array<{ key: PromptCategory; label: string }> = [
  { key: 'general', label: 'General' },
  { key: 'ocean', label: 'Ocean' },
  { key: 'animals', label: 'Animals' },
  { key: 'numbers', label: 'Numbers' },
  { key: 'colors', label: 'Colors' },
  { key: 'alphabet', label: 'Alphabet' }
];
