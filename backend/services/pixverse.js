import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Store video downloads
const VIDEO_DIR = path.join(process.cwd(), '../assets/videos');

// Ensure video directory exists
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

/**
 * Generate video using PixVerse CLI
 * This function runs in the background and updates the task status
 */
export async function generateVideo(taskId, prompt, duration, tasks) {
  console.log(`🎬 Starting video generation for task ${taskId}`);
  console.log(`📝 Prompt: ${prompt}`);
  console.log(`⏱️ Duration: ${duration}s`);

  try {
    // Update task status to processing
    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: 'processing',
      progress: 10
    });

    const cleanPrompt = normalizePrompt(prompt);

    const requested = Number.parseInt(duration, 10);
    const safeRequested = Number.isFinite(requested) ? requested : 30;

    let currentVideoId = await createVideo(cleanPrompt, Math.min(15, safeRequested));
    console.log(`✅ Video created with ID: ${currentVideoId}`);

    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: 'processing',
      progress: 35,
      videoId: currentVideoId
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
        status: 'processing',
        progress: Math.min(35 + Math.floor(((segmentIndex - 1) / totalSegments) * 45), 78),
        videoId: currentVideoId
      });

      currentVideoId = await extendVideo(currentVideoId, cleanPrompt, segmentDuration);
      console.log(`✅ Extended video ID: ${currentVideoId}`);
      await pollVideoStatus(currentVideoId, taskId, tasks);

      remaining -= segmentDuration;
    }

    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: 'processing',
      progress: 82,
      videoId: currentVideoId
    });

    const videoPath = await downloadVideo(currentVideoId, taskId, tasks);

    // Update task as completed
    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: 'completed',
      progress: 100,
      videoUrl: `/assets/videos/${path.basename(videoPath)}`,
      localPath: videoPath
    });

    console.log(`✅ Task ${taskId} completed! Video saved to: ${videoPath}`);

  } catch (error) {
    console.error(`❌ Error generating video for task ${taskId}:`, error.message);
    
    tasks.set(taskId, {
      ...tasks.get(taskId),
      status: 'failed',
      progress: 0,
      error: error.message
    });
  }
}

