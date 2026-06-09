import { proxyHealthQueue, expiryNotifierQueue, autoRenewerQueue, orderExpiryQueue, statsQueue } from './queue'

export async function scheduleJobs() {
  // Clear existing repeatable jobs
  await Promise.all([
    proxyHealthQueue.obliterate({ force: true }).catch(() => {}),
    expiryNotifierQueue.obliterate({ force: true }).catch(() => {}),
    autoRenewerQueue.obliterate({ force: true }).catch(() => {}),
    orderExpiryQueue.obliterate({ force: true }).catch(() => {}),
    statsQueue.obliterate({ force: true }).catch(() => {}),
  ])

  // Proxy health check every 5 minutes
  await proxyHealthQueue.add('check', {}, {
    repeat: { every: 5 * 60 * 1000 },
    jobId: 'proxy-health-recurring',
  })

  // Expiry notifier every hour
  await expiryNotifierQueue.add('notify', {}, {
    repeat: { every: 60 * 60 * 1000 },
    jobId: 'expiry-notifier-recurring',
  })

  // Auto-renewer every 6 hours
  await autoRenewerQueue.add('renew', {}, {
    repeat: { every: 6 * 60 * 60 * 1000 },
    jobId: 'auto-renewer-recurring',
  })

  // Order expiry check every minute
  await orderExpiryQueue.add('expire', {}, {
    repeat: { every: 60 * 1000 },
    jobId: 'order-expiry-recurring',
  })

  // Stats aggregator daily at midnight
  await statsQueue.add('aggregate', {}, {
    repeat: { pattern: '0 0 * * *' },
    jobId: 'stats-daily',
  })

  console.log('[Scheduler] Jobs scheduled')
}
