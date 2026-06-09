export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { scheduleJobs } = await import('./lib/jobs/scheduler')
      await scheduleJobs()
      console.log('[Instrumentation] BullMQ jobs scheduled on server start')
    } catch (err) {
      console.warn('[Instrumentation] Could not schedule BullMQ jobs:', (err as Error).message)
    }
  }
}
