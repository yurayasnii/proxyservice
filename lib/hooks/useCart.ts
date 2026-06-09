'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CartItem {
  productId: string
  planId: string
  productName: string
  countryCode: string
  countryName: string
  type: string
  duration: string
  ipCount: number
  price: number
  quantity: number
}

const CART_KEY = 'ps_cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch { return [] }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-update'))
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(loadCart())
    const handler = () => setItems(loadCart())
    window.addEventListener('cart-update', handler)
    return () => window.removeEventListener('cart-update', handler)
  }, [])

  const addItem = useCallback((item: CartItem) => {
    const current = loadCart()
    const existing = current.findIndex(
      i => i.productId === item.productId && i.planId === item.planId
    )
    let next: CartItem[]
    if (existing >= 0) {
      next = current.map((i, idx) =>
        idx === existing ? { ...i, quantity: i.quantity + item.quantity } : i
      )
    } else {
      next = [...current, item]
    }
    saveCart(next)
    setItems(next)
  }, [])

  const removeItem = useCallback((productId: string, planId: string) => {
    const next = loadCart().filter(i => !(i.productId === productId && i.planId === planId))
    saveCart(next)
    setItems(next)
  }, [])

  const clearCart = useCallback(() => {
    saveCart([])
    setItems([])
  }, [])

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return { items, addItem, removeItem, clearCart, total, count }
}
