import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus, Truck } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isDeliveryAgent = user?.role === 'delivery';
  const items = cart?.items || [];
  
  // Calculate Subtotal dynamically from items
  const subtotal = items.reduce((acc, item) => {
    const price = item.price || item.product?.discountPrice || item.product?.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const tax = Number((subtotal * 0.08).toFixed(2));
  const shipping = subtotal > 100 ? 0 : (subtotal > 0 ? 15.00 : 0);
  const grandTotal = Number((subtotal + tax + shipping).toFixed(2));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Explore our product catalog and add luxury products to your bag.
        </p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-slate-100">Shopping Cart ({items.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Item Rows */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product || {};
            const itemPrice = item.price || product.discountPrice || product.price || 0;
            const itemSubtotal = itemPrice * item.quantity;
            const image = product.images?.[0]?.url || 'https://via.placeholder.com/150';

            return (
              <div
                key={product._id}
                className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-slate-800"
              >
                <img
                  src={image}
                  alt={product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-900"
                />

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-base font-semibold text-slate-100 hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="text-xs text-slate-400">Unit Price: ${itemPrice.toFixed(2)}</div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-700/80 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                    disabled={isDeliveryAgent}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-white px-2">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(product._id, item.quantity + 1)}
                    disabled={isDeliveryAgent}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right min-w-[90px]">
                  <div className="text-sm font-extrabold text-slate-100">${itemSubtotal.toFixed(2)}</div>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="text-xs text-rose-400 hover:underline mt-1 inline-block"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between pt-4">
            <button onClick={clearCart} className="text-xs text-slate-400 hover:text-rose-400 transition-colors">
              Clear Shopping Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="glass-card p-6 rounded-3xl space-y-6 h-fit">
          <h3 className="text-lg font-bold text-slate-100">Order Summary</h3>

          <div className="space-y-3 text-sm border-b border-slate-800 pb-4">
            <div className="flex justify-between text-slate-400">
              <span>Items Subtotal</span>
              <span className="text-slate-200 font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Shipping</span>
              <span className="text-emerald-400 font-semibold">
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Tax (8%)</span>
              <span className="text-slate-200 font-semibold">${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold text-white">
            <span>Total Amount</span>
            <span className="gradient-text">${grandTotal.toFixed(2)}</span>
          </div>

          {isDeliveryAgent ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-slate-100">
                <Truck className="w-4 h-4 text-amber-400" /> Delivery Partner Account
              </div>
              <p className="text-slate-400">
                Delivery accounts are reserved for order logistics & OTP verification. Please sign in with a Customer account to checkout.
              </p>
            </div>
          ) : (
            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 font-semibold cursor-pointer"
            >
              <span>Proceed to Checkout (${grandTotal.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Cart;
