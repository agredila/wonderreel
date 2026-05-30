import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateVideo, getTaskStatus } from './services/pixverse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(ASSETS_DIR));

// Store for video generation tasks (in-memory for MVP)
const tasks = new Map();

// ==================== VIDEO GENERATION ENDPOINTS ====================

/**
 * POST /api/generate
 * Generate a new video using PixVerse CLI
 * Body: { prompt: string, duration: number (30-60), category: string }
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, duration = 30, category = 'general' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt is required and must be a string'
        }
      });
    }

    const parsedDuration = Number.parseInt(duration, 10);
    const safeDuration = Number.isFinite(parsedDuration)
      ? Math.min(60, Math.max(30, parsedDuration))
      : 30;

    // Create task
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task = {
      id: taskId,
      prompt,
      duration: safeDuration,
      category,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString(),
      videoUrl: null,
      error: null
    };

    tasks.set(taskId, task);

    // Start video generation in background
    generateVideo(taskId, prompt, safeDuration, tasks);

    res.json({
      success: true,
      data: {
        taskId,
        status: 'processing',
        progress: 0
      },
      message: 'Video generation started'
    });

  } catch (error) {
    console.error('Error starting generation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: 'Failed to start video generation'
      }
    });
  }
});

/**
 * GET /api/generate/:taskId
 * Get status of a video generation task
 */
app.get('/api/generate/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = tasks.get(taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Task not found'
      }
    });
  }

  res.json({
    success: true,
    data: {
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      videoUrl: task.videoUrl,
      error: task.error,
      prompt: task.prompt,
      duration: task.duration,
      createdAt: task.createdAt
    }
  });
});

/**
 * GET /api/tasks
 * Get all tasks (for debugging)
 */
app.get('/api/tasks', (req, res) => {
  const allTasks = Array.from(tasks.values());
  res.json({
    success: true,
    data: allTasks
  });
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'Internal server error'
    }
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🎬 WonderReel Backend Started!                  ║
║                                                    ║
║   Server running on: http://localhost:${PORT}         ║
║                                                    ║
║   Endpoints:                                        ║
║   • POST /api/generate - Generate video           ║
║   • GET  /api/generate/:id - Check status         ║
║   • GET  /api/health - Health check              ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `);
});
