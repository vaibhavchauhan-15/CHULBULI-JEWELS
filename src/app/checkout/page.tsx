'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        ...formData,
        userId: user?.id || null,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const order = await response.json()
        clearCart()
        toast.success('Order placed successfully!')
        router.push(`/order-success?orderId=${order.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="customerName"
                    placeholder="Full Name *"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                  <input
                    type="email"
                    name="customerEmail"
                    placeholder="Email Address *"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                  <input
                    type="tel"
                    name="customerPhone"
                    placeholder="Phone Number *"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="addressLine1"
                    placeholder="Address Line 1 *"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                  <input
                    type="text"
                    name="addressLine2"
                    placeholder="Address Line 2 (Optional)"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="input-field"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City *"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State *"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                  </div>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode *"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="flex items-center gap-3 p-4 border-2 border-rose-gold rounded-lg">
                  <input
                    type="radio"
                    id="cod"
                    name="payment"
                    value="cod"
                    defaultChecked
                    className="w-4 h-4 text-rose-gold"
                  />
                  <label htmlFor="cod" className="font-medium">
                    Cash on Delivery (COD)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-lg disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => {
                    const finalPrice = item.price - (item.price * item.discount) / 100
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{(finalPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-rose-gold">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
