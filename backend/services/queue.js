import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
let connection = null;

if (redisUrl) {
  connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
}

export const generationQueue = connection
  ? new Queue('wonderreel-generation', { connection })
  : null;

export function createGenerationWorker(processor) {
  if (!connection) return null;
  return new Worker('wonderreel-generation', processor, { connection });
}

export function isQueueConfigured() {
  return Boolean(generationQueue);
}
