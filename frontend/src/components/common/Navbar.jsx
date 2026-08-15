import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  Store,
  Truck,
  Shield,
  ChevronDown,
  ArrowRight,
  User,
  Settings,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.products?.length || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              B
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight gradient-text">
              BharatKart
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, luxury items..."
                className="w-full bg-slate-900/60 text-slate-100 placeholder-slate-500 text-sm pl-10 pr-4 py-2.5 rounded-full border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </form>

          {/* Action Links */}
          <div className="flex items-center gap-4 sm:gap-5">
            <Link to="/products" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors hidden sm:block">
              Shop All
            </Link>

            {/* Unified Role-Aware Track Orders Button */}
            <Link
              to="/track-order"
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Track Orders</span>
            </Link>

            {user?.role === 'delivery' ? (
              <Link
                to="/delivery/portal"
                className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delivery Station</span>
              </Link>
            ) : (
              <>
                {/* Wishlist Icon */}
                <Link to="/wishlist" className="relative p-2 text-slate-300 hover:text-pink-400 transition-colors">
                  <Heart className="w-6 h-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Icon */}
                <Link to="/cart" className="relative p-2 text-slate-300 hover:text-indigo-400 transition-colors">
                  <ShoppingBag className="w-6 h-6" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {totalCartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* USER PROFILE AVATAR & DROPDOWN MENU */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-90 transition-opacity cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-500/40 group-hover:scale-105 transition-transform">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Glowing Online Indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
                  </div>

                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-slate-200 leading-tight group-hover:text-indigo-300 transition-colors">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-indigo-400 font-semibold uppercase flex items-center gap-1">
                      <span>{user.role}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </button>

                {/* DROPDOWN POPOVER PANEL */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-80 rounded-3xl glass-card border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 py-4 px-3 space-y-3 animate-fadeIn z-50 bg-slate-950/95 backdrop-blur-xl">
                    
                    {/* User Header Profile Card */}
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-white">{user.name}</div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          user.role === 'seller' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          user.role === 'delivery' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {user.role === 'admin' ? '👑 Administrator' :
                           user.role === 'seller' ? '🏪 Verified Merchant' :
                           user.role === 'delivery' ? '🚚 Delivery Partner' :
                           '⭐ Verified Customer'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                    </div>

                    {/* Quick Useful Actions */}
                    <div className="space-y-1 text-xs">
                      
                      {/* Edit Profile & Address */}
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl text-slate-200 hover:bg-slate-900 hover:text-indigo-400 transition-colors group"
                      >
                        <span className="flex items-center gap-2.5 font-medium">
                          <User className="w-4 h-4 text-indigo-400" />
                          <span>Profile, Address & Phone Settings</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link
                        to="/track-order"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl text-slate-200 hover:bg-slate-900 hover:text-indigo-400 transition-colors group"
                      >
                        <span className="flex items-center gap-2.5 font-medium">
                          <Package className="w-4 h-4 text-indigo-400" />
                          <span>Track My Orders & Delivery OTP</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl text-slate-200 hover:bg-slate-900 hover:text-pink-400 transition-colors group"
                      >
                        <span className="flex items-center gap-2.5 font-medium">
                          <Heart className="w-4 h-4 text-pink-400" />
                          <span>Saved Wishlist Items</span>
                        </span>
                        <span className="font-bold text-pink-400 text-[11px]">{wishlistCount}</span>
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl text-slate-200 hover:bg-slate-900 hover:text-indigo-400 transition-colors group"
                      >
                        <span className="flex items-center gap-2.5 font-medium">
                          <ShoppingBag className="w-4 h-4 text-indigo-400" />
                          <span>Shopping Cart & Checkout</span>
                        </span>
                        <span className="font-bold text-indigo-400 text-[11px]">{totalCartCount}</span>
                      </Link>

                      {/* Merchant Portal (Seller or Admin) */}
                      {(user.role === 'seller' || user.role === 'admin') && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl text-emerald-400 hover:bg-slate-900 hover:text-emerald-300 transition-colors group border border-emerald-500/20 bg-emerald-500/5 mt-1"
                        >
                          <span className="flex items-center gap-2.5 font-semibold">
                            <Store className="w-4 h-4" />
                            <span>Merchant Seller Dashboard</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}

                      {/* Delivery Portal (Delivery Agent or Admin) */}
                      {(user.role === 'delivery' || user.role === 'admin') && (
                        <Link
                          to="/delivery/portal"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl text-amber-400 hover:bg-slate-900 hover:text-amber-300 transition-colors group border border-amber-500/20 bg-amber-500/5 mt-1"
                        >
                          <span className="flex items-center gap-2.5 font-semibold">
                            <Truck className="w-4 h-4" />
                            <span>Delivery Agent Station</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}

                      {/* Admin Portal (Admin Only) */}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl text-purple-400 hover:bg-slate-900 hover:text-purple-300 transition-colors group border border-purple-500/20 bg-purple-500/5 mt-1"
                        >
                          <span className="flex items-center gap-2.5 font-semibold">
                            <Shield className="w-4 h-4" />
                            <span>Platform Admin Control</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold text-xs transition-colors cursor-pointer border border-rose-500/20"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of Account</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs py-2 px-4 font-semibold shadow-md shadow-indigo-500/20"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-slate-800 px-4 pt-2 pb-6 space-y-4 animate-fadeIn">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-900 text-slate-100 text-sm pl-10 pr-4 py-2.5 rounded-full border border-slate-800 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </form>

          <div className="flex flex-col space-y-2 text-sm font-semibold">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300"
            >
              Shop All Products
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-900 text-indigo-400 font-bold"
            >
              Track Orders & Doorstep OTP
            </Link>
            {user && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-300"
              >
                Profile & Address Settings
              </Link>
            )}
            {user?.role === 'seller' && (
              <Link
                to="/seller/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                Merchant Seller Dashboard
              </Link>
            )}
            {user?.role === 'delivery' && (
              <Link
                to="/delivery/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20"
              >
                Delivery Agent Station
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20"
              >
                Platform Admin Control
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