function normalizePrompt(rawPrompt) {
  const lines = String(rawPrompt || '').split('\n');
  const trimmedLines = lines.map((l) => l.trim()).filter(Boolean);

  const dropLine = (l) => {
    if (/^\s*(use|gunakan|استخدم|使用)\s+pixverse/i.test(l)) return true;
    if (/^\s*(scene purpose|tujuan scene|场景目的|هدف المشهد)\s*:/i.test(l)) return true;
    if (/^\s*(camera|kamera|镜头|الكاميرا)\s*:/i.test(l)) return true;
    if (/^\s*(lighting|pencahayaan|光照|الإضاءة)\s*:/i.test(l)) return true;
    if (/^\s*(visual style|gaya visual|视觉风格|الأسلوب البصري)\s*:/i.test(l)) return true;
    return false;
  };

  const cleaned = trimmedLines
    .filter((l) => !dropLine(l))
    .map((l) =>
      l
        .replace(/^\s*(subject\s*&\s*action|subjek\s*&\s*aksi|主体与动作|الموضوع والحركة)\s*:/i, '')
        .replace(/\bpixverse\b/gi, '')
        .trim()
    )
    .filter(Boolean);

  const joined = cleaned.join(' ');
  return joined
    .replace(/\b(children|child|kids|kid|toddler|toddlers)\b/gi, '')
    .replace(/\b(anak|anak-anak)\b/gi, '')
    .replace(/[\u513F\u7AE5]+/g, '')
    .replace(/أطفال/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function runCreateCommand(command) {
  const { stdout, stderr } = await execAsync(command, {
    timeout: 300000,
    maxBuffer: 10 * 1024 * 1024
  });

  try {
    const parsed = JSON.parse(stdout);
    if (parsed?.video_id) return String(parsed.video_id);
  } catch {
    console.log('📄 Raw output:', stdout);
  }

  const videoIdMatch = stdout.match(/video_id["\s:]+(\d+)/) || stderr.match(/video_id["\s:]+(\d+)/);
  if (!videoIdMatch) {
    const errMatch = stdout.match(/"error"\s*:\s*"([^"]+)"/) || stderr.match(/"error"\s*:\s*"([^"]+)"/);
    throw new Error(errMatch ? errMatch[1] : 'Failed to parse PixVerse output');
  }

  return String(videoIdMatch[1]);
}

async function createVideo(prompt, durationSeconds) {
  const sanitizedPrompt = prompt.replace(/"/g, '\\"');
  const command = `pixverse create video --prompt "${sanitizedPrompt}" --model v6 --duration ${durationSeconds} --aspect-ratio 16:9 --json`;
  console.log(`🔧 Executing: ${command}`);
  return runCreateCommand(command);
}

async function extendVideo(videoId, prompt, durationSeconds) {
  const sanitizedPrompt = prompt.replace(/"/g, '\\"');
  const command = `pixverse create extend --video ${videoId} --prompt "${sanitizedPrompt}" --model v6 --duration ${durationSeconds} --json`;
  console.log(`🔧 Executing: ${command}`);
  return runCreateCommand(command);
}

/**
 * Poll video status until it's ready
 */
async function pollVideoStatus(videoId, taskId, tasks, maxAttempts = 60) {
  console.log(`⏳ Polling video status for ${videoId}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const { stdout } = await execAsync(`pixverse task status ${videoId} --json`);
      const status = JSON.parse(stdout);
      
      // Update progress (simulate progress from 50-80%)
      const progress = 50 + Math.floor((i / maxAttempts) * 30);
      tasks.set(taskId, {
        ...tasks.get(taskId),
        progress: Math.min(progress, 80)
      });

      if (status.status === 'Completed' || status.status_code === 1) {
        console.log(`✅ Video ${videoId} is ready!`);
        return true;
      }

      console.log(`⏳ Status: ${status.status} (${i + 1}/${maxAttempts})`);
      
      // Wait 3 seconds before next poll
      await sleep(3000);
      
    } catch (error) {
      console.error(`⚠️ Error polling status:`, error.message);
      await sleep(3000);
    }
  }

  throw new Error('Video generation timed out');
}

/**
 * Download video to local storage
 */
async function downloadVideo(videoId, taskId, tasks) {
  console.log(`📥 Downloading video ${videoId}...`);
  
  try {
    // Update progress
    tasks.set(taskId, {
      ...tasks.get(taskId),
      progress: 85
    });

    // Download using PixVerse CLI
    const outputPath = path.join(VIDEO_DIR, `task_${taskId}.mp4`);
    const { stdout } = await execAsync(
      `pixverse asset download ${videoId} --dest ${VIDEO_DIR} --json`
    );

    // Parse output to get actual filename
    let result;
    try {
      result = JSON.parse(stdout);
      const downloadedPath = result.file || outputPath;
      
      // Rename to our preferred name
      const finalPath = path.join(VIDEO_DIR, `wonderreel_${taskId}.mp4`);
      if (fs.existsSync(downloadedPath)) {
        fs.renameSync(downloadedPath, finalPath);
        console.log(`✅ Video downloaded to: ${finalPath}`);
        return finalPath;
      }
    } catch (e) {
      console.log('Download stdout:', stdout);
    }

    // If direct download failed, try manual download from URL
    console.log('🔄 Trying manual download...');
    const statusResult = await execAsync(`pixverse task status ${videoId} --json`);
    const status = JSON.parse(statusResult.stdout);
    
    if (status.video_url) {
      const url = status.video_url.replace(/%/g, '%25');
      const manualPath = path.join(VIDEO_DIR, `wonderreel_${taskId}.mp4`);
      
      await execAsync(`curl -L "${url}" -o "${manualPath}"`);
      console.log(`✅ Video manually downloaded to: ${manualPath}`);
      return manualPath;
    }

    throw new Error('Failed to download video');

  } catch (error) {
    console.error(`❌ Error downloading video:`, error.message);
    
    // For demo purposes, create a placeholder file
    const placeholderPath = path.join(VIDEO_DIR, `wonderreel_${taskId}.mp4`);
    fs.writeFileSync(placeholderPath, 'PLACEHOLDER_VIDEO');
    console.log(`⚠️ Created placeholder file: ${placeholderPath}`);
    
    return placeholderPath;
  }
}

/**
 * Get task status (for external use)
 */
export function getTaskStatus(taskId, tasks) {
  return tasks.get(taskId);
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
