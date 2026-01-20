'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { FiStar, FiCheck, FiX, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminReviewsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // pending, approved, all

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
    fetchReviews()
  }, [user, router])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ approved: true }),
      })

      if (response.ok) {
        toast.success('Review approved')
        fetchReviews()
      } else {
        toast.error('Failed to approve review')
      }
    } catch (error) {
      toast.error('Failed to approve review')
    }
  }

  const handleReject = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ approved: false }),
      })

      if (response.ok) {
        toast.success('Review rejected')
        fetchReviews()
      } else {
        toast.error('Failed to reject review')
      }
    } catch (error) {
      toast.error('Failed to reject review')
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('Review deleted')
        fetchReviews()
      } else {
        toast.error('Failed to delete review')
      }
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  const filteredReviews = reviews.filter((review: any) => {
    if (filter === 'pending') return !review.approved
    if (filter === 'approved') return review.approved
    return true
  })

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-rose-gold">
              ← Back
            </Link>
            <h1 className="text-2xl font-playfair font-bold">Review Moderation</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-rose-gold text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Pending ({reviews.filter((r: any) => !r.approved).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-rose-gold text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Approved ({reviews.filter((r: any) => r.approved).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-rose-gold text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All ({reviews.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review: any) => (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blush-pink/30 rounded-full flex items-center justify-center font-semibold">
                        {review.user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{review.user.name}</p>
                        <p className="text-sm text-gray-600">{review.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      Product: <span className="font-medium">{review.product.name}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!review.approved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <FiCheck className="w-5 h-5" />
                      </button>
                    )}
                    {review.approved && (
                      <button
                        onClick={() => handleReject(review.id)}
                        className="p-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition-colors"
                        title="Unapprove"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {review.approved && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                      <FiCheck className="w-4 h-4" /> Approved & Visible
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No reviews to display</p>
          </div>
        )}
      </div>
    </div>
  )
}
