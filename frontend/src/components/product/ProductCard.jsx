import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { Heart, ShoppingCart, Star, Truck } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const isLiked = isInWishlist(product._id);
  const isDeliveryAgent = user?.role === 'delivery';
  const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/400';

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group">
      
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-900 overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discountPrice > 0 && (
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              SALE
            </span>
          )}
          {product.stock <= 0 && (
            <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Wishlist Button (Only for non-delivery agents) */}
        {!isDeliveryAgent && (
          <button
            onClick={() => toggleWishlist(product._id)}
            className={`absolute top-3 right-3 p-2.5 rounded-full glass-card transition-colors ${
              isLiked ? 'text-pink-500 fill-pink-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{product.category?.name || 'Category'}</span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>

          <Link to={`/products/${product._id}`}>
            <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-slate-100">
              ${product.discountPrice > 0 ? product.discountPrice : product.price}
            </div>
            {product.discountPrice > 0 && (
              <div className="text-xs text-slate-500 line-through">
                ${product.price}
              </div>
            )}
          </div>

          {isDeliveryAgent ? (
            <span
              title="Delivery Agent Account (Fulfillment Mode)"
              className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1"
            >
              <Truck className="w-4 h-4" />
            </span>
          ) : (
            <button
              onClick={() => addToCart(product._id)}
              disabled={product.stock <= 0}
              className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Add to Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
