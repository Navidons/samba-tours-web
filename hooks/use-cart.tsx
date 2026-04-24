"use client"

import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react"

export interface CartItem {
  id: string
  tourId: number
  title: string
  slug: string
  image: string
  price: number
  duration: string
  location: string
  startDate: string
  guests: number
  category: string
  maxGroupSize: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, guests: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('samba-cart')
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error('Error loading cart from localStorage:', error)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('samba-cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    setItems(currentItems => {
      // Check if item already exists
      const existingItemIndex = currentItems.findIndex(item => 
        item.tourId === newItem.tourId && item.startDate === newItem.startDate
      )

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          guests: updatedItems[existingItemIndex].guests + newItem.guests
        }
        return updatedItems
      } else {
        // Add new item
        return [...currentItems, { ...newItem, id: `${newItem.tourId}-${Date.now()}` }]
      }
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, guests: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, guests: Math.max(1, Math.min(guests, item.maxGroupSize)) } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.price * item.guests), 0)
  }, [items])

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.guests, 0)
  }, [items])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount
  }), [items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount])

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 
