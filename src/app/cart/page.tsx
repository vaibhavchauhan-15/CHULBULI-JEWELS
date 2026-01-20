'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCartStore } from '@/store/cartStore'
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()

  const handleCheckout = () => {
    if (items.length === 0) return
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">
                Add some beautiful jewelry to your cart
              </p>
              <button onClick={() => router.push('/products')} className="btn-primary">
                Continue Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-8">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const finalPrice = item.price - (item.price * item.discount) / 100
                return (
                  <div key={item.id} className="card p-6">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-rose-gold">
                            ₹{finalPrice.toFixed(2)}
                          </span>
                          {item.discount > 0 && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{item.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100"
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="px-4 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100"
                              disabled={item.quantity >= item.stock}
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-rose-gold">
                        ₹{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={handleCheckout} className="btn-primary w-full mb-3">
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => router.push('/products')}
                  className="btn-secondary w-full"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
