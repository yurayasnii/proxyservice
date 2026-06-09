import { NextRequest } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import ProxyProduct from '@/lib/models/ProxyProduct'
import { requireRole } from '@/lib/utils/auth'
import { ok, notFound, error, serverError } from '@/lib/utils/response'

const PlanSchema = z.object({
  duration: z.enum(['1d', '7d', '30d', '90d', '180d', '1y']),
  ipCount: z.number().int().min(1),
  priceUsdt: z.number().positive(),
  discount: z.number().min(0).max(100).default(0),
  isPopular: z.boolean().default(false),
})

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  type: z.enum(['residential', 'datacenter', 'mobile', 'isp']).optional(),
  protocols: z.array(z.enum(['http', 'https', 'socks5'])).optional(),
  countryCode: z.string().length(2).toUpperCase().optional(),
  countryName: z.string().optional(),
  city: z.string().optional(),
  ispName: z.string().optional(),
  speedMbps: z.number().positive().optional(),
  uptimePercent: z.number().min(0).max(100).optional(),
  stock: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  plans: z.array(PlanSchema).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()
    const product = await ProxyProduct.findOne({ _id: id, deletedAt: null }).lean()
    if (!product) return notFound('Product not found')

    return ok({
      ...product,
      plans: product.plans.map((plan) => ({
        ...plan,
        priceUsdt: parseFloat(plan.priceUsdt?.toString() ?? '0'),
      })),
    })
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    const body = await req.json()
    if (typeof body.isActive !== 'boolean') return error('isActive must be boolean')

    await connectDB()
    const product = await ProxyProduct.findByIdAndUpdate(id, { isActive: body.isActive }, { new: true })
    if (!product) return notFound('Product not found')

    return ok({ _id: product._id, isActive: product.isActive, name: product.name })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return error('Forbidden', 403)
    return serverError(err)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    const body = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Validation error')

    await connectDB()
    const product = await ProxyProduct.findByIdAndUpdate(id, { $set: parsed.data }, { new: true, runValidators: true })
    if (!product) return notFound('Product not found')

    return ok(product.toJSON())
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return error('Forbidden', 403)
    return serverError(err)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()
    const product = await ProxyProduct.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
    if (!product) return notFound('Product not found')

    return ok({ deleted: true })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return error('Forbidden', 403)
    return serverError(err)
  }
}
