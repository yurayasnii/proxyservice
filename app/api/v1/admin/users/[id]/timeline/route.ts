import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/connect'
import Transaction from '@/lib/models/Transaction'
import Order from '@/lib/models/Order'
import SupportTicket from '@/lib/models/SupportTicket'
import User from '@/lib/models/User'
import { requireRole } from '@/lib/utils/auth'
import { ok, forbidden, serverError } from '@/lib/utils/response'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(req, ['admin'])
    const { id } = await params
    await connectDB()

    const [user, transactions, orders, tickets] = await Promise.all([
      User.findById(id).select('createdAt username').lean(),
      Transaction.find({ userId: id }).sort({ createdAt: -1 }).limit(20).select('type amountUsdt status createdAt description').lean(),
      Order.find({ userId: id }).sort({ createdAt: -1 }).limit(20).select('status totalUsdt paymentMethod createdAt').lean(),
      SupportTicket.find({ userId: id }).sort({ createdAt: -1 }).limit(10).select('category status createdAt').lean(),
    ])

    const events: { type: string; label: string; sub?: string; amount?: number; color: string; date: string }[] = []

    if (user) {
      events.push({ type: 'register', label: 'Реєстрація', color: '#8B5CF6', date: (user as { createdAt: Date }).createdAt.toISOString() })
    }

    for (const tx of transactions as Array<{ type: string; amountUsdt: unknown; status: string; createdAt: Date; description?: string }>) {
      const colors: Record<string, string> = { deposit: '#22C55E', purchase: '#3B82F6', refund: '#8B5CF6', referral_bonus: '#F59E0B' }
      const labels: Record<string, string> = { deposit: 'Поповнення', purchase: 'Покупка', refund: 'Повернення', referral_bonus: 'Реф. бонус' }
      events.push({
        type: tx.type, label: labels[tx.type] ?? tx.type,
        sub: tx.description ?? tx.status,
        amount: parseFloat(String(tx.amountUsdt)),
        color: colors[tx.type] ?? '#888',
        date: tx.createdAt.toISOString(),
      })
    }

    for (const o of orders as Array<{ status: string; totalUsdt: unknown; paymentMethod: string; createdAt: Date }>) {
      events.push({
        type: 'order', label: `Замовлення · ${o.status}`,
        sub: `${o.paymentMethod ?? ''}`,
        amount: parseFloat(String(o.totalUsdt)),
        color: '#3B82F6',
        date: o.createdAt.toISOString(),
      })
    }

    for (const tk of tickets as Array<{ category: string; status: string; createdAt: Date }>) {
      const catMap: Record<string, string> = {
        proxy_not_working: 'Проксі не працює', slow_speed: 'Повільна швидкість',
        wrong_geo: 'Неправильна геолокація', payment_issue: 'Оплата',
        refund_request: 'Повернення', other: 'Інше',
      }
      events.push({
        type: 'ticket', label: `Тікет · ${catMap[tk.category] ?? tk.category}`,
        sub: tk.status, color: '#F59E0B',
        date: tk.createdAt.toISOString(),
      })
    }

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return ok({ events })
  } catch (err) {
    if ((err as Error).message === 'Insufficient permissions') return forbidden()
    return serverError(err)
  }
}
