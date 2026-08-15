import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { AlertTriangle, Mail, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sentToast, setSentToast] = useState('');
  const [testLink, setTestLink] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Only display if user is logged in and email is NOT verified
  if (!user || user.isEmailVerified) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    setSentToast('');
    setTestLink('');
    setErrorToast('');

    try {
      const { data } = await API.post('/auth/resend-verification', { email: user.email });
      setSentToast('Verification link sent to your email!');
      if (data.data?.verificationUrl) {
        setTestLink(data.data.verificationUrl);
      }
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
            <strong className="font-semibold text-white">Not Verified:</strong> Your email address (<span className="text-amber-200 font-mono">{user.email}</span>) is not verified. Please verify your email to secure your account.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {sentToast && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {sentToast}
            </span>
          )}
          
          {testLink && (
            <a
              href={testLink}
              className="text-indigo-300 hover:text-white underline font-semibold flex items-center gap-1 text-[11px]"
            >
              <span>Verify Now (Direct Link)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {errorToast && (
            <span className="text-rose-400 text-[11px]">{errorToast}</span>
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
