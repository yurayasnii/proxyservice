import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import ProxyProduct from '@/lib/models/ProxyProduct'
import { requireRole } from '@/lib/utils/auth'
import { ok, error, serverError } from '@/lib/utils/response'

const PlanSchema = z.object({
  duration: z.enum(['1d', '7d', '30d', '90d', '180d', '1y']),
  ipCount: z.number().int().min(1),
  priceUsdt: z.number().positive(),
  discount: z.number().min(0).max(100).default(0),
  isPopular: z.boolean().default(false),
})

const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['residential', 'datacenter', 'mobile', 'isp']),
  protocols: z.array(z.enum(['http', 'https', 'socks5'])).min(1),
  countryCode: z.string().length(2).toUpperCase(),
  countryName: z.string().min(1),
  city: z.string().optional(),
  ispName: z.string().optional(),
  speedMbps: z.number().positive().optional(),
  uptimePercent: z.number().min(0).max(100).optional(),
  stock: z.number().int().default(-1),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  plans: z.array(PlanSchema).min(1),
})

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type')
    const country = searchParams.get('country')
    const protocol = searchParams.get('protocol')
    const minSpeed = searchParams.get('minSpeed')
    const featured = searchParams.get('featured')
    const sort = searchParams.get('sort') ?? 'createdAt'
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(300, parseInt(searchParams.get('limit') ?? '12'))
    const skip = (page - 1) * limit

    const showAll = searchParams.get('all') === 'true'
    const filter: Record<string, unknown> = showAll ? { deletedAt: null } : { isActive: true, deletedAt: null }
    if (type) filter.type = type
    if (country) filter.countryCode = country.toUpperCase()
    if (protocol) filter.protocols = protocol
    if (featured === 'true') filter.isFeatured = true
    if (minSpeed) filter.speedMbps = { $gte: parseInt(minSpeed) }

    const sortMap: Record<string, [string, 1 | -1][]> = {
      price_asc: [['plans.0.priceUsdt', 1]],
      price_desc: [['plans.0.priceUsdt', -1]],
      speed: [['speedMbps', -1]],
      uptime: [['uptimePercent', -1]],
      createdAt: [['createdAt', -1]],
    }
    const sortQuery = sortMap[sort] ?? [['createdAt', -1]]

    const [products, total] = await Promise.all([
      ProxyProduct.find(filter).sort(sortQuery).skip(skip).limit(limit).lean(),
      ProxyProduct.countDocuments(filter),
    ])

    const serialized = products.map((p) => ({
      ...p,
      plans: p.plans.map((plan) => ({
        ...plan,
        priceUsdt: parseFloat(plan.priceUsdt?.toString() ?? '0'),
      })),
    }))

    return ok({
      items: serialized,
      total,
      page,
      limit,
      hasMore: skip + products.length < total,
    })
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['admin'])
    const body = await req.json()
    const parsed = ProductSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Validation error')

    await connectDB()
    const product = await ProxyProduct.create(parsed.data)
    return ok(product.toJSON(), 201)
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return error('Forbidden', 403)
    return serverError(err)
  }
}
