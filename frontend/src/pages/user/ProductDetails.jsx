import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data.data.product);
        setReviews(data.data.reviews || []);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await API.post(`/products/${id}/reviews`, { rating, comment });
      alert('Review submitted successfully!');
      window.location.reload();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 h-96 glass-card rounded-3xl animate-pulse" />;
  }

  if (!product) {
    return <div className="text-center py-20 text-slate-400">Product not found.</div>;
  }

  const isLiked = isInWishlist(product._id);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      
      {/* Top Product Detail Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Main Image View */}
        <div className="glass-card rounded-3xl p-4 overflow-hidden aspect-square bg-slate-900 flex items-center justify-center">
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/600'}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        {/* Product Meta */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <span>{product.category?.name} • {product.brand?.name}</span>
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-2 rounded-full glass-card ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-slate-400'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-100">{product.name}</h1>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 font-bold">{product.rating?.toFixed(1) || '0.0'}</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{product.numReviews || 0} Customer Reviews</span>
            </div>

            <div className="text-3xl font-extrabold text-white flex items-center gap-3">
              <span>${price}</span>
              {product.discountPrice > 0 && (
                <span className="text-lg text-slate-500 line-through">${product.price}</span>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>

            {/* Stock indicator */}
            <div className="text-xs font-semibold">
              Status:{' '}
              {product.stock > 0 ? (
                <span className="text-emerald-400">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-rose-400">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            {user?.role === 'delivery' ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center gap-3">
                <Truck className="w-5 h-5 shrink-0 text-amber-400" />
                <div>
                  <div className="font-bold text-slate-100">Delivery Partner Account (Fulfillment Mode)</div>
                  <p className="text-slate-400 mt-0.5">
                    Your account is registered for courier logistics & doorstep OTP verification. To purchase items, please log in with a customer account.
                  </p>
                </div>
              </div>
            ) : user?._id && (
              (typeof product.seller === 'object' && product.seller?._id === user._id) ||
              product.seller === user._id ||
              (user.storeName && product.seller?.storeName === user.storeName)
            ) ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Your Store Product Listing
                  </div>
                  <p className="text-slate-400">
                    Sellers cannot purchase products from their own store. You can manage stock in your dashboard.
                  </p>
                </div>
                <a
                  href="/seller/dashboard"
                  className="btn-primary py-2 px-4 text-xs font-semibold whitespace-nowrap inline-block text-center"
                >
                  Manage in Dashboard
                </a>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <label className="text-xs font-medium text-slate-300">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-sm text-slate-100 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => addToCart(product._id, quantity)}
                  disabled={product.stock <= 0}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-base font-semibold cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" /> Add To Shopping Cart
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Customer Reviews Section */}
      <div className="glass-card rounded-3xl p-8 space-y-8">
        <h3 className="text-xl font-bold text-slate-100">Customer Ratings & Reviews</h3>

        {/* Review Form */}
        <form onSubmit={handleReviewSubmit} className="space-y-4 p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
          <h4 className="text-sm font-semibold text-slate-200">Write a Customer Review</h4>
          
          {reviewError && (
            <div className="p-3 bg-rose-500/10 text-rose-400 text-xs rounded-xl">{reviewError}</div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-sm text-slate-200 rounded-xl px-3 py-2"
            >
              <option value="5">5 Stars - Excellent</option>
              <option value="4">4 Stars - Good</option>
              <option value="3">3 Stars - Average</option>
              <option value="2">2 Stars - Poor</option>
              <option value="1">1 Star - Very Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Review Comment</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike about this product?"
              className="w-full bg-slate-800 border border-slate-700 text-sm text-slate-100 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button type="submit" className="btn-primary text-xs py-2.5 px-5">
            Submit Review
          </button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500">No reviews yet for this product.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{rev.name}</span>
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1 font-bold">{rev.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductDetails;
