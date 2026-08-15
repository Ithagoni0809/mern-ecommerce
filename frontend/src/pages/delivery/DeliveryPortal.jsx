import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Truck, CheckCircle2, AlertCircle, Package, Clock, ShieldCheck, MapPin, Search, ArrowRight, User, KeyRound, Building2, Store, Phone } from 'lucide-react';

const DeliveryPortal = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // OTP Verification Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const fetchDeliveryQueue = async () => {
    try {
      const { data } = await API.get('/delivery/orders');
      setOrders(data.data || []);
    } catch (err) {
      console.error('Error fetching delivery shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryQueue();
  }, []);

  const handleTriggerOtp = async (ord) => {
    setSelectedOrder(ord);
    setOtpInput('');
    setModalError('');
    try {
      await API.post(`/delivery/orders/${ord._id}/generate-otp`);
      setSuccessToast('Doorstep Delivery OTP generated & sent to customer tracking screen!');
      setTimeout(() => setSuccessToast(''), 5000);
      fetchDeliveryQueue();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to generate OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim() || otpInput.length < 6) {
      return setModalError('Please enter the full 6-digit OTP code provided by the customer at doorstep');
    }

    setVerifying(true);
    setModalError('');
    try {
      await API.post(`/delivery/orders/${selectedOrder._id}/verify-otp`, {
        otp: otpInput.trim(),
      });
      setSuccessToast(`Package ${selectedOrder.trackingNumber} successfully verified & DELIVERED to customer doorstep!`);
      setTimeout(() => setSuccessToast(''), 5000);
      setSelectedOrder(null);
      fetchDeliveryQueue();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Invalid 6-digit OTP entered. Please ask customer to check their screen.');
    } finally {
      setVerifying(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      o.trackingNumber?.toLowerCase().includes(term) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(term) ||
      o.shippingAddress?.villageOrLocality?.toLowerCase().includes(term) ||
      o.shippingAddress?.district?.toLowerCase().includes(term) ||
      o.seller?.storeName?.toLowerCase().includes(term) ||
      o.seller?.name?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 h-96 glass-card rounded-3xl animate-pulse" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-bold text-slate-100">Delivery Partner Station</h1>
          </div>
          <p className="text-xs text-slate-400">
            Pick up parcels from merchant outlets and verify customer 6-digit OTP at doorstep
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Doorstep OTP Verification Active
          </span>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-indigo-400 text-xs font-semibold uppercase">
            <span>Total Assigned Deliveries</span>
            <Package className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{orders.length} Packages</div>
          <div className="text-xs text-slate-400">Assigned across regional outlets</div>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-amber-400 text-xs font-semibold uppercase">
            <span>Pending Doorstep Handover</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">
            {orders.filter((o) => !o.isDelivered).length} In Transit
          </div>
          <div className="text-xs text-slate-400">Awaiting customer 6-digit OTP</div>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-emerald-400 text-xs font-semibold uppercase">
            <span>Delivered Today</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">
            {orders.filter((o) => o.isDelivered).length} Completed
          </div>
          <div className="text-xs text-slate-400">Verified at customer doorstep</div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by Tracking ID, customer name, village/mandal or merchant outlet..."
          className="bg-transparent text-slate-100 placeholder-slate-500 text-xs w-full focus:outline-none"
        />
      </div>

      {/* Shipments Table */}
      <div className="glass-card rounded-3xl p-6 overflow-x-auto">
        <h2 className="text-base font-bold text-slate-100 mb-4">Assigned Deliveries Queue</h2>
        
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No active shipment packages matching filter.
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-slate-400 uppercase bg-slate-900/60">
              <tr>
                <th className="p-3.5">Tracking Code</th>
                <th className="p-3.5">Pickup Outlet</th>
                <th className="p-3.5">Customer Doorstep</th>
                <th className="p-3.5">Package Items</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Doorstep Handover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-indigo-400">{ord.trackingNumber}</td>
                  
                  {/* Outlet Details */}
                  <td className="p-3.5">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      <span>{ord.seller?.storeName || (ord.seller?.name && ord.seller?.name !== 'seller' ? ord.seller?.name : 'Apex Tech Hyderabad')}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Cherlapally Hub, Ghatkesar</div>
                    {ord.seller?.phone && (
                      <div className="text-[11px] text-emerald-400/80 font-mono">{ord.seller.phone}</div>
                    )}
                  </td>

                  {/* Customer Doorstep Destination */}
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-100">{ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}</div>
                    <div className="text-[11px] text-slate-300 leading-snug max-w-[240px]">
                      {ord.shippingAddress?.houseNo && `${ord.shippingAddress.houseNo}, `}
                      <span className="font-bold text-white">{ord.shippingAddress?.villageOrLocality}</span>, {ord.shippingAddress?.mandalOrTehsil}, {ord.shippingAddress?.district}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono">{ord.shippingAddress?.phone || ord.user?.phone}</div>
                  </td>

                  {/* Items */}
                  <td className="p-3.5">
                    {ord.orderItems?.map((item, idx) => (
                      <div key={idx} className="truncate max-w-[160px] text-slate-200">
                        • {item.name} <span className="text-slate-400">(x{item.quantity})</span>
                      </div>
                    ))}
                  </td>

                  {/* Status Badge */}
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap inline-block ${
                      ord.isDelivered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : ord.orderStatus === 'Out for Delivery'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {ord.orderStatus}
                    </span>
                  </td>

                  {/* Action Handover */}
                  <td className="p-3.5 text-right">
                    {ord.isDelivered ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-4 h-4" /> Delivered
                      </span>
                    ) : (
                      <button
                        onClick={() => handleTriggerOtp(ord)}
                        className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 font-semibold shadow-md shadow-indigo-500/20 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Collect Doorstep OTP</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* OTP Verification Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl space-y-5 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Verify Customer Doorstep OTP</h3>
              <p className="text-xs text-slate-400">
                Tracking: <span className="font-mono font-bold text-indigo-400">{selectedOrder.trackingNumber}</span>
              </p>
              
              <div className="p-3 bg-slate-900 rounded-xl text-left text-xs text-slate-300 space-y-1">
                <div><span className="text-slate-400">Recipient:</span> <span className="font-bold text-white">{selectedOrder.shippingAddress?.fullName || 'Customer'}</span></div>
                <div><span className="text-slate-400">Doorstep:</span> {selectedOrder.shippingAddress?.villageOrLocality}, {selectedOrder.shippingAddress?.mandalOrTehsil} ({selectedOrder.shippingAddress?.phone})</div>
                {selectedOrder.shippingAddress?.landmark && (
                  <div className="text-[11px] text-slate-400 italic">Landmark: {selectedOrder.shippingAddress.landmark}</div>
                )}
              </div>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1 text-center">
                  Ask customer for their 6-Digit Doorstep OTP:
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 849201"
                  className="w-full bg-slate-950 text-center tracking-[0.5em] text-2xl font-mono font-extrabold text-indigo-400 py-3 rounded-2xl border border-indigo-500/50 focus:outline-none focus:border-indigo-400 shadow-inner"
                />
                <p className="text-[10px] text-slate-500 text-center mt-1.5">
                  The customer views this code on their live order tracking screen.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying || otpInput.length < 6}
                  className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {verifying ? 'Verifying...' : 'Confirm Doorstep Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveryPortal;
