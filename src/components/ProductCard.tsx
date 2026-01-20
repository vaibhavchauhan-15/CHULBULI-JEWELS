'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FiStar } from 'react-icons/fi'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    discount: number
    images: string[]
    averageRating?: number
    reviewCount?: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const finalPrice = product.price - (product.price * product.discount) / 100

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="card overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount > 0 && (
            <div className="absolute top-3 right-3 bg-rose-gold text-white px-3 py-1 rounded-full text-sm font-medium">
              {product.discount}% OFF
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-charcoal mb-2 line-clamp-2 group-hover:text-rose-gold transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            {product.averageRating !== undefined && product.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <FiStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.averageRating}</span>
                {product.reviewCount !== undefined && product.reviewCount > 0 && (
                  <span className="text-sm text-gray-500">({product.reviewCount})</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-rose-gold">
              ₹{finalPrice.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
