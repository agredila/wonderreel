import crypto from "crypto";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { LOCKED_VISUAL_STYLE } from "../config/constants.js";
import { generateCaptions } from "./tts.js";

const VIDEO_DIR = path.join(process.cwd(), "../assets/videos");
const API_BASE = (
  process.env.PIXVERSE_API_BASE || "https://app-api.pixverse.ai/openapi/v2"
).replace(/\/$/, "");
const API_KEY = process.env.PIXVERSE_API_KEY;
const MODEL = process.env.PIXVERSE_MODEL || "v6";
const QUALITY = process.env.PIXVERSE_QUALITY || "540p";
const ASPECT_RATIO = process.env.PIXVERSE_ASPECT_RATIO || "16:9";

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

/**
 * Generate video using the PixVerse REST API.
 * Runs in the background and updates the task status map.
 */
export async function generateVideo(
  taskId,
  prompt,
  duration,
  tasks,
  onComplete,
) {
  console.log(`🎬 Starting video generation for task ${taskId}`);
  console.log(`📝 Prompt: ${prompt}`);
  console.log(`⏱️ Duration: ${duration}s`);

  try {
    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: "processing",
      progress: 10,
    });

    const cleanPrompt = ensurePrompt(prompt, prompt);
    if (!cleanPrompt) {
      throw new Error("Video prompt is empty after processing");
    }
    console.log(
      `📝 Clean prompt (${cleanPrompt.length} chars): ${cleanPrompt.slice(0, 120)}...`,
    );

    const requested = Number.parseInt(duration, 10);
    const safeRequested = Number.isFinite(requested) ? requested : 30;

    let currentVideoId = await createVideo(
      cleanPrompt,
      Math.min(15, safeRequested),
    );
    console.log(`✅ Video created with ID: ${currentVideoId}`);

    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: "processing",
      progress: 35,
      videoId: currentVideoId,
    });

    await pollVideoStatus(currentVideoId, taskId, tasks);

    let remaining = safeRequested - Math.min(15, safeRequested);
    const totalSegments = Math.ceil(safeRequested / 15);
    let segmentIndex = 1;

    while (remaining > 0) {
      segmentIndex += 1;
      const segmentDuration = Math.min(15, remaining);

      tasks.set(taskId, {
        ...tasks.get(taskId),
        status: "processing",
        progress: Math.min(
          35 + Math.floor(((segmentIndex - 1) / totalSegments) * 45),
          78,
        ),
        videoId: currentVideoId,
      });

      currentVideoId = await extendVideo(
        currentVideoId,
        cleanPrompt,
        segmentDuration,
      );
      console.log(`✅ Extended video ID: ${currentVideoId}`);
      await pollVideoStatus(currentVideoId, taskId, tasks);

      remaining -= segmentDuration;
    }

    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: "processing",
      progress: 82,
      videoId: currentVideoId,
    });

    const videoPath = await downloadVideo(currentVideoId, taskId, tasks);

    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: "completed",
      progress: 100,
      videoUrl: `/assets/videos/${path.basename(videoPath)}`,
      localPath: videoPath,
    });

    console.log(`✅ Task ${taskId} completed! Video saved to: ${videoPath}`);
    if (onComplete) await onComplete(tasks.get(taskId));
  } catch (error) {
    console.error(
      `❌ Error generating video for task ${taskId}:`,
      error.message,
    );

    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: "failed",
      progress: 0,
      error: error.message,
    });
    if (onComplete) await onComplete(tasks.get(taskId));
  }
}

function normalizePrompt(rawPrompt) {
  const raw = String(rawPrompt || "").trim();
  if (!raw) return "";

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const cleaned = lines
    .map((line) =>
      line
        .replace(/^\s*(use|gunakan|استخدم|使用)\s+pixverse[^.]*\.?\s*/i, "")
        .replace(
          /^\s*(subject\s*&\s*action|subjek\s*&\s*aksi|主体与动作|الموضوع والحركة)\s*:\s*/i,
          "",
        )
        .replace(/\bpixverse\b/gi, "")
        .trim(),
    )
    .filter(Boolean);

  let joined = cleaned.join(". ").replace(/\s+/g, " ").trim();

  // PixVerse safety: avoid literal "child/kids" wording; keep scene content intact
  joined = joined
    .replace(
      /\b(children's|children|child's|child|kids|kid|toddlers|toddler)\b/gi,
      "young learners",
    )
    .replace(/\b(anak|anak-anak)\b/gi, "young learners")
    .replace(/[\u513F\u7AE5]+/g, "young learners")
    .replace(/أطفال/gi, "young learners")
    .replace(/\s+/g, " ")
    .trim();

  return joined || raw;
}

