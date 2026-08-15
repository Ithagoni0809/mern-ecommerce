import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          API.get('/products?limit=8'),
          API.get('/categories'),
        ]);
        setFeaturedProducts(prodRes.data.data.products || []);
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl glass-card border border-indigo-500/20 p-8 sm:p-16 my-6">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" /> Next-Gen Enterprise E-Commerce
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Discover Premium <span className="gradient-text">Products</span> Tailored For You.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Experience ultra-fast checkout, secure Stripe payments, instant order tracking, and curated luxury items with React 19 architecture.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/products" className="btn-primary flex items-center gap-2">
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/track-order" className="px-6 py-3 rounded-xl glass-card text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Express Delivery</h4>
            <p className="text-xs text-slate-400 mt-0.5">Free shipping on orders over $100</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">256-bit Protection</h4>
            <p className="text-xs text-slate-400 mt-0.5">JWT & SSL encrypted safety</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Stripe Payments</h4>
            <p className="text-xs text-slate-400 mt-0.5">Instant credit card confirmation</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Easy 30-Day Return</h4>
            <p className="text-xs text-slate-400 mt-0.5">Hassle-free money back guarantee</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Trending Products</h2>
            <p className="text-sm text-slate-400 mt-1">Handpicked favorites selected for highest quality</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-indigo-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
