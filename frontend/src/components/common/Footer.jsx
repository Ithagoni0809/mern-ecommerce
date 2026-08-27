import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                B
              </div>
              <span className="text-xl font-extrabold tracking-tight gradient-text">BharatKart</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's modern multi-vendor e-commerce marketplace featuring proximity regional seller fulfillment and verified doorstep OTP delivery.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/products" className="hover:text-indigo-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?sort=newest" className="hover:text-indigo-400 transition-colors">New Arrivals</Link></li>
              <li><Link to="/products?rating=4" className="hover:text-indigo-400 transition-colors">Top Rated</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Account & Orders</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/cart" className="hover:text-indigo-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-indigo-400 transition-colors">Wishlist</Link></li>
              <li><Link to="/track-order" className="hover:text-indigo-400 transition-colors">Track Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Security</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Protected by JWT authentication, bcrypt password encryption, Helmet security headers, rate limiters, and Razorpay payment gateway.
            </p>
            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
              ✓ Razorpay Verified
            </span>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} BharatKart E-Commerce Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
