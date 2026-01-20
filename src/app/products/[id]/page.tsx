'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { FiStar, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)
  const addItem = useCartStore((state) => state.addItem)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.images[0],
      quantity,
      stock: product.stock,
    })

    toast.success('Added to cart!')
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to submit a review')
      router.push('/login')
      return
    }

    if (!reviewText.trim()) {
      toast.error('Please write a review')
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product.id,
          rating,
          comment: reviewText,
        }),
      })

      if (response.ok) {
        toast.success('Review submitted! Waiting for admin approval.')
        setReviewText('')
        setRating(5)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Failed to submit review')
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-gold"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <button onClick={() => router.push('/products')} className="btn-primary">
              Back to Products
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const finalPrice = product.price - (product.price * product.discount) / 100

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Images */}
            <div>
              <div className="card overflow-hidden mb-4">
                <div className="relative aspect-square">
                  <Image
                    src={product.images[selectedImage] || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`card overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-rose-gold' : ''
                      }`}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
                {product.name}
              </h1>

              {product.averageRating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(product.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{product.averageRating}</span>
                  <span className="text-gray-500">
                    ({product.reviews.length} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-rose-gold">
                  ₹{finalPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="bg-rose-gold text-white px-3 py-1 rounded-full text-sm font-medium">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              {product.material && (
                <div className="mb-6">
                  <span className="font-semibold">Material: </span>
                  <span className="text-gray-600">{product.material}</span>
                </div>
              )}

              <div className="mb-6">
                <span className="font-semibold">Availability: </span>
                <span
                  className={`${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>

              {product.stock > 0 && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-semibold">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-100"
                      >
                        <FiMinus />
                      </button>
                      <span className="px-6 font-medium">{quantity}</span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        className="p-3 hover:bg-gray-100"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-playfair font-bold mb-6">
              Customer Reviews
            </h2>

            {user && (
              <div className="card p-6 mb-8">
                <h3 className="font-semibold mb-4">Write a Review</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-2xl"
                      >
                        <FiStar
                          className={
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="input-field mb-4 min-h-[120px]"
                />
                <button onClick={handleSubmitReview} className="btn-primary">
                  Submit Review
                </button>
              </div>
            )}

            <div className="space-y-6">
              {product.reviews.length > 0 ? (
                product.reviews.map((review: any) => (
                  <div key={review.id} className="card p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blush-pink/30 rounded-full flex items-center justify-center font-semibold">
                          {review.user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{review.user.name}</p>
                          <div className="flex">
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
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
