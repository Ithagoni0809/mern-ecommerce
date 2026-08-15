import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ExternalLink } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setResetUrl('');

    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      setSuccessMsg(data.message || 'Password reset link sent to your email!');
      if (data.data?.resetUrl) {
        setResetUrl(data.data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fadeIn">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Forgot Password?</h2>
          <p className="text-xs text-slate-400">
            Enter your registered email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            {resetUrl && (
              <div className="pt-2 border-t border-emerald-500/20">
                <div className="text-[11px] text-slate-400 mb-1">Direct Reset Link (Local Testing):</div>
                <a
                  href={resetUrl}
                  className="text-indigo-400 hover:underline break-all font-mono text-[11px] flex items-center gap-1"
                >
                  <span>{resetUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Registered Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 pl-10 pr-4 py-3 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{loading ? 'Sending Link...' : 'Send Reset Password Link'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs text-slate-400 hover:text-indigo-400 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
