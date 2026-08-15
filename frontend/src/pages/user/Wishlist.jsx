import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/product/ProductCard';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, loading } = useWishlist();
  const products = wishlist?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
        <h1 className="text-3xl font-bold text-slate-100">My Wishlist</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 glass-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl space-y-3">
          <p className="text-slate-400 text-base">Your wishlist is currently empty.</p>
          <p className="text-xs text-slate-500">Save items you love by clicking the heart icon on product cards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
