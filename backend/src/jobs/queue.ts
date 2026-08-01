// BullMQ Queue — production calling queue
// Requires redis server (REDIS_URL env)
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const callQueue = new Queue('ai-calling-engine', { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100, removeOnFail: 50 } });

export async function enqueueCall(jobData: { callId: string; clientId: string; campaignId: string; agentId: string; leadId: string; phone: string; providerName: string; apiKey: string; baseUrl?: string }) {
  const job = await callQueue.add('process-call', jobData, { jobId: `call-${jobData.callId}` });
  return job.id;
}
