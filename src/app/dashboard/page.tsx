'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchOrders()
  }, [user, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else if (response.status === 401) {
        // If unauthorized, redirect to login
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800'
      case 'packed':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) return null

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-2">
              My Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>

          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {user.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Role:</span>{' '}
                <span className="capitalize">{user.role}</span>
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-playfair font-bold mb-6">Order History</h2>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="card p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <p className="font-semibold text-lg mb-1">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize mt-2 md:mt-0 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        {order.orderItems.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {item.product.name} x {item.quantity}
                            </span>
                            <span className="font-medium">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-xl font-bold text-rose-gold">
                          ₹{order.totalPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Shipping Address:</span>
                          <br />
                          {order.addressLine1}, {order.addressLine2 && `${order.addressLine2}, `}
                          {order.city}, {order.state} - {order.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">No orders yet</p>
                <button
                  onClick={() => router.push('/products')}
                  className="btn-primary"
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
