'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'

export default function CartButton() {
  const { count } = useCart()

  return (
    <Link href="/cart" className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <ShoppingCart className="w-4 h-4" style={{ color: '#DDDDDD' }} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: '#FFFFFF', color: '#000000' }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