function ensurePrompt(prompt, rawFallback) {
  const normalized = normalizePrompt(prompt);
  if (normalized.length >= 8) return normalized.slice(0, 5000);

  const fallback =
    normalizePrompt(rawFallback) || String(rawFallback || "").trim();
  if (fallback.length >= 8) return fallback.slice(0, 5000);

  return (
    `A gentle educational scene for young learners. ${LOCKED_VISUAL_STYLE}. ` +
    "Bright, safe, cheerful animation with friendly characters."
  ).slice(0, 5000);
}

function newTraceId() {
  return crypto.randomUUID();
}

async function pixverseRequest(method, endpoint, body) {
  if (!API_KEY) {
    throw new Error("PIXVERSE_API_KEY is not configured");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "API-KEY": API_KEY,
      "Ai-trace-id": newTraceId(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.ErrMsg || `PixVerse HTTP ${response.status}`);
  }
  if (payload.ErrCode !== 0) {
    throw new Error(
      payload.ErrMsg || `PixVerse API error (${payload.ErrCode})`,
    );
  }

  return payload.Resp;
}

async function createVideo(prompt, durationSeconds) {
  const resp = await pixverseRequest("POST", "/video/text/generate", {
    prompt: prompt.slice(0, 5000),
    model: MODEL,
    duration: durationSeconds,
    quality: QUALITY,
    aspect_ratio: ASPECT_RATIO,
  });

  if (!resp?.video_id) {
    throw new Error("PixVerse did not return a video_id");
  }

  return String(resp.video_id);
}

async function extendVideo(videoId, prompt, durationSeconds) {
  const resp = await pixverseRequest("POST", "/video/extend/generate", {
    video_id: Number(videoId),
    prompt: prompt.slice(0, 5000),
    model: MODEL,
    duration: durationSeconds,
    quality: QUALITY,
  });

  if (!resp?.video_id) {
    throw new Error("PixVerse extend did not return a video_id");
  }

  return String(resp.video_id);
}

function describeVideoStatus(status) {
  switch (status) {
    case 1:
      return "completed";
    case 5:
      return "generating";
    case 6:
      return "deleted";
    case 7:
      return "moderation failed";
    case 8:
      return "generation failed";
    default:
      return `status ${status}`;
  }
}

async function pollVideoStatus(videoId, taskId, tasks, maxAttempts = 120) {
  console.log(`⏳ Polling video status for ${videoId}...`);

  for (let i = 0; i < maxAttempts; i++) {
    const resp = await pixverseRequest("GET", `/video/result/${videoId}`);

    const progress = 50 + Math.floor((i / maxAttempts) * 30);
    tasks.set(taskId, {
      ...tasks.get(taskId),
      progress: Math.min(progress, 80),
    });

    if (resp.status === 1) {
      console.log(`✅ Video ${videoId} is ready!`);
      return resp;
    }

    if (resp.status === 7 || resp.status === 8 || resp.status === 6) {
      throw new Error(`Video generation ${describeVideoStatus(resp.status)}`);
    }

    console.log(
      `⏳ Status: ${describeVideoStatus(resp.status)} (${i + 1}/${maxAttempts})`,
    );
    await sleep(4000);
  }

  throw new Error("Video generation timed out");
}

const execPromise = promisify(exec);

