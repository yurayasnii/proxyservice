/**
 * Internal route called once on server start to schedule BullMQ jobs.
 * Next.js calls this automatically via instrumentation.ts.
 */
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true })
}
