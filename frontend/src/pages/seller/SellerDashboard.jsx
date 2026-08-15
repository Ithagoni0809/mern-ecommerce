import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Truck,
  Check,
  User,
  Settings,
  Home,
  Phone,
} from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'overview' | 'settings'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Add Product Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: '',
    stock: '',
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' }],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, prodRes, catRes, brandRes, profileRes] = await Promise.all([
        API.get('/sellers/orders'),
        API.get('/sellers/products'),
        API.get('/categories'),
        API.get('/brands'),
        API.get('/sellers/profile'),
      ]);

      setOrders(ordersRes.data.data || []);
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
      setBrands(brandRes.data.data || []);
      setSellerProfile(profileRes.data.data);
    } catch (err) {
      console.error('Error loading seller dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/sellers/orders/${orderId}/status`, { orderStatus: newStatus });
      setStatusMessage(
        newStatus === 'Dispatched'
          ? 'Order packed at your outlet! Marked as Dispatched.'
          : 'Order handed over to courier for customer doorstep delivery!'
      );
      setTimeout(() => setStatusMessage(''), 4000);
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/sellers/products', {
        ...newProduct,
        price: Number(newProduct.price),
        discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : 0,
        stock: Number(newProduct.stock),
      });

      setStatusMessage('New product submitted for Admin review and approval!');
      setTimeout(() => setStatusMessage(''), 5000);
      setShowProductModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        brand: '',
        stock: '',
        images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' }],
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit product');
    }
  };

  const totalSales = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 h-96 glass-card rounded-3xl animate-pulse" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Merchant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-bold text-slate-100">
              {sellerProfile?.storeName || 'Apex Tech Hyderabad • Outlet Dashboard'}
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Accept customer orders, pack items at your outlet, and hand over to dispatch couriers
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowProductModal(true)}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 font-semibold shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Add Product for Approval
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'orders' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Doorstep Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'inventory' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Outlet Catalog & Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Outlet Revenue Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Outlet Settings</span>
        </button>
      </div>

      {/* TAB 1: ACCEPT & PROCESS CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" /> Incoming Customer Doorstep Orders ({orders.length})
              </h3>
              <p className="text-xs text-slate-400">Accept customer order requests, pack items at outlet, and dispatch</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 overflow-x-auto">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto" />
                <p>No customer orders in queue right now.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-slate-400 uppercase bg-slate-900/60">
                  <tr>
                    <th className="p-3">Tracking ID</th>
                    <th className="p-3">Customer Doorstep</th>
                    <th className="p-3">Items Ordered</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Outlet Stage</th>
                    <th className="p-3">Fulfillment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono font-bold text-indigo-400">
                        {ord.trackingNumber}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-indigo-400" />
                          {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          {ord.shippingAddress?.villageOrLocality}, {ord.shippingAddress?.mandalOrTehsil}
                        </div>
                        <div className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {ord.shippingAddress?.phone || '+91 98765 99999'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {ord.orderItems?.map((item, idx) => (
                            <div key={idx} className="text-slate-200 truncate max-w-[180px]">
                              • {item.name} <span className="text-slate-400">(x{item.quantity})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white">${ord.totalPrice?.toFixed(2)}</div>
                        <span className="text-emerald-400 font-semibold text-[10px]">PAID (Verified)</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          ord.orderStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          ord.orderStatus === 'In Transit' || ord.orderStatus === 'Out for Delivery' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          ord.orderStatus === 'Dispatched' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>

                      {/* 1-Click Progressive Action Button */}
                      <td className="p-3">
                        {ord.orderStatus === 'Processing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord._id, 'Dispatched')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Pack at Outlet
                          </button>
                        )}
                        {ord.orderStatus === 'Dispatched' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord._id, 'In Transit')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" /> Handover to Courier
                          </button>
                        )}
                        {(ord.orderStatus === 'In Transit' || ord.orderStatus === 'Out for Delivery') && (
                          <span className="text-amber-400 font-semibold text-xs flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" /> En Route to Doorstep
                          </span>
                        )}
                        {ord.orderStatus === 'Delivered' && (
                          <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered at Doorstep
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY & STOCK */}
      {activeTab === 'inventory' && (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" /> Outlet Products ({products.length})
            </h3>
            <button
              onClick={() => setShowProductModal(true)}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Submit New Item
            </button>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-slate-400 uppercase bg-slate-900/60">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock Units</th>
                <th className="p-3">Admin Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="p-3 font-semibold text-white">{p.name}</td>
                  <td className="p-3 text-slate-400">{p.category?.name || 'Electronics'}</td>
                  <td className="p-3 font-bold text-emerald-400">${p.price?.toFixed(2)}</td>
                  <td className="p-3 font-mono">{p.stock} units</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      p.approvalStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                      p.approvalStatus === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {p.approvalStatus || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: OVERVIEW & REVENUE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="glass-card p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-emerald-400 text-xs font-semibold uppercase">
              <span>Gross Outlet Revenue</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-white">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-slate-400">Total fulfilled orders</p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-indigo-400 text-xs font-semibold uppercase">
              <span>Total Doorstep Orders</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-white">{orders.length}</div>
            <p className="text-xs text-slate-400">Customer requests processed</p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-2">
            <div className="flex justify-between items-center text-purple-400 text-xs font-semibold uppercase">
              <span>Active Outlet Listings</span>
              <Package className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-white">{products.length}</div>
            <p className="text-xs text-slate-400">Catalog items in stock</p>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="glass-card p-6 rounded-3xl max-w-xl space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-100">Outlet Profile & Logistics Hub</h3>
          <div className="p-4 bg-slate-900 rounded-2xl space-y-2 border border-slate-800">
            <div><span className="text-slate-400">Merchant Store:</span> <span className="font-semibold text-white">{sellerProfile?.storeName || 'Apex Tech Hyderabad'}</span></div>
            <div><span className="text-slate-400">Outlet Contact Phone:</span> <span className="font-mono text-emerald-400">{sellerProfile?.contactPhone || '+91 98765 11112'}</span></div>
            <div><span className="text-slate-400">Outlet Warehouse Location:</span> <span className="text-slate-200">{sellerProfile?.businessAddress || 'Cherlapally Industrial Area, Ghatkesar Mandal, Medchal-Malkajgiri, Telangana - 501301'}</span></div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-3xl space-y-4 border border-emerald-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Add Product for Outlet Inventory</h3>
            
            <form onSubmit={handleCreateProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detailed specifications and features..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="399.99"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Discount Price ($)</label>
                  <input
                    type="number"
                    value={newProduct.discountPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, discountPrice: e.target.value })}
                    placeholder="349.99"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="25"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Brand</label>
                  <select
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerDashboard;
