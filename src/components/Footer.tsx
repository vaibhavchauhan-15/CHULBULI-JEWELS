'use client'

import Link from 'next/link'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-playfair font-bold text-rose-gold mb-4">
              Chulbuli Jewels
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Elegant and affordable jewelry for every woman. Quality craftsmanship with timeless designs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-charcoal mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-rose-gold transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-rose-gold transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-rose-gold transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-charcoal mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-rose-gold transition-colors text-sm">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-rose-gold transition-colors text-sm">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link href="/care" className="text-gray-600 hover:text-rose-gold transition-colors text-sm">
                  Care Instructions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-charcoal mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 text-sm">
                <FiMail className="w-4 h-4 mr-2 text-rose-gold" />
                hello@chulbulijewels.com
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <FiPhone className="w-4 h-4 mr-2 text-rose-gold" />
                +91 98765 43210
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-rose-gold hover:text-rose-gold/80 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-rose-gold hover:text-rose-gold/80 transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-rose-gold hover:text-rose-gold/80 transition-colors">
                <FaWhatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} Chulbuli Jewels. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
