'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { FiArrowRight } from 'react-icons/fi'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true')
      const data = await response.json()
      setFeaturedProducts(data.slice(0, 8))
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    {
      name: 'Earrings',
      image: '/categories/earrings.jpg',
      href: '/products?category=earrings',
    },
    {
      name: 'Necklaces',
      image: '/categories/necklaces.jpg',
      href: '/products?category=necklaces',
    },
    {
      name: 'Rings',
      image: '/categories/rings.jpg',
      href: '/products?category=rings',
    },
    {
      name: 'Bangles',
      image: '/categories/bangles.jpg',
      href: '/products?category=bangles',
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-blush-pink/20 to-ivory">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-charcoal mb-6">
              Elegance in Every Detail
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover beautiful jewelry pieces crafted for the modern woman. 
              From daily wear to special occasions.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 btn-primary text-lg"
            >
              Shop Now
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-12">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group card overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <div className="text-6xl">💍</div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg group-hover:text-rose-gold transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold">
                Featured Collection
              </h2>
              <Link
                href="/products"
                className="text-rose-gold hover:underline flex items-center gap-2"
              >
                View All
                <FiArrowRight />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No featured products available
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blush-pink/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
                <p className="text-gray-600 text-sm">On orders above ₹999</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blush-pink/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Quality Assured</h3>
                <p className="text-gray-600 text-sm">Premium materials & craftsmanship</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blush-pink/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔄</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Easy Returns</h3>
                <p className="text-gray-600 text-sm">7-day return policy</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
