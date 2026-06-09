import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/auth'

export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get('provider')
  if (provider !== 'google' && provider !== 'github') {
    return new Response('Invalid provider', { status: 400 })
  }

  const url = await signIn(provider, {
    redirect: false,
    redirectTo: '/api/v1/auth/oauth-bridge',
  })

  return NextResponse.redirect(url)
}
