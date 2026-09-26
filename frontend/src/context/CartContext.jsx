import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'thread-form-cart'

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter((line) => line?.item?.id && line.quantity > 0) : []
  } catch { return [] }
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(loadCart)
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)) }, [lines])

  function addItem(item) {
    if (item.stock < 1) return
    setLines((current) => {
      const existing = current.find((line) => line.item.id === item.id)
      if (!existing) return [...current, { item, quantity: 1 }]
      return current.map((line) => line.item.id === item.id
        ? { item, quantity: Math.min(line.quantity + 1, item.stock) }
        : line)
    })
  }

  function setQuantity(itemId, quantity) {
    setLines((current) => current.flatMap((line) => {
      if (line.item.id !== itemId) return [line]
      const nextQuantity = Math.min(Number(quantity), line.item.stock)
      return nextQuantity > 0 ? [{ ...line, quantity: nextQuantity }] : []
    }))
  }

  function removeItem(itemId) { setLines((current) => current.filter((line) => line.item.id !== itemId)) }
  function clearCart() { setLines([]) }

  const value = useMemo(() => ({
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + Number(line.item.price) * line.quantity, 0),
    addItem,
    setQuantity,
    removeItem,
    clearCart,
  }), [lines])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
