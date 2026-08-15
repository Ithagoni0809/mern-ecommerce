import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { User, Phone, Mail, Lock, Home, Store, Truck, ShieldCheck, CheckCircle2, AlertCircle, Save, Building2, MapPin, Eye, EyeOff, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';

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

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storeName: '',
    houseNo: '',
    street: '',
    villageOrLocality: '',
    mandalOrTehsil: '',
    district: '',
    state: 'Telangana',
    pincode: '',
    landmark: '',
  });

  // Password Update Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email Verification Resend State
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationToast, setVerificationToast] = useState('');
  const [directVerificationUrl, setDirectVerificationUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isCustomer = !user || user.role === 'user';
  const isSeller = user?.role === 'seller';
  const isDelivery = user?.role === 'delivery';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await API.get('/users/profile');
        const u = data.data;
        const addr = u.addresses?.[0] || {};
        setFormData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          storeName: u.storeName || '',
          houseNo: addr.houseNo || '',
          street: addr.street || '',
          villageOrLocality: addr.villageOrLocality || '',
          mandalOrTehsil: addr.mandalOrTehsil || '',
          district: addr.district || '',
          state: addr.state || 'Telangana',
          pincode: addr.pincode || '',
          landmark: addr.landmark || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchUserData();
  }, [user]);

  const handleSendVerification = async () => {
    setSendingVerification(true);
    setVerificationToast('');
    setDirectVerificationUrl('');
    try {
      const { data } = await API.post('/auth/resend-verification', { email: user.email });
      setVerificationToast('Verification link sent to your email!');
      if (data.data?.verificationUrl) {
        setDirectVerificationUrl(data.data.verificationUrl);
      }
      setTimeout(() => setVerificationToast(''), 8000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send verification link');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSendingVerification(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!formData.name.trim()) {
      setSaving(false);
      return setErrorMessage('Full Name is required');
    }
    if (!formData.phone.trim()) {
      setSaving(false);
      return setErrorMessage('Mobile phone number is required');
    }

    if (newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        setSaving(false);
        return setErrorMessage('New password must be at least 6 characters long');
      }
      if (newPassword !== confirmPassword) {
        setSaving(false);
        return setErrorMessage('New password and confirmation do not match');
      }
    }

    try {
      const payload = { ...formData };
      if (newPassword.trim()) {
        payload.newPassword = newPassword.trim();
        payload.currentPassword = currentPassword.trim();
      }

      const { data } = await API.put('/users/profile', payload);
      
      // Instantly update navbar and global auth context in real time
      if (data.data) {
        updateUser(data.data);
      }

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setSuccessMessage('Your profile, password, and address details have been updated successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 h-96 glass-card rounded-3xl animate-pulse" />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mx-auto flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-indigo-500/20">
          {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h1 className="text-3xl font-bold text-slate-100">
          {isCustomer && 'My Account & Doorstep Address Settings'}
          {isSeller && 'Merchant Store & Outlet Profile'}
          {isDelivery && 'Delivery Partner Profile & Hub Settings'}
          {isAdmin && 'Platform Administrator Profile'}
        </h1>
        <p className="text-xs text-slate-400">
          Manage your personal credentials, contact phone, security password, and Indian delivery address.
        </p>
      </div>

      {/* EMAIL VERIFICATION STATUS CARD */}
      <div className={`p-5 rounded-3xl border ${
        user?.isEmailVerified
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-amber-500/10 border-amber-500/30'
      } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {user?.isEmailVerified ? (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Email Verified
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Email Not Verified
              </span>
            )}
            <span className="text-xs text-slate-300 font-mono">{user?.email}</span>
          </div>
          <p className="text-xs text-slate-400">
            {user?.isEmailVerified
              ? 'Your email address is verified. You will receive real-time order alerts and doorstep OTP updates.'
              : 'Your email address is not verified yet. Verify your email to secure your account.'}
          </p>

          {directVerificationUrl && (
            <div className="pt-2 text-xs text-slate-300">
              <span className="text-slate-400">Direct Link: </span>
              <a href={directVerificationUrl} className="text-indigo-400 hover:underline font-mono inline-flex items-center gap-1">
                <span>{directVerificationUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {!user?.isEmailVerified && (
          <button
            type="button"
            onClick={handleSendVerification}
            disabled={sendingVerification}
            className="btn-primary py-2 px-4 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {sendingVerification ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5" />
                <span>Verify Email</span>
              </>
            )}
          </button>
        )}
      </div>

      {verificationToast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{verificationToast}</span>
        </div>
      )}

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Section 1: Basic Details */}
        <div className="space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" /> 1. Personal & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">
                {isSeller ? 'Merchant Store / Owner Name *' : 'Full Name *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Mobile Phone (For Order OTP) *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Account Email Address (Immutable)</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-slate-400 text-xs cursor-not-allowed"
              />
            </div>

            {isSeller && (
              <div>
                <label className="block text-slate-400 mb-1">Merchant Store Brand Name</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="e.g. Apex Tech Hyderabad"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Indian Address Details */}
        <div className="space-y-4 text-xs pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Home className="w-4 h-4 text-indigo-400" />
            <span>
              2. {isCustomer && 'Primary Doorstep Delivery Address (Indian Format)'}
              {isSeller && 'Merchant Outlet & Regional Dispatch Hub Address'}
              {isDelivery && 'Operating Station & Transit Hub Location'}
              {isAdmin && 'Platform Headquarters Address'}
            </span>
          </h3>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  {isSeller ? 'Outlet / Plot / Gala No.' : isDelivery ? 'Station / Unit No.' : 'Flat / House / Door No.'}
                </label>
                <input
                  type="text"
                  value={formData.houseNo}
                  onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                  placeholder="e.g. H.No. 3-84/A, Flat 402"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Street / Colony / Industrial Road</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="e.g. Gram Panchayat Main Road"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  {isSeller ? 'Outlet Zone / Locality *' : 'Village / Town / Locality *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.villageOrLocality}
                  onChange={(e) => setFormData({ ...formData, villageOrLocality: e.target.value })}
                  placeholder="e.g. Rampur Village / Madhapur"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mandal / Taluk / Tehsil *</label>
                <input
                  type="text"
                  required
                  value={formData.mandalOrTehsil}
                  onChange={(e) => setFormData({ ...formData, mandalOrTehsil: e.target.value })}
                  placeholder="e.g. Ghatkesar Mandal / Serilingampally"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">District / City *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Medchal-Malkajgiri / Hyderabad"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">State *</label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">PIN Code (6-Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="501301"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Nearby Landmark (Optional)</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="e.g. Near Gram Panchayat Office, Opp. Temple"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Password Update Section with Visibility Toggles */}
        <div className="space-y-4 text-xs pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" /> 3. Change Account Password (Optional)
          </h3>
          <p className="text-slate-400">Leave blank if you do not wish to change your current password.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Current Password */}
            <div>
              <label className="block text-slate-400 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-slate-400 mb-1">New Password (Min 6 chars)</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-slate-400 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 font-semibold text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Details...' : 'Save & Update Details'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default Profile;
