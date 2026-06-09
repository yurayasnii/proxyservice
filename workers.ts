/**
 * Background workers entry point.
 * Run with: npx tsx workers.ts
 * Or: pnpm workers
 */

import 'dotenv/config'
import { scheduleJobs } from './lib/jobs/scheduler'
import { startProxyHealthWorker } from './lib/jobs/proxyHealthCheck'
import { startExpiryNotifierWorker } from './lib/jobs/expiryNotifier'
import { startAutoRenewerWorker } from './lib/jobs/autoRenewer'
import { startOrderExpiryWorker } from './lib/jobs/orderExpiry'

async function main() {
  console.log('[Workers] Starting background workers...')

  // Start all workers
  const workers = [
    startProxyHealthWorker(),
    startExpiryNotifierWorker(),
    startAutoRenewerWorker(),
    startOrderExpiryWorker(),
  ]

  // Schedule recurring jobs
  await scheduleJobs()

  console.log('[Workers] All workers started ✓')
  console.log('[Workers] Press Ctrl+C to stop')

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n[Workers] Shutting down...')
    await Promise.all(workers.map(w => w.close()))
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch(err => {
  console.error('[Workers] Fatal error:', err)
  process.exit(1)
})
