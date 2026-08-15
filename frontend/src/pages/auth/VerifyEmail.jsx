import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const doVerify = async () => {
      try {
        const { data } = await API.get(`/auth/verify-email/${token}`);
        setSuccess(true);
        if (data.data?.user) {
          updateUser(data.data.user);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Verification link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      doVerify();
    }
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fadeIn">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl text-center space-y-6">
        
        {loading && (
          <div className="space-y-4 py-8">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Verifying Email Address...</h2>
            <p className="text-xs text-slate-400">Please wait while we confirm your verification token.</p>
          </div>
        )}

        {!loading && success && (
          <div className="space-y-4 py-4 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Email Verified Successfully!</h2>
              <p className="text-xs text-slate-300">
                Your BharatKart account is now fully verified and secured.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl text-xs text-emerald-400 font-semibold border border-emerald-500/20 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Account Access Activated</span>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-xs font-semibold"
              >
                <span>Continue to BharatKart</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {!loading && !success && (
          <div className="space-y-4 py-4 animate-fadeIn">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-400 border border-rose-500/30">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-100">Verification Failed</h2>
              <p className="text-xs text-rose-400">{error}</p>
            </div>
            <p className="text-xs text-slate-400">
              The verification link may have expired or already been used. You can request a new link from your account profile.
            </p>

            <div className="flex gap-3 pt-2">
              <Link
                to="/profile"
                className="flex-1 btn-primary py-2.5 text-xs font-semibold"
              >
                Go to Profile
              </Link>
              <Link
                to="/"
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
