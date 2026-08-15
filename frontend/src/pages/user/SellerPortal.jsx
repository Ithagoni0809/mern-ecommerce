import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Store, Plus, Clock, CheckCircle2, XCircle, Package, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const SellerPortal = () => {
  const { user } = useAuth();
  const [sellerStatus, setSellerStatus] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Application Form
  const [formData, setFormData] = useState({
    storeName: '',
    businessCategory: 'Consumer Electronics',
    storeDescription: '',
    contactPhone: '',
    businessAddress: '',
  });

  // New Product Submission Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, prodRes, catRes, brandRes] = await Promise.all([
        API.get('/sellers/status'),
        API.get('/sellers/my-products'),
        API.get('/categories'),
        API.get('/brands'),
      ]);
      setSellerStatus(statusRes.data.data);
      setMyProducts(prodRes.data.data || []);
      setCategories(catRes.data.data || []);
      setBrands(brandRes.data.data || []);
    } catch (err) {
      console.error('Seller portal error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/sellers/apply', formData);
      alert(data.message || 'Application submitted successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/sellers/products', newProduct);
      alert('Product submitted to Admin approval queue!');
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit product');
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Store className="w-16 h-16 text-indigo-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-100">Merchant & Seller Portal</h2>
        <p className="text-sm text-slate-400">Please sign in to submit your seller application and manage your store inventory.</p>
      </div>
    );
  }

  const isApprovedSeller = user.role === 'seller' || user.role === 'admin' || sellerStatus?.status === 'approved';
  const isPending = sellerStatus?.status === 'pending';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Store className="w-8 h-8 text-emerald-400" /> Seller Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isApprovedSeller
              ? 'Manage your storefront, inventory, and product approval submissions.'
              : 'Join LUXE as a verified merchant. Submit your store application for Admin approval.'}
          </p>
        </div>

        {isApprovedSeller && (
          <button
            onClick={() => setShowProductModal(true)}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Submit Product for Approval
          </button>
        )}
      </div>

      {/* STATE 1: PENDING APPLICATION BANNER */}
      {isPending && (
        <div className="p-6 glass-card rounded-3xl border border-amber-500/30 bg-amber-500/10 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <Clock className="w-5 h-5" /> Seller Application Under Admin Review
          </div>
          <p className="text-xs text-slate-300">
            Your application for <span className="font-semibold text-white">{sellerStatus.storeName}</span> has been submitted to the Administrator. Once approved, you can start listing products on the public marketplace.
          </p>
        </div>
      )}

      {/* STATE 2: ONBOARDING FORM (If not approved) */}
      {!isApprovedSeller && !isPending && (
        <div className="glass-card max-w-2xl mx-auto p-8 rounded-3xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Apply to Become a Seller</h2>
            <p className="text-xs text-slate-400">Provide your store details. The Administrator will review and activate your seller privileges.</p>
          </div>

          <form onSubmit={handleApply} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Store / Business Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Global Tech"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Business Category</label>
              <select
                value={formData.businessCategory}
                onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Consumer Electronics">Consumer Electronics</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Luxury Goods">Luxury Goods</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Store Description & Value Proposition</label>
              <textarea
                required
                rows={3}
                placeholder="Describe what your brand sells and why customers love your products..."
                value={formData.storeDescription}
                onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Registered Business Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, City, State, ZIP"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 font-semibold">
              <span>Submit Merchant Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* STATE 3: APPROVED SELLER PRODUCT CATALOG & QUEUE */}
      {isApprovedSeller && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-card p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400">Total Products Submitted</div>
              <div className="text-2xl font-bold text-white">{myProducts.length} Items</div>
            </div>
            <div className="glass-card p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400">Approved & Live on Marketplace</div>
              <div className="text-2xl font-bold text-emerald-400">
                {myProducts.filter((p) => p.isApproved).length} Live
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400">Pending Admin Approval</div>
              <div className="text-2xl font-bold text-amber-400">
                {myProducts.filter((p) => p.approvalStatus === 'pending').length} In Queue
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 overflow-x-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-100">My Product Catalog & Approval Status</h3>
            </div>

            {myProducts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-3">
                <Package className="w-10 h-10 text-slate-500 mx-auto" />
                <p>You haven't submitted any products yet.</p>
                <button
                  onClick={() => setShowProductModal(true)}
                  className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add First Product
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-slate-400 uppercase bg-slate-900/60">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Admin Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {myProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-slate-100">{prod.name}</td>
                      <td className="p-3 text-slate-400">{prod.category?.name || 'Category'}</td>
                      <td className="p-3 font-bold">${prod.price}</td>
                      <td className="p-3">{prod.stock} units</td>
                      <td className="p-3">
                        {prod.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED & LIVE
                          </span>
                        ) : prod.approvalStatus === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" /> REJECTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" /> PENDING ADMIN REVIEW
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

      {/* Seller Product Upload Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Submit Product for Admin Review</h3>
            <form onSubmit={handleProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Bluetooth Speaker"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detailed product features..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-5 py-2">
                  Submit to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerPortal;
