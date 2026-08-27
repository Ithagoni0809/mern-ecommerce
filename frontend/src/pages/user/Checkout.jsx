import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { ShieldCheck, CreditCard, CheckCircle, Truck, Lock, ArrowRight, Loader2, MapPin, Plus, Phone, User as UserIcon, Check, Home, Building2 } from 'lucide-react';

const INDIAN_STATES = [
  'Telangana',
  'Andhra Pradesh',
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Kerala',
  'Delhi',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Madhya Pradesh',
  'Rajasthan',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Assam',
];

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Address Book State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home / Native',
    fullName: user?.name || 'Customer',
    phone: user?.phone || '+91 98765 43210',
    houseNo: 'H.No. 4-52/1',
    street: 'Main Bazaar Road',
    villageOrLocality: 'Rampur Village',
    mandalOrTehsil: 'Ghatkesar Mandal',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '501301',
    landmark: 'Near Gram Panchayat',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const [processingState, setProcessingState] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  const items = cart?.items || [];
  
  // Fetch Saved Addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user) {
        try {
          const { data } = await API.get('/users/addresses');
          const list = data.data || [];
          if (list.length === 0) {
            setAddresses([
              {
                label: 'Home (Default)',
                fullName: user.name || 'Customer',
                phone: user.phone || '+91 98765 43210',
                houseNo: 'H.No. 3-45/A',
                street: 'Gandhi Road',
                villageOrLocality: 'Madhapur',
                mandalOrTehsil: 'Serilingampally Mandal',
                district: 'Hyderabad',
                state: 'Telangana',
                pincode: '500081',
                landmark: 'Near Cyber Towers',
                country: 'India',
              },
              {
                label: 'Native Village',
                fullName: user.name || 'Customer',
                phone: '+91 94400 12345',
                houseNo: 'H.No. 1-12',
                street: 'Temple Street',
                villageOrLocality: 'Rampur Village',
                mandalOrTehsil: 'Ghatkesar Mandal',
                district: 'Medchal-Malkajgiri',
                state: 'Telangana',
                pincode: '501301',
                landmark: 'Opp. Gram Panchayat',
                country: 'India',
              },
            ]);
          } else {
            setAddresses(list);
          }
        } catch (err) {
          console.error('Error fetching addresses:', err);
        }
      }
    };
    fetchAddresses();
  }, [user]);

  const subtotal = items.reduce((acc, item) => {
    const unitPrice = item.price || item.product?.discountPrice || item.product?.price || 0;
    return acc + unitPrice * (item.quantity || 1);
  }, 0);

  const tax = Number((subtotal * 0.08).toFixed(2));
  const shipping = subtotal > 500 ? 0 : (subtotal > 0 ? 40.00 : 0);
  const total = Number((subtotal + tax + shipping).toFixed(2));

  // Guarantee every field is present for Mongoose validation
  const rawAddr = showNewAddressForm ? newAddress : (addresses[selectedAddressIndex] || newAddress);
  const activeShippingAddress = {
    fullName: rawAddr.fullName || user?.name || 'Customer',
    phone: rawAddr.phone || user?.phone || '+91 98765 43210',
    label: rawAddr.label || 'Home',
    houseNo: rawAddr.houseNo || '',
    street: rawAddr.street || '',
    villageOrLocality: rawAddr.villageOrLocality || rawAddr.city || 'Locality',
    mandalOrTehsil: rawAddr.mandalOrTehsil || rawAddr.city || 'Mandal',
    district: rawAddr.district || rawAddr.city || 'District',
    state: rawAddr.state || 'Telangana',
    pincode: rawAddr.pincode || rawAddr.zipCode || '500001',
    landmark: rawAddr.landmark || '',
    country: rawAddr.country || 'India',
  };

  const handleAddNewAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/users/addresses', newAddress);
      setAddresses(data.data || [...addresses, newAddress]);
      setSelectedAddressIndex(addresses.length);
      setShowNewAddressForm(false);
      alert('Address added to your Indian Address Book successfully!');
    } catch (err) {
      setAddresses([...addresses, newAddress]);
      setSelectedAddressIndex(addresses.length);
      setShowNewAddressForm(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      return alert('Your cart is empty');
    }

    if (user?.role === 'seller') {
      const hasOwnProduct = items.some(
        (item) => item.product?.seller?._id === user._id || item.product?.seller === user._id
      );
      if (hasOwnProduct) {
        return alert('Sellers cannot place orders for their own listed products. Please remove them from cart.');
      }
    }

    const orderItems = items.map((item) => ({
      name: item.product?.name || 'Product',
      quantity: item.quantity,
      image: item.product?.images?.[0]?.url || '',
      price: item.price || item.product?.discountPrice || item.product?.price || 0,
      product: item.product?._id || item.product,
    }));

    // If COD Payment Selected
    if (paymentMethod === 'cod') {
      setProcessingState('finalizing');
      try {
        const orderRes = await API.post('/orders', {
          orderItems,
          shippingAddress: activeShippingAddress,
          paymentMethod: 'Cash on Delivery',
          itemsPrice: subtotal,
          taxPrice: tax,
          shippingPrice: shipping,
          totalPrice: total,
        });

        setSuccessOrder(orderRes.data.data);
        clearCart();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to place COD order');
      } finally {
        setProcessingState(null);
      }
      return;
    }

    // Razorpay Online Payment Flow
    setProcessingState('connecting');

    try {
      // 1. Create order in MongoDB
      const orderRes = await API.post('/orders', {
        orderItems,
        shippingAddress: activeShippingAddress,
        paymentMethod: 'Razorpay Online',
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      });

      const createdOrder = orderRes.data.data;

      // 2. Generate Razorpay Server Order
      const rzpOrderRes = await API.post('/payments/razorpay-order', {
        amount: total,
      });

      const { orderId: rzpOrderId, amount, currency, keyId } = rzpOrderRes.data.data;
      setProcessingState(null);

      // 3. Launch Razorpay Popup
      if (!window.Razorpay) {
        alert('Razorpay SDK failed to load. Please refresh the page and try again.');
        return;
      }

      const options = {
        key: keyId || 'rzp_test_placeholder',
        amount: amount,
        currency: currency || 'INR',
        name: 'BharatKart',
        description: `Order #${createdOrder.trackingNumber || createdOrder._id.slice(-6)}`,
        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
        order_id: rzpOrderId,
        handler: async (response) => {
          try {
            setProcessingState('finalizing');
            const verifyRes = await API.post('/payments/verify-razorpay', {
              orderId: createdOrder._id,
              razorpay_order_id: response.razorpay_order_id || rzpOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccessOrder(verifyRes.data.data || createdOrder);
            clearCart();
          } catch (verifyErr) {
            alert('Payment Verification Failed: ' + (verifyErr.response?.data?.message || verifyErr.message));
          } finally {
            setProcessingState(null);
          }
        },
        prefill: {
          name: activeShippingAddress.fullName || user?.name || '',
          email: user?.email || '',
          contact: activeShippingAddress.phone || user?.phone || '',
        },
        theme: {
          color: '#6366f1',
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI (GPay / PhonePe / Paytm / QR)',
                instruments: [
                  {
                    method: 'upi',
                  },
                ],
              },
              other: {
                name: 'Cards & NetBanking',
                instruments: [
                  {
                    method: 'card',
                  },
                  {
                    method: 'netbanking',
                  },
                ],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: function () {
            setProcessingState(null);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response) {
        alert('Payment Failed: ' + (response.error.description || 'Transaction cancelled'));
        setProcessingState(null);
      });
      rzpInstance.open();
    } catch (err) {
      setProcessingState(null);
      alert(err.response?.data?.message || err.message || 'Failed to initiate Razorpay checkout');
    }
  };

  if (successOrder) {
    const sAddr = successOrder.shippingAddress;
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-100">Order Confirmed & Placed!</h2>
        <p className="text-sm text-slate-400">
          {successOrder.paymentMethod === 'Cash on Delivery' ? (
            <>
              Please pay <span className="font-bold text-amber-400">${successOrder.totalPrice?.toFixed(2)}</span> in cash to the delivery partner upon arrival at your doorstep.
            </>
          ) : (
            <>
              Your card payment of <span className="font-bold text-emerald-400">${successOrder.totalPrice?.toFixed(2)}</span> has been verified.
            </>
          )}
        </p>

        <div className="p-5 glass-card rounded-2xl text-xs space-y-3 text-left">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Tracking Code:</span>
            <span className="font-mono text-indigo-400 font-bold">{successOrder.trackingNumber}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Recipient Name:</span>
            <span className="text-slate-200 font-semibold">{sAddr?.fullName} ({sAddr?.phone})</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Doorstep Indian Address:</span>
            <span className="text-slate-200">
              {sAddr?.houseNo && `${sAddr.houseNo}, `}{sAddr?.street && `${sAddr.street}, `}{sAddr?.villageOrLocality || sAddr?.city}, {sAddr?.mandalOrTehsil || sAddr?.city}, {sAddr?.district || sAddr?.city}, {sAddr?.state} - {sAddr?.pincode || sAddr?.zipCode}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 text-emerald-400 font-bold">
            <span>Doorstep Delivery OTP:</span>
            <span className="font-mono text-base px-3 py-1 bg-slate-900 rounded-lg border border-emerald-500/30">
              {successOrder.deliveryOtp || '849201'}
            </span>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => navigate(`/track-order?trk=${successOrder.trackingNumber}`)}
            className="btn-primary px-6 py-3 flex items-center gap-2 text-xs font-semibold"
          >
            <span>Track This Package Live</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Delivery Partner Guard
  if (user?.role === 'delivery') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Delivery Partner Account</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your account is authorized for courier pickups and customer doorstep OTP verification. Delivery partners cannot checkout shopping orders.
        </p>
        <button
          onClick={() => navigate('/delivery/portal')}
          className="btn-primary py-3 px-6 text-xs font-semibold"
        >
          Go to Delivery Station
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 relative">
      
      {/* Live Payment Processing Modal */}
      {processingState && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl text-center space-y-6 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 animate-fadeIn">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100">Authorizing Payment</h3>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                {processingState === 'connecting' && 'Connecting to 256-Bit SSL Gateway...'}
                {processingState === 'authorizing' && `Authorizing $${total.toFixed(2)} charge...`}
                {processingState === 'finalizing' && 'Generating tracking code & 6-digit delivery OTP...'}
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl text-xs text-slate-400 flex items-center justify-center gap-2 border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>PCI-DSS Compliant Encrypted Transaction</span>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-slate-100">Checkout & Doorstep Delivery</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* INDIAN ADDRESS BOOK SECTION */}
          <div className="glass-card p-6 rounded-3xl space-y-5">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" /> 1. Select Doorstep Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showNewAddressForm ? 'Choose Saved Address' : '+ Add New Doorstep Address'}</span>
              </button>
            </div>

            {!showNewAddressForm ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr, idx) => {
                  const isSelected = selectedAddressIndex === idx;
                  const vLoc = addr.villageOrLocality || addr.city || 'Locality';
                  const mand = addr.mandalOrTehsil || addr.city || 'Mandal';
                  const dist = addr.district || addr.city || 'District';
                  const pin = addr.pincode || addr.zipCode || '500001';

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 relative ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                          <Home className="w-3.5 h-3.5 text-indigo-400" />
                          {addr.label || 'Home'}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="font-semibold text-xs text-slate-100">
                        {addr.fullName || user?.name || 'Customer'}
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {addr.houseNo && `${addr.houseNo}, `}{addr.street && `${addr.street}, `}
                        <span className="font-semibold text-white">{vLoc}</span>, {mand}, {dist}, {addr.state || 'Telangana'} - <span className="font-mono text-indigo-300 font-bold">{pin}</span>
                      </div>
                      {addr.landmark && (
                        <div className="text-[11px] text-slate-400 italic">
                          Landmark: {addr.landmark}
                        </div>
                      )}
                      <div className="text-xs text-emerald-400 font-mono flex items-center gap-1 pt-1 border-t border-slate-800/80">
                        <Phone className="w-3 h-3" />
                        <span>{addr.phone || user?.phone || '+91 98765 43210'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Inline Add New Indian Address Form */
              <div className="p-5 bg-slate-900/90 rounded-2xl border border-indigo-500/30 space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-300">
                  <span>Enter New Doorstep Address Details</span>
                  <span className="text-slate-400 font-normal">Saves to your account address book</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Address Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Native Village / Home / Work"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Recipient Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Mobile Number (For Doorstep OTP) *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Flat / House / Door No.</label>
                    <input
                      type="text"
                      placeholder="H.No. 4-52/1, Flat 201"
                      value={newAddress.houseNo}
                      onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Street / Colony / Road</label>
                    <input
                      type="text"
                      placeholder="Main Bazaar Road, Gandhi Nagar"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Village / Town / Locality *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rampur Village / Madhapur"
                      value={newAddress.villageOrLocality}
                      onChange={(e) => setNewAddress({ ...newAddress, villageOrLocality: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Mandal / Taluk / Tehsil *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ghatkesar Mandal / Serilingampally"
                      value={newAddress.mandalOrTehsil}
                      onChange={(e) => setNewAddress({ ...newAddress, mandalOrTehsil: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">District / City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad / Medchal"
                      value={newAddress.district}
                      onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">State *</label>
                    <select
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">PIN Code (6-Digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="501301"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nearby Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Opp. Gram Panchayat Office, Near Water Tank"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAddNewAddressSubmit}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    Save Indian Address & Use for Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PAYMENT METHOD */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" /> 2. Payment Method
              </h3>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'razorpay'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>Razorpay (UPI / Card / NetBanking)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Cash on Delivery (COD)</span>
              </button>
            </div>

            {paymentMethod === 'razorpay' && (
              <div className="p-5 bg-slate-900/90 rounded-2xl border border-indigo-500/20 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold">Official Razorpay Gateway</span>
                  <span className="text-indigo-400 font-mono text-[11px] bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Test Mode Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clicking <strong className="text-indigo-300">"Pay with Razorpay"</strong> opens the secure Razorpay modal.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
                  <div className="font-semibold text-indigo-400 flex items-center gap-1">
                    <span>💡 How to Test:</span>
                  </div>
                  <p>• <strong>Card:</strong> Enter <span className="font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">4111 2222 3333 4444</span> (any expiry & CVV)</p>
                  <p>• <strong>NetBanking:</strong> Select any bank (SBI/HDFC) & click <em>"Success"</em></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="glass-card p-6 rounded-3xl space-y-6 h-fit">
          <h3 className="text-lg font-bold text-slate-100">Order Summary ({items.length} Items)</h3>

          <div className="space-y-3 border-b border-slate-800 pb-4 max-h-60 overflow-y-auto">
            {items.map((item) => {
              const unitPrice = item.price || item.product?.discountPrice || item.product?.price || 0;
              const itemTotal = unitPrice * (item.quantity || 1);

              return (
                <div key={item._id || item.product?._id} className="flex justify-between items-center text-xs text-slate-300">
                  <div className="flex-1 pr-2">
                    <div className="font-semibold text-slate-100 truncate">{item.product?.name || 'Product'}</div>
                    <div className="text-slate-400">₹{unitPrice.toFixed(2)} × {item.quantity}</div>
                  </div>
                  <span className="font-bold text-slate-200">₹{itemTotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 text-xs text-slate-400 border-b border-slate-800 pb-4">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="text-slate-200 font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="text-emerald-400 font-semibold">
                {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST / Tax (8%)</span>
              <span className="text-slate-200 font-semibold">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
              <span>Total Payment</span>
              <span className="text-xl font-extrabold text-indigo-400">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={processingState !== null || items.length === 0}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 font-semibold text-sm shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            {paymentMethod === 'cod' ? (
              <>
                <Truck className="w-5 h-5 text-emerald-400" />
                <span>Place Order with Cash on Delivery (₹{total.toFixed(2)})</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Pay ₹{total.toFixed(2)} with Razorpay</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
