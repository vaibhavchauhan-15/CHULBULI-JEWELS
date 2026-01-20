'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { FiPackage, FiShoppingBag, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'

export default function AdminPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
    fetchDashboardStats()
  }, [user, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-playfair font-bold text-rose-gold">
              Admin Panel
            </h1>
            <Link href="/" className="text-sm text-gray-600 hover:text-rose-gold">
              ← Back to Store
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <FiTrendingUp className="w-8 h-8 text-green-500" />
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <p className="text-3xl font-bold text-charcoal">
                ₹{stats?.totalSales?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Sales</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <FiShoppingBag className="w-8 h-8 text-blue-500" />
                <span className="text-sm text-gray-500">All Time</span>
              </div>
              <p className="text-3xl font-bold text-charcoal">
                {stats?.totalOrders || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Orders</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <FiTrendingUp className="w-8 h-8 text-purple-500" />
                <span className="text-sm text-gray-500">This Month</span>
              </div>
              <p className="text-3xl font-bold text-charcoal">
                ₹{stats?.monthSales?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Month Sales</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <FiAlertCircle className="w-8 h-8 text-red-500" />
                <span className="text-sm text-gray-500">Alert</span>
              </div>
              <p className="text-3xl font-bold text-charcoal">
                {stats?.lowStockProducts?.length || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Low Stock</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/products"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <FiPackage className="w-10 h-10 text-rose-gold mb-3" />
            <h3 className="text-lg font-semibold mb-2">Manage Products</h3>
            <p className="text-gray-600 text-sm">
              Add, edit, and manage your product inventory
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <FiShoppingBag className="w-10 h-10 text-rose-gold mb-3" />
            <h3 className="text-lg font-semibold mb-2">Manage Orders</h3>
            <p className="text-gray-600 text-sm">
              View and update order status
            </p>
          </Link>

          <Link
            href="/admin/reviews"
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <FiTrendingUp className="w-10 h-10 text-rose-gold mb-3" />
            <h3 className="text-lg font-semibold mb-2">Moderate Reviews</h3>
            <p className="text-gray-600 text-sm">
              Approve or remove customer reviews
            </p>
          </Link>
        </div>

        {/* Best Selling Products */}
        {stats?.bestSellingProducts && stats.bestSellingProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Best Selling Products</h2>
            <div className="space-y-3">
              {stats.bestSellingProducts.map((product: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-300">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        ₹{product.price?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.totalSold} sold
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiAlertCircle className="text-red-500" />
              Low Stock Alert
            </h2>
            <div className="space-y-3">
              {stats.lowStockProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <p className="font-medium">{product.name}</p>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
