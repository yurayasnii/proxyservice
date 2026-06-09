import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db/connect'
import UserProxy from '@/lib/models/UserProxy'
import { requireRole } from '@/lib/utils/auth'
import { encrypt } from '@/lib/utils/crypto'
import { ok, error, notFound, forbidden, serverError } from '@/lib/utils/response'

const PROXY_HOSTS = [
  '185.220.101.45', '185.220.101.46', '195.154.122.10',
  '91.108.4.10', '104.21.44.10', '172.67.182.20',
]

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()

    const proxy = await UserProxy.findById(id)
    if (!proxy) return notFound('Proxy not found')

    const newHost     = PROXY_HOSTS[Math.floor(Math.random() * PROXY_HOSTS.length)]
    const newPort     = 8080 + Math.floor(Math.random() * 920)
    const newUsername = `ps_adm_${proxy.userId.toString().slice(-6)}_${Date.now()}`
    const newPassword = crypto.randomBytes(12).toString('base64url')

    proxy.host          = newHost
    proxy.port          = newPort
    proxy.username      = newUsername
    proxy.password      = encrypt(newPassword)
    proxy.replacedCount = (proxy.replacedCount ?? 0) + 1
    proxy.status        = 'active'
    await proxy.save()

    return ok({ message: 'Проксі замінено', host: newHost, port: newPort })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    if ((err as Error).message?.includes('Cast')) return error('Невірний ID')
    return serverError(err)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()
    await UserProxy.findByIdAndUpdate(id, { status: 'suspended' })
    return ok({ message: 'Проксі деактивовано' })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
