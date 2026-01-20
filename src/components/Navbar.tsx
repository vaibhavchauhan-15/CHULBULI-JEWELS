'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiShoppingCart, FiUser, FiMenu, FiX, FiHeart, FiSearch } from 'react-icons/fi'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const categories = [
    { name: 'Earrings', href: '/products?category=earrings' },
    { name: 'Necklaces', href: '/products?category=necklaces' },
    { name: 'Rings', href: '/products?category=rings' },
    { name: 'Bangles', href: '/products?category=bangles' },
    { name: 'Sets', href: '/products?category=sets' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Chulbuli Jewels Logo"
              width={50}
              height={50}
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-rose-gold">
              Chulbuli Jewels
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-charcoal hover:text-rose-gold transition-colors font-medium"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="relative p-2 hover:bg-blush-pink/20 rounded-lg transition-colors"
            >
              <FiShoppingCart className="w-6 h-6 text-charcoal" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="p-2 hover:bg-blush-pink/20 rounded-lg transition-colors">
                  <FiUser className="w-6 h-6 text-charcoal" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-blush-pink/20 transition-colors"
                  >
                    My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 hover:bg-blush-pink/20 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-blush-pink/20 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:block px-4 py-2 bg-rose-gold text-white rounded-lg hover:bg-rose-gold/90 transition-colors"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-blush-pink/20 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6 text-charcoal" />
              ) : (
                <FiMenu className="w-6 h-6 text-charcoal" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="block py-3 text-charcoal hover:text-rose-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                className="block mt-4 py-3 text-center bg-rose-gold text-white rounded-lg hover:bg-rose-gold/90 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
