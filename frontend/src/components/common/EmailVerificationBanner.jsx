import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { AlertTriangle, Mail, CheckCircle2, Loader2 } from 'lucide-react';

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sentToast, setSentToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Only display if user is logged in and email is NOT verified
  if (!user || user.isEmailVerified) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    setSentToast('');
    setErrorToast('');

    try {
      await API.post('/auth/resend-verification', { email: user.email });
      setSentToast('Verification link sent to your email inbox! Please check your email.');
      setTimeout(() => setSentToast(''), 8000);
    } catch (err) {
      setErrorToast(err.response?.data?.message || 'Failed to send verification link');
      setTimeout(() => setErrorToast(''), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-white">Not Verified:</strong> Your email address (<span className="text-amber-200 font-mono">{user.email}</span>) is not verified. Click to receive a verification email.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {sentToast && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {sentToast}
            </span>
          )}

          {errorToast && (
            <span className="text-rose-400 text-[11px] bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">{errorToast}</span>
          )}

          <button
            onClick={handleResend}
            disabled={sending}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-full text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {sending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="w-3 h-3" />
                <span>Verify Email</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmailVerificationBanner;
