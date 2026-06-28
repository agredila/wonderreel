import { geminiOutputModeration, screenAndEnhanceStory } from "./gemini.js";
import { generateVideo } from "./pixverse.js";
import { isSupabaseConfigured, supabaseAdmin } from "./supabase.js";
import { devStore } from "./devStore.js";
import { generateCaptions } from "./tts.js";

const memoryTasks = new Map();

export function getMemoryTasks() {
  return memoryTasks;
}

function devFilmRecord(accountId, childId, rawText, duration, filmId) {
  return {
    id: filmId,
    account_id: accountId,
    child_id: childId,
    title: { en: rawText.slice(0, 60), id: "", zh: "", ar: "" },
    duration_sec: duration,
    video_url: null,
    status: "generating",
    is_starter: false,
    created_at: new Date().toISOString(),
  };
}

export async function runCreationPipeline({
  accountId,
  childId,
  rawText,
  language,
  structure,
  storyId: existingStoryId,
}) {
  const screened = await screenAndEnhanceStory(rawText, structure);
  if (screened.status === "REJECTED") {
    return {
      success: false,
      error: {
        code: "MODERATION_BLOCKED",
        message: screened.reason_if_rejected || "Story blocked by moderation",
      },
    };
  }

  let storyId = existingStoryId;
  if (isSupabaseConfigured() && !storyId) {
    const { data: story, error } = await supabaseAdmin
      .from("stories")
      .insert({
        account_id: accountId,
        child_id: childId,
        raw_text: rawText,
        language,
        structure,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    storyId = story.id;

    await supabaseAdmin.from("moderation_results").insert({
      account_id: accountId,
      target_type: "input",
      target_id: storyId,
      decision: "pass",
      reasons: screened.stripped?.length
        ? ["Brand names were adapted to original characters"]
        : [`Approved — theme: ${screened.theme_category || "Custom"}`],
    });
  }

  const promptBuild = screened;
  let promptBuildId = null;
  if (isSupabaseConfigured() && storyId) {
    const { data: pb } = await supabaseAdmin
      .from("prompt_builds")
      .insert({
        story_id: storyId,
        account_id: accountId,
        english_prompts: promptBuild.prompts,
        style_string: promptBuild.styleString,
        parts: promptBuild.parts,
        banned_terms_stripped: promptBuild.stripped || [],
      })
      .select()
      .single();
    promptBuildId = pb?.id;
  }

  const combinedPrompt = promptBuild.prompts.filter(Boolean).join("\n\n");
  const duration = structure === "three_part" ? 45 : 30;

  let filmId = `film_${Date.now()}`;
  let jobId = null;

  if (isSupabaseConfigured()) {
    const { data: job } = await supabaseAdmin
      .from("generation_jobs")
      .insert({
        account_id: accountId,
        prompt_build_id: promptBuildId,
        story_id: storyId,
        status: "pending",
        progress: 0,
      })
      .select()
      .single();
    jobId = job?.id;

    const { data: film } = await supabaseAdmin
      .from("films")
      .insert({
        account_id: accountId,
        child_id: childId,
        story_id: storyId,
        generation_job_id: jobId,
        title: { en: rawText.slice(0, 60), id: "", zh: "", ar: "" },
        duration_sec: duration,
        status: "generating",
      })
      .select()
      .single();
    filmId = film?.id;
  } else {
    devStore.films.set(
      filmId,
      devFilmRecord(accountId, childId, rawText, duration, filmId),
    );
  }

  const taskId =
    jobId || `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  memoryTasks.set(taskId, {
    id: taskId,
    accountId,
    childId,
    filmId,
    storyId,
    prompt: combinedPrompt,
    themeCategory: screened.theme_category,
    suggestedBgColor: screened.suggested_bg_color,
    duration,
    status: "processing",
    progress: 0,
    createdAt: new Date().toISOString(),
    videoUrl: null,
    error: null,
    rawText,
    language,
  });

  generateVideo(
    taskId,
    combinedPrompt,
    duration,
    memoryTasks,
    async (result) => {
      const outputMod = await geminiOutputModeration(null);
      const status = "needs_review";
      await generateCaptions(rawText, language, duration);

      if (isSupabaseConfigured()) {
        await supabaseAdmin
          .from("generation_jobs")
          .update({
            status: result.status === "completed" ? "completed" : "failed",
            progress: result.progress,
            error: result.error,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        if (result.status === "completed" && filmId) {
          await supabaseAdmin
            .from("films")
            .update({
              video_url: result.videoUrl,
              status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", filmId);

          await supabaseAdmin.from("moderation_results").insert({
            account_id: accountId,
            target_type: "output",
            target_id: filmId,
            decision: outputMod.decision,
            reasons: outputMod.reasons,
          });
        } else if (filmId) {
          await supabaseAdmin
            .from("films")
            .update({
              status: "discarded",
              updated_at: new Date().toISOString(),
            })
            .eq("id", filmId);
        }

        await supabaseAdmin.from("audit_logs").insert({
          account_id: accountId,
          actor: "system",
          action: "generate_complete",
          entity_type: "film",
          entity_id: filmId,
          metadata: { taskId, status: result.status },
        });
      } else {
        const film = devStore.films.get(filmId);
        if (film && result.status === "completed") {
          film.video_url = result.videoUrl;
          film.status = status;
          devStore.films.set(filmId, film);
        }
      }
    },
  );

  return {
    success: true,
    data: {
      taskId,
      filmId,
      storyId,
      status: "processing",
      progress: 0,
      themeCategory: screened.theme_category,
      suggestedBgColor: screened.suggested_bg_color,
      warnings: screened.stripped?.length
        ? ["Brand names were adapted to original characters"]
        : [],
    },
  };
}

export async function approveFilm(accountId, filmId) {
  if (!isSupabaseConfigured()) {
    const film = devStore.films.get(filmId);
    if (!film || film.account_id !== accountId)
      return { success: false, error: "Film not found" };
    film.status = "approved";
    film.approved_by_parent_at = new Date().toISOString();
    devStore.films.set(filmId, film);
    return { success: true, data: film };
  }
  const { data, error } = await supabaseAdmin
    .from("films")
    .update({
      status: "approved",
      approved_by_parent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", filmId)
    .eq("account_id", accountId)
    .eq("status", "needs_review")
    .select()
    .single();

  if (error || !data)
    return {
      success: false,
      error: "Film not found or not ready for approval",
    };

  await supabaseAdmin.from("audit_logs").insert({
    account_id: accountId,
    actor: "parent",
    action: "approve",
    entity_type: "film",
    entity_id: filmId,
  });
  return { success: true, data };
}

export async function discardFilm(accountId, filmId) {
  if (!isSupabaseConfigured()) {
    const film = devStore.films.get(filmId);
    if (film) {
      film.status = "discarded";
      devStore.films.set(filmId, film);
    }
    return { success: true };
  }
  await supabaseAdmin
    .from("films")
    .update({
      status: "discarded",
      updated_at: new Date().toISOString(),
    })
    .eq("id", filmId)
    .eq("account_id", accountId);

  await supabaseAdmin.from("audit_logs").insert({
    account_id: accountId,
    actor: "parent",
    action: "discard",
    entity_type: "film",
    entity_id: filmId,
  });
  return { success: true };
}

export async function seedStarterFilms(accountId, childId) {
  const starters = [
    {
      title: {
        en: "Hello, Friend!",
        id: "Halo, Teman!",
        zh: "你好，朋友！",
        ar: "مرحباً يا صديق!",
      },
    },
    {
      title: {
        en: "Ocean Adventure",
        id: "Petualangan Laut",
        zh: "海洋冒险",
        ar: "مغامرة المحيط",
      },
    },
    {
      title: {
        en: "Counting Fun",
        id: "Belajar Berhitung",
        zh: "数数乐趣",
        ar: "متعة العد",
      },
    },
    {
      title: {
        en: "Rainbow Colors",
        id: "Warna Pelangi",
        zh: "彩虹颜色",
        ar: "ألوان قوس قزح",
      },
    },
    {
      title: {
        en: "Animal Friends",
        id: "Teman Hewan",
        zh: "动物朋友",
        ar: "أصدقاء الحيوانات",
      },
    },
  ];

  if (!isSupabaseConfigured()) {
    for (const s of starters) {
      const id = `starter_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      devStore.films.set(id, {
        id,
        account_id: accountId,
        child_id: childId,
        title: s.title,
        duration_sec: 30,
        status: "approved",
        is_starter: true,
        approved_by_parent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }
    return;
  }

  for (const s of starters) {
    await supabaseAdmin.from("films").insert({
      account_id: accountId,
      child_id: childId,
      title: s.title,
      duration_sec: 30,
      status: "approved",
      is_starter: true,
      approved_by_parent_at: new Date().toISOString(),
    });
  }
}

export function listDevFilms(accountId, childId, status) {
  return Array.from(devStore.films.values()).filter((f) => {
    if (f.account_id !== accountId) return false;
    if (childId && f.child_id !== childId) return false;
    if (status && f.status !== status) return false;
    return true;
  });
}
