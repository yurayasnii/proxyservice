import { NextRequest } from 'next/server'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db/connect'
import UserProxy from '@/lib/models/UserProxy'
import { requireAuth } from '@/lib/utils/auth'
import { ok, error, notFound, unauthorized, serverError, forbidden } from '@/lib/utils/response'
import { encrypt, decrypt } from '@/lib/utils/crypto'
import ProxyProduct from '@/lib/models/ProxyProduct'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const payload = requireAuth(req)
    const { id } = await params
    await connectDB()

    const proxy = await UserProxy.findOne({ _id: id, userId: payload.userId })
      .select('+password')
      .populate('productId')
      .lean()

    if (!proxy) return notFound('Proxy not found')

    return ok({
      ...proxy,
      password: proxy.password ? decrypt(proxy.password) : undefined,
    })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const payload = requireAuth(req)
    const { id } = await params
    const { action } = await req.json()
    await connectDB()

    const proxy = await UserProxy.findOne({ _id: id, userId: payload.userId })
    if (!proxy) return notFound('Proxy not found')

    if (action === 'replace') {
      if (proxy.replacedCount >= 3) return error('Replacement limit reached (max 3 per subscription)')
      if (proxy.status !== 'active') return error('Only active proxies can be replaced')

      const product = await ProxyProduct.findById(proxy.productId)
      if (!product) return error('Product not found')

      const hosts = ['195.154.122.20', '185.220.101.55', '91.108.4.20', '149.154.175.50']
      const newHost = hosts[Math.floor(Math.random() * hosts.length)]
      const newPort = 8080 + Math.floor(Math.random() * 200)
      const newUsername = `ps_${proxy.productId.toString().slice(-6)}_${Date.now()}`
      const newPassword = crypto.randomBytes(12).toString('base64url')

      proxy.host = newHost
      proxy.port = newPort
      proxy.username = newUsername
      proxy.password = encrypt(newPassword)
      proxy.replacedCount += 1
      proxy.status = 'active'
      await proxy.save()

      return ok({
        host: newHost,
        port: newPort,
        username: newUsername,
        password: newPassword,
        replacedCount: proxy.replacedCount,
      })
    }

    if (action === 'toggle_renew') {
      proxy.autoRenew = !proxy.autoRenew
      await proxy.save()
      return ok({ autoRenew: proxy.autoRenew })
    }

    if (action === 'check') {
      proxy.lastCheckedAt = new Date()
      const isAlive = Math.random() > 0.05
      await proxy.save()
      return ok({ alive: isAlive, checkedAt: proxy.lastCheckedAt })
    }

    return error('Unknown action')
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const payload = requireAuth(req)
    const { id } = await params
    await connectDB()

    const proxy = await UserProxy.findOne({ _id: id, userId: payload.userId })
    if (!proxy) return notFound('Proxy not found')

    proxy.status = 'suspended'
    await proxy.save()

    return ok({ message: 'Proxy suspended' })
  } catch (err) {
    if ((err as Error).message === 'No token provided') return unauthorized()
    return serverError(err)
  }
}
