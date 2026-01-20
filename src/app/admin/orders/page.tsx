'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
    fetchOrders()
  }, [user, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Order status updated')
        fetchOrders()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
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

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-rose-gold">
              ← Back
            </Link>
            <h1 className="text-2xl font-playfair font-bold">Orders Management</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {order.user && (
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {order.user.name} ({order.user.email})
                      </p>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium capitalize ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <option value="placed">Placed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.orderItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
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
                    <h4 className="font-semibold mb-2">Shipping Details</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Name:</strong> {order.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {order.customerEmail}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Phone:</strong> {order.customerPhone}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Address:</strong>
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
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