function formatSrtTime(seconds) {
  const date = new Date(seconds * 1000);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  const ms = String(date.getUTCMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss},${ms}`;
}

function generateSrtContent(captions) {
  return captions
    .map((cap, i) => {
      const startStr = formatSrtTime(cap.start);
      const endStr = formatSrtTime(cap.end);
      return `${i + 1}\n${startStr} --> ${endStr}\n${cap.text}\n`;
    })
    .join("\n");
}

async function postProcessVideo(rawPath, finalPath, srtPath, taskId) {
  try {
    // 1. Check if FFmpeg is available on the system
    try {
      await execPromise("ffmpeg -version");
    } catch {
      console.log(
        "⚠️ FFmpeg is not installed on this system. Skipping video post-processing.",
      );
      fs.copyFileSync(rawPath, finalPath);
      return;
    }

    const outroPath = path.join(process.cwd(), "../assets/outro.mp4");
    const hasOutro = fs.existsSync(outroPath);
    const hasSrt = fs.existsSync(srtPath);

    console.log(
      `🎬 [FFmpeg] Processing task ${taskId}. srt=${hasSrt}, outro=${hasOutro}`,
    );

    let filterComplex = "";
    let inputs = [`-i "${rawPath}"`];

    // Drawtext for watermark WonderReel in the bottom-right corner with 40% opacity (white@0.4)
    // Box=1 bakes a dark semi-transparent box behind text to ensure legibility on light frames
    let videoFilters =
      "drawtext=text='WonderReel':x=w-tw-15:y=h-th-15:fontsize=20:fontcolor=white@0.4:box=1:boxcolor=black@0.15:boxborderw=4";

    if (hasSrt) {
      // Burn subtitles using subtitles filter
      videoFilters = `subtitles='${srtPath}':force_style='FontSize=16,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=1,Shadow=1,MarginV=10',${videoFilters}`;
    }

    let cmd = "";
    if (hasOutro) {
      inputs.push(`-i "${outroPath}"`);
      // We apply video filters on the first input [0:v], then concatenate with the second input [1:v]
      filterComplex = `-filter_complex "[0:v]${videoFilters}[v0_filtered];[v0_filtered][1:v]concat=n=2:v=1:a=0[outv]" -map "[outv]"`;
      cmd = `ffmpeg -y ${inputs.join(" ")} ${filterComplex} -c:v libx264 -pix_fmt yuv420p "${finalPath}"`;
    } else {
      filterComplex = `-vf "${videoFilters}"`;
      cmd = `ffmpeg -y ${inputs.join(" ")} ${filterComplex} -c:v libx264 -pix_fmt yuv420p "${finalPath}"`;
    }

    console.log(`🏃‍♂️ [FFmpeg] Executing command for task ${taskId}: ${cmd}`);
    await execPromise(cmd);
    console.log(`✅ [FFmpeg] Successfully processed video for task ${taskId}`);
  } catch (error) {
    console.error(
      `❌ [FFmpeg] Processing error for task ${taskId}:`,
      error.message,
    );
    console.log("🔄 Falling back to copying raw PixVerse video.");
    try {
      fs.copyFileSync(rawPath, finalPath);
    } catch (fallbackError) {
      console.error("❌ Fallback copy failed:", fallbackError.message);
    }
  }
}

async function downloadVideo(videoId, taskId, tasks) {
  console.log(`📥 Downloading video ${videoId}...`);

  tasks.set(taskId, {
    ...tasks.get(taskId),
    progress: 85,
  });

  const status = await pixverseRequest("GET", `/video/result/${videoId}`);
  if (status.status !== 1 || !status.url) {
    throw new Error("Video URL not available after generation");
  }

  const videoResponse = await fetch(status.url);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video (${videoResponse.status})`);
  }

  // 1. Save raw video to temporary path first
  const rawPath = path.join(VIDEO_DIR, `wonderreel_${taskId}_raw.mp4`);
  const finalPath = path.join(VIDEO_DIR, `wonderreel_${taskId}.mp4`);

  const buffer = Buffer.from(await videoResponse.arrayBuffer());
  fs.writeFileSync(rawPath, buffer);
  console.log(`✅ Raw video downloaded to: ${rawPath}`);

  // 2. Build and write SRT file if prompt and language are available
  const task = tasks.get(taskId);
  let srtPath = "";
  if (task && task.rawText && task.language) {
    try {
      console.log(
        `📝 Building Bahasa Indonesia subtitles for task ${taskId}...`,
      );
      const captions = await generateCaptions(
        task.rawText,
        task.language,
        task.duration || 30,
      );
      const srtContent = generateSrtContent(captions);
      srtPath = path.join(VIDEO_DIR, `wonderreel_${taskId}.srt`);
      fs.writeFileSync(srtPath, srtContent);
      console.log(`✅ Subtitles file written: ${srtPath}`);
    } catch (err) {
      console.error(
        `❌ Error building subtitles for task ${taskId}:`,
        err.message,
      );
    }
  }

  // 3. Post-process the video (burn watermark, burn subtitles, stitch outro)
  await postProcessVideo(rawPath, finalPath, srtPath, taskId);

  // 4. Cleanup temporary files safely
  try {
    if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
    if (srtPath && fs.existsSync(srtPath)) fs.unlinkSync(srtPath);
  } catch (cleanupErr) {
    console.error(`⚠️ Cleanup warning for task ${taskId}:`, cleanupErr.message);
  }

  return finalPath;
}

export function getTaskStatus(taskId, tasks) {
  return tasks.get(taskId);
}

export function isPixverseConfigured() {
  return Boolean(API_KEY);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
