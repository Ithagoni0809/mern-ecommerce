import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User as UserIcon, Mail, Lock, ArrowRight, Phone, MapPin, Store, Truck, ShoppingBag, Landmark, Building2, Home, Eye, EyeOff } from 'lucide-react';

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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    houseNo: '',
    street: '',
    villageOrLocality: '',
    mandalOrTehsil: '',
    district: '',
    state: 'Telangana',
    pincode: '',
    landmark: '',
    country: 'India',
    password: '',
    role: 'user',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const isCustomer = formData.role === 'user';
  const isSeller = formData.role === 'seller';
  const isDelivery = formData.role === 'delivery';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.phone.trim()) {
      return setError('Please enter a 10-digit mobile number for OTP notifications and verification');
    }
    if (!formData.villageOrLocality.trim() || !formData.mandalOrTehsil.trim()) {
      return setError(
        isSeller
          ? 'Please enter your Outlet Area/Zone and Mandal/Taluk'
          : isDelivery
          ? 'Please enter your Operating Hub and Mandal/Taluk'
          : 'Please enter your Village/Town and Mandal/Tehsil'
      );
    }
    if (!formData.district.trim() || !formData.pincode.trim()) {
      return setError('Please enter your District and 6-digit PIN Code');
    }

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach the server. Please check your internet connection and try again.');
      } else {
        const msg = err.response?.data?.message;
        if (msg) {
          setError(msg);
        } else if (err.response?.status === 409 || err.response?.status === 400) {
          setError('An account with this email already exists. Please use a different email or sign in instead.');
        } else if (err.response?.status === 422) {
          setError('Some required fields are missing or invalid. Please fill in all required fields correctly.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again in a few moments.');
        } else {
          setError('Registration failed. Please check your details and try again.');
        }
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 animate-fadeIn">
      <div className="w-full max-w-2xl glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Dynamic Role-Based Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-indigo-500/30">
            B
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            {isCustomer && 'Create Customer Account'}
            {isSeller && 'Register Merchant Outlet'}
            {isDelivery && 'Register Delivery Partner'}
          </h2>
          <p className="text-xs text-slate-400">
            {isCustomer && 'Join BharatKart to shop products with verified doorstep delivery & OTP confirmation'}
            {isSeller && 'Register your merchant store outlet and warehouse hub to fulfill customer orders'}
            {isDelivery && 'Register as a regional courier partner to fulfill outlet pickups & doorstep deliveries'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Account Role Selector */}
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">Select Your Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'user' })}
                className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isCustomer
                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-md shadow-indigo-500/20'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'seller' })}
                className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSeller
                    ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-md shadow-emerald-500/20'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>Merchant Outlet</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'delivery' })}
                className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDelivery
                    ? 'border-amber-500 bg-amber-500/20 text-white shadow-md shadow-amber-500/20'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Delivery Partner</span>
              </button>
            </div>
          </div>

          {/* Full Name, Email, Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                {isSeller ? 'Merchant / Owner Name' : isDelivery ? 'Agent Full Name' : 'Customer Full Name'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isSeller ? 'e.g. Apex Tech Store' : 'e.g. Ramesh Kumar'}
                  className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={isSeller ? 'seller@example.com' : isDelivery ? 'delivery@example.com' : 'user@example.com'}
                  className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                {isCustomer ? 'Mobile Number (For Doorstep OTP)' : isSeller ? 'Outlet Contact Phone' : 'Agent Contact Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* DYNAMIC ROLE-BASED ADDRESS SECTION */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="text-xs font-bold flex items-center gap-1.5">
              {isCustomer && (
                <>
                  <Home className="w-4 h-4 text-indigo-400" />
                  <span className="text-indigo-300">📍 Enter Your Doorstep Delivery Details</span>
                </>
              )}
              {isSeller && (
                <>
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">🏪 Enter Your Merchant Outlet & Warehouse Location</span>
                </>
              )}
              {isDelivery && (
                <>
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300">🚚 Enter Your Operating Hub & Station Details</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-400 mb-1">
                  {isSeller ? 'Outlet / Plot / Gala / Unit No.' : isDelivery ? 'Station / Hub Unit No.' : 'Flat / House / Door No.'}
                </label>
                <input
                  type="text"
                  value={formData.houseNo}
                  onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                  placeholder={isSeller ? 'e.g. Plot 12, Gala 45, Phase II' : isDelivery ? 'e.g. Hub Station 3, Unit 10' : 'e.g. H.No. 4-52/1, Flat 302'}
                  className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">
                  {isSeller ? 'Industrial Road / Main Street' : isDelivery ? 'Station Sector / Road' : 'Street / Colony / Road'}
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder={isSeller ? 'e.g. Industrial Area Road' : isDelivery ? 'e.g. Outer Ring Road' : 'e.g. Main Bazaar Road, Gandhi Nagar'}
                  className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-400 mb-1">
                  {isSeller ? 'Outlet Area / Industrial Zone *' : isDelivery ? 'Operating Hub / Area *' : 'Village / Town / Locality *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.villageOrLocality}
                  onChange={(e) => setFormData({ ...formData, villageOrLocality: e.target.value })}
                  placeholder={isSeller ? 'e.g. Cherlapally Industrial Area' : isDelivery ? 'e.g. Gachibowli Hub' : 'e.g. Rampur Village / Madhapur'}
                  className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">
                  {isSeller ? 'Mandal / Taluk / Zone *' : isDelivery ? 'Mandal / Taluk *' : 'Mandal / Taluk / Tehsil *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.mandalOrTehsil}
                  onChange={(e) => setFormData({ ...formData, mandalOrTehsil: e.target.value })}
                  placeholder={isSeller ? 'e.g. Ghatkesar Mandal' : isDelivery ? 'e.g. Serilingampally' : 'e.g. Ghatkesar Mandal / Serilingampally'}
                  className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-400 mb-1">District / City *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Hyderabad / Medchal"
                  className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">State *</label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-1">PIN Code (6-Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 501301"
                  className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">
                {isSeller ? 'Nearby Landmark / Landmark Gate (Optional)' : isDelivery ? 'Station Landmark (Optional)' : 'Nearby Landmark (Optional)'}
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder={isSeller ? 'e.g. Opp. Industrial Phase II Gate' : isDelivery ? 'e.g. Near ORR Junction' : 'e.g. Near Gram Panchayat Office, Opp. Temple'}
                className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Account Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 pl-9 pr-10 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 group font-semibold shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <span>
              {loading
                ? 'Registering Account...'
                : isCustomer
                ? 'Complete Customer Registration (Save Doorstep Address)'
                : isSeller
                ? 'Register Merchant Outlet Account'
                : 'Register Delivery Partner Account'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
