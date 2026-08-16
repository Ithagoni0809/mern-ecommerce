import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Package, Search, Clock, CheckCircle2, Truck, AlertCircle, ShoppingBag, ArrowRight, Lock, KeyRound, Check, Send, User, Home, MapPin, Store, Building2, Phone, ShieldAlert, ShieldCheck, Info } from 'lucide-react';

const OrderTracking = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState(searchParams.get('trk') || '');
  const [order, setOrder] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Delivery OTP Modal State
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [cashCollected, setCashCollected] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch Role-Specific Orders Automatically
  const fetchRoleData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'delivery') {
        const { data } = await API.get('/delivery/orders');
        setDeliveryOrders(data.data || []);
      } else if (user.role === 'seller') {
        const { data } = await API.get('/sellers/orders');
        setSellerOrders(data.data || []);
      } else {
        const { data } = await API.get('/orders/my-orders');
        setCustomerOrders(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching role order tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleData();
  }, [user]);

  // If a tracking query parameter was passed in URL, auto-track it
  useEffect(() => {
    const queryTrk = searchParams.get('trk');
    if (queryTrk) {
      setIdentifier(queryTrk);
      trackByIdentifier(queryTrk);
    }
  }, [searchParams]);

  const trackByIdentifier = async (trackCode) => {
    setError('');
    setOrder(null);
    const cleanCode = (trackCode || '').trim();
    if (!cleanCode) return;

    // Check in currently loaded lists
    const allKnown = [...customerOrders, ...sellerOrders, ...deliveryOrders];
    const matched = allKnown.find((o) => o.trackingNumber === cleanCode || o._id === cleanCode);
    if (matched) setOrder(matched);

    setLoading(true);
    try {
      const { data } = await API.get(`/orders/track/${cleanCode}`);
      setOrder(data.data);
    } catch (err) {
      if (!matched) {
        setError(err.response?.data?.message || `No package found matching tracking ID: ${cleanCode}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    trackByIdentifier(identifier);
  };

  // Seller Action: Advance Order Stage
  const handleSellerUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/sellers/orders/${orderId}/status`, { orderStatus: newStatus });
      setActionMessage(
        newStatus === 'Dispatched'
          ? 'Order packed at your outlet! Marked as Dispatched.'
          : 'Order handed over to courier for customer doorstep delivery!'
      );
      setTimeout(() => setActionMessage(''), 4000);
      setSellerOrders(sellerOrders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Delivery Action: Trigger OTP
  const handleDeliveryTriggerOtp = async (ord) => {
    setSelectedDeliveryOrder(ord);
    setOtpInput('');
    setModalError('');
    try {
      await API.post(`/delivery/orders/${ord._id}/generate-otp`);
      setActionMessage('6-Digit Doorstep OTP dispatched to customer tracking screen!');
      setTimeout(() => setActionMessage(''), 5000);
      fetchRoleData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to generate OTP');
    }
  };

  // Delivery Action: Verify OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpInput.trim() || otpInput.length < 6) {
      return setModalError('Please enter the full 6-digit OTP provided by the customer at doorstep');
    }

    const isCod = selectedDeliveryOrder?.paymentMethod === 'Cash on Delivery' || !selectedDeliveryOrder?.isPaid;
    if (isCod && !cashCollected) {
      return setModalError(`Please collect cash payment of $${selectedDeliveryOrder?.totalPrice?.toFixed(2)} and confirm by checking the box below before verifying OTP.`);
    }

    setVerifyingOtp(true);
    setModalError('');
    try {
      await API.post(`/delivery/orders/${selectedDeliveryOrder._id}/verify-otp`, {
        otp: otpInput.trim(),
      });
      setActionMessage(`Package ${selectedDeliveryOrder.trackingNumber} successfully verified & DELIVERED to doorstep!`);
      setTimeout(() => setActionMessage(''), 5000);
      setSelectedDeliveryOrder(null);
      setCashCollected(false);
      fetchRoleData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Invalid 6-digit OTP code entered. Please ask customer to check their screen.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Processing': return 1;
      case 'Dispatched': return 2;
      case 'In Transit': return 3;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  const activeStep = order ? getStatusStep(order.orderStatus) : 1;
  const isCustomerView = !user || user.role === 'user';
  const isSellerView = user?.role === 'seller';
  const isDeliveryView = user?.role === 'delivery';

  // Check if current user is the customer owner
  const isOwnerOfOrder = user && order?.user && (order.user._id === user.id || order.user._id === user._id || user.role === 'user');
  const isDispatched = order && ['Dispatched', 'In Transit', 'Out for Delivery'].includes(order.orderStatus);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 animate-fadeIn">
      
      {/* Dynamic Role-Based Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
          <Package className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100">
          {isDeliveryView && 'Delivery Agent • Outlet Pickup & Doorstep Handover'}
          {isSellerView && 'Merchant Dashboard • Outlet Packing & Courier Dispatch'}
          {user?.role === 'admin' && 'Enterprise Platform • Global Outlet & Doorstep Logistics'}
          {isCustomerView && 'Live Doorstep Order Tracking'}
        </h1>
        <p className="text-xs text-slate-400">
          {isDeliveryView && 'Pick up packages from merchant outlets and verify customer 6-digit OTP at doorstep'}
          {isSellerView && 'Manage incoming customer orders, pack items at your outlet, and hand over to couriers'}
          {isCustomerView && 'Track your package progress live from order confirmation to your doorstep handover with OTP'}
        </p>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Universal Search Bar */}
      <form onSubmit={handleTrackSubmit} className="max-w-xl mx-auto flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter Tracking ID (e.g. TRK-...)"
            className="w-full bg-slate-900 text-sm text-slate-100 placeholder-slate-500 pl-10 pr-4 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary py-3 px-6 text-sm font-semibold">
          {loading ? 'Searching...' : 'Track Package'}
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* 1. VISUAL STEPPER TIMELINE & DETAILS */}
      {order && (
        <div className="glass-card rounded-3xl p-8 space-y-8 animate-fadeIn border border-indigo-500/30 bg-indigo-950/20 shadow-2xl shadow-indigo-500/10">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Package Tracking ID</div>
              <div className="text-lg font-mono font-bold text-indigo-400">{order.trackingNumber}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Current Status</div>
              <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30 uppercase">
                {order.orderStatus}
              </div>
            </div>
          </div>

          {/* DYNAMIC ROLE & STATUS-AWARE OTP DISPLAY */}
          {order.orderStatus === 'Delivered' ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Doorstep Handover Verified with 6-Digit OTP & Successfully Delivered!</span>
            </div>
          ) : isDeliveryView ? (
            /* DELIVERY AGENT VIEW: Never shows the OTP, only verification instructions */
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Doorstep Handover OTP Required</span>
                </div>
                <p className="text-xs text-slate-300">
                  Ask the customer to show their secret 6-digit OTP from their screen upon arrival. Enter the code in your Delivery Portal to finalize package delivery.
                </p>
              </div>
              <div className="px-4 py-2 bg-slate-900 rounded-xl border border-amber-500/30 text-amber-400 text-xs font-semibold shrink-0">
                🔒 OTP Held Securely by Customer
              </div>
            </div>
          ) : isCustomerView && isDispatched && order.deliveryOtp ? (
            /* CUSTOMER VIEW (DISPATCHED/IN TRANSIT): Shows active 6-digit OTP */
            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <KeyRound className="w-4 h-4" />
                  <span>Your Secure Doorstep Delivery OTP</span>
                </div>
                <p className="text-xs text-slate-300">
                  Share this 6-digit code with your courier delivery partner upon arrival at your doorstep to verify and receive your parcel:
                </p>
              </div>

              <div className="font-mono text-2xl font-extrabold tracking-widest text-white bg-slate-900 px-5 py-2.5 rounded-xl border border-indigo-500/40 text-center shadow-lg shadow-indigo-500/20">
                {order.deliveryOtp}
              </div>
            </div>
          ) : isCustomerView && order.orderStatus === 'Processing' ? (
            /* CUSTOMER VIEW (STILL PROCESSING): Explains OTP activation */
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 text-slate-300 text-xs">
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                Order is confirmed and being packed at the merchant outlet. Your <strong className="text-indigo-300">Doorstep Delivery OTP</strong> will activate and display here once the package is dispatched to the courier.
              </span>
            </div>
          ) : null}

          {/* Progress Tracker Stepper */}
          <div className="grid grid-cols-4 gap-2 text-center relative">
            <div className={`space-y-2 ${activeStep >= 1 ? 'text-indigo-400' : 'text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm ${activeStep >= 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'bg-slate-800'}`}>
                1
              </div>
              <div className="text-xs font-semibold">{isSellerView ? 'Order Received at Outlet' : 'Order Confirmed'}</div>
            </div>

            <div className={`space-y-2 ${activeStep >= 2 ? 'text-indigo-400' : 'text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm ${activeStep >= 2 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'bg-slate-800'}`}>
                2
              </div>
              <div className="text-xs font-semibold">{isSellerView ? 'Packed at Outlet' : 'Dispatched'}</div>
            </div>

            <div className={`space-y-2 ${activeStep >= 3 ? 'text-indigo-400' : 'text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm ${activeStep >= 3 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'bg-slate-800'}`}>
                3
              </div>
              <div className="text-xs font-semibold">In Transit to Doorstep</div>
            </div>

            <div className={`space-y-2 ${activeStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm ${activeStep >= 4 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-slate-800'}`}>
                4
              </div>
              <div className="text-xs font-semibold">Delivered at Doorstep</div>
            </div>
          </div>

          {/* ROLE-AWARE DETAILS CARD */}
          <div className={`grid gap-4 text-xs pt-4 border-t border-slate-800 ${isCustomerView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            
            {/* OUTLET DETAILS: DISPLAYED ONLY FOR SELLERS, COURIERS & ADMIN (NOT CUSTOMERS) */}
            {!isCustomerView && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isSellerView ? 'Your Outlet / Warehouse Details' : 'Pickup Merchant Outlet Details'}
                  </span>
                </div>
                <div className="text-slate-100 font-semibold">
                  {order.seller?.storeName || (order.seller?.name && order.seller?.name !== 'seller' ? order.seller?.name : 'Apex Tech Hyderabad (Regional Outlet)')}
                </div>
                <div className="text-slate-300 leading-relaxed">
                  Warehouse Hub: <span className="text-white font-medium">Cherlapally Industrial Area</span>, Ghatkesar Mandal, Medchal-Malkajgiri District, Telangana
                </div>
                <div className="text-emerald-400 font-mono flex items-center gap-1 text-[11px] pt-1 border-t border-slate-800/60">
                  <Phone className="w-3 h-3" />
                  <span>Outlet Contact: {order.seller?.phone || '+91 98765 11112'}</span>
                </div>
              </div>
            )}

            {/* CUSTOMER DOORSTEP DESTINATION (DISPLAYED FOR ALL ROLES) */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-indigo-400 font-bold flex items-center gap-1.5 text-xs">
                <Home className="w-4 h-4 text-indigo-400" />
                <span>
                  {isCustomerView ? 'Your Doorstep Delivery Address' : 'Customer Doorstep Destination'}
                </span>
              </div>
              <div className="text-slate-100 font-semibold">
                {order.shippingAddress?.fullName || 'Customer'} • <span className="font-mono text-emerald-400">{order.shippingAddress?.phone || '+91 98765 99999'}</span>
              </div>
              <div className="text-slate-300 leading-relaxed">
                {order.shippingAddress?.houseNo && `${order.shippingAddress.houseNo}, `}
                {order.shippingAddress?.street && `${order.shippingAddress.street}, `}
                <span className="font-bold text-white">{order.shippingAddress?.villageOrLocality || 'Rampur Village'}</span>, {order.shippingAddress?.mandalOrTehsil || 'Ghatkesar Mandal'}, {order.shippingAddress?.district || 'Medchal-Malkajgiri'}, {order.shippingAddress?.state || 'Telangana'} - <span className="font-mono font-bold text-indigo-300">{order.shippingAddress?.pincode || '501301'}</span>
              </div>
              {order.shippingAddress?.landmark && (
                <div className="text-[11px] text-slate-400 italic">
                  Nearby Landmark: {order.shippingAddress.landmark}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 2. ROLE ADAPTATION: DELIVERY AGENT WORKFLOW */}
      {isDeliveryView && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" /> Assigned Delivery Queue ({deliveryOrders.length} Packages)
            </h2>
            <span className="text-xs text-slate-400">Pick up from outlet & verify customer 6-digit OTP at doorstep</span>
          </div>

          <div className="glass-card rounded-3xl p-6 overflow-x-auto">
            {deliveryOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No delivery packages in queue.</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-slate-400 uppercase bg-slate-900/60">
                  <tr>
                    <th className="p-3">Tracking Code</th>
                    <th className="p-3">Pickup Outlet</th>
                    <th className="p-3">Customer Doorstep</th>
                    <th className="p-3">Package Items</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Doorstep Handover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {deliveryOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono font-bold text-indigo-400">{ord.trackingNumber}</td>
                      <td className="p-3">
                        <div className="font-semibold text-emerald-400 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5" />
                          {ord.seller?.storeName || (ord.seller?.name && ord.seller?.name !== 'seller' ? ord.seller?.name : 'Apex Tech Hyderabad Outlet')}
                        </div>
                        <div className="text-[11px] text-slate-400">Cherlapally Hub, Ghatkesar</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-300 truncate max-w-[220px]">
                          {ord.shippingAddress?.villageOrLocality}, {ord.shippingAddress?.mandalOrTehsil} ({ord.shippingAddress?.phone})
                        </div>
                      </td>
                      <td className="p-3">
                        {ord.orderItems?.map((item, i) => (
                          <div key={i} className="truncate max-w-[150px] text-slate-200">
                            • {item.name} <span className="text-slate-400">(x{item.quantity})</span>
                          </div>
                        ))}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap inline-block ${
                          ord.isDelivered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          ord.orderStatus === 'Out for Delivery' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {ord.isDelivered ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                            <Check className="w-3.5 h-3.5" /> Delivered at Doorstep
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeliveryTriggerOtp(ord)}
                            className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 font-semibold cursor-pointer"
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
        </div>
      )}

      {/* 3. ROLE ADAPTATION: SELLER WORKFLOW */}
      {isSellerView && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" /> Outlet Order Fulfillment & Dispatch ({sellerOrders.length})
            </h2>
            <span className="text-xs text-slate-400">Pack items at your outlet and dispatch for customer doorstep handover</span>
          </div>

          <div className="glass-card rounded-3xl p-6 overflow-x-auto">
            {sellerOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No customer orders received yet.</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-slate-400 uppercase bg-slate-900/60">
                  <tr>
                    <th className="p-3">Tracking Code</th>
                    <th className="p-3">Customer Doorstep</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Outlet Stage</th>
                    <th className="p-3">Fulfillment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sellerOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-900/30">
                      <td className="p-3 font-mono font-bold text-indigo-400">{ord.trackingNumber}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}</div>
                        <div className="text-[11px] text-slate-400">{ord.shippingAddress?.villageOrLocality}, {ord.shippingAddress?.mandalOrTehsil}</div>
                      </td>
                      <td className="p-3">
                        {ord.orderItems?.map((item, idx) => (
                          <div key={idx} className="truncate max-w-[180px] text-slate-200">
                            • {item.name} <span className="text-slate-400">(x{item.quantity})</span>
                          </div>
                        ))}
                      </td>
                      <td className="p-3 font-bold text-white">${ord.totalPrice?.toFixed(2)}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/20 text-indigo-300">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {ord.orderStatus === 'Processing' && (
                          <button
                            onClick={() => handleSellerUpdateStatus(ord._id, 'Dispatched')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Pack at Outlet
                          </button>
                        )}
                        {ord.orderStatus === 'Dispatched' && (
                          <button
                            onClick={() => handleSellerUpdateStatus(ord._id, 'In Transit')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
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

      {/* 4. ROLE ADAPTATION: CUSTOMER PLACED ORDERS */}
      {isCustomerView && (
        <div className="space-y-4">
          {user ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-400" /> My Placed Orders ({customerOrders.length})
                </h2>
                <span className="text-xs text-slate-400">Click any order to view its live shipment timeline & OTP</span>
              </div>

              {customerOrders.length === 0 ? (
                <div className="glass-card rounded-3xl p-10 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">You have no active orders under this account.</p>
                  <Link to="/products" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord._id || ord.trackingNumber}
                      onClick={() => {
                        setIdentifier(ord.trackingNumber);
                        trackByIdentifier(ord.trackingNumber);
                      }}
                      className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-indigo-400 group-hover:text-indigo-300">
                            {ord.trackingNumber}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {new Date(ord.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">
                          {ord.orderItems?.length || 1} Item(s) • Total Paid: <span className="font-bold text-white">${ord.totalPrice?.toFixed(2) || '299.99'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          ord.orderStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                          ord.orderStatus === 'In Transit' ? 'bg-indigo-500/20 text-indigo-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {ord.orderStatus || 'Processing'}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                          <span>View Timeline & OTP</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="glass-card rounded-3xl p-8 text-center space-y-3 border border-slate-800">
              <Lock className="w-8 h-8 text-indigo-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-100">Sign In to View Your Placed Orders</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Please login with your customer account to view your past orders, or enter your Tracking Number above to track a specific delivery.
              </p>
              <div className="pt-2">
                <Link to="/login" className="btn-primary text-xs py-2.5 px-6 inline-block">
                  Sign In to My Account
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DELIVERY OTP VERIFICATION MODAL */}
      {selectedDeliveryOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-3xl space-y-5 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Verify Customer Doorstep OTP</h3>
              <p className="text-xs text-slate-400">
                Tracking: <span className="font-mono font-bold text-indigo-400">{selectedDeliveryOrder.trackingNumber}</span>
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-left text-xs text-slate-300 space-y-1">
                <div><span className="text-slate-400">Recipient:</span> <span className="font-bold text-white">{selectedDeliveryOrder.shippingAddress?.fullName || 'Customer'}</span></div>
                <div><span className="text-slate-400">Doorstep:</span> {selectedDeliveryOrder.shippingAddress?.villageOrLocality}, {selectedDeliveryOrder.shippingAddress?.mandalOrTehsil} ({selectedDeliveryOrder.shippingAddress?.phone})</div>
                {selectedDeliveryOrder.shippingAddress?.landmark && (
                  <div className="text-[11px] text-slate-400 italic">Landmark: {selectedDeliveryOrder.shippingAddress.landmark}</div>
                )}
              </div>

              {/* COD Payment Collection Alert */}
              {(selectedDeliveryOrder.paymentMethod === 'Cash on Delivery' || !selectedDeliveryOrder.isPaid) && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-2 text-left animate-fadeIn">
                  <div className="flex justify-between items-center font-bold text-amber-300">
                    <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-amber-400" /> Cash on Delivery (COD)</span>
                    <span className="text-sm font-extrabold text-white">${selectedDeliveryOrder.totalPrice?.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    ⚠️ <strong>Payment Due:</strong> Please collect <strong>${selectedDeliveryOrder.totalPrice?.toFixed(2)}</strong> cash payment from the customer before completing delivery.
                  </p>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none text-slate-200 font-semibold text-xs bg-slate-950/60 p-2 rounded-xl border border-amber-500/20">
                    <input
                      type="checkbox"
                      checked={cashCollected}
                      onChange={(e) => setCashCollected(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <span>I confirm cash payment of ${selectedDeliveryOrder.totalPrice?.toFixed(2)} is collected</span>
                  </label>
                </div>
              )}
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1 text-center">
                  Enter 6-Digit OTP provided by customer at doorstep:
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
                  onClick={() => setSelectedDeliveryOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp || otpInput.length < 6}
                  className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {verifyingOtp ? 'Verifying...' : 'Confirm Doorstep Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderTracking;
