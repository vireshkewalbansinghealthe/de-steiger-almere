'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Mail, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  userEmail: string;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  onVerified,
  userEmail
}: EmailVerificationModalProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [countdown, setCountdown] = useState(60);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const supabase = createClient();

  // Auto-check verification status every 3 seconds
  useEffect(() => {
    if (!isOpen) return;

    const checkInterval = setInterval(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.email_confirmed_at) {
          clearInterval(checkInterval);
          onVerified();
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [isOpen, supabase, onVerified]);

  // Countdown for resend button
  useEffect(() => {
    if (resendStatus === 'sent' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setResendStatus('idle');
      setCountdown(60);
    }
  }, [resendStatus, countdown]);

  const resendVerificationEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) {
        console.error('Resend error:', error);
        setResendStatus('error');
      } else {
        setResendStatus('sent');
      }
    } catch (error) {
      console.error('Resend failed:', error);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const checkVerificationNow = async () => {
    setIsCheckingVerification(true);
    try {
      // Force refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        return;
      }

      if (data.user && data.user.email_confirmed_at) {
        onVerified();
      }
    } catch (error) {
      console.error('Verification check error:', error);
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const skipVerification = () => {
    // Allow user to continue without verification for now
    // but mark them as unverified
    onVerified();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">E-mail Verificatie</h3>
                <p className="text-blue-100 text-sm">Bijna klaar!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Verificatie e-mail verzonden!
            </h4>
            <p className="text-gray-600 text-sm">
              We hebben een verificatielink gestuurd naar:
            </p>
            <p className="font-medium text-gray-900 mt-1 bg-gray-50 px-3 py-2 rounded-lg">
              {userEmail}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium mb-1">
                  Goed om te weten:
                </p>
                <ul className="text-yellow-700 space-y-1 text-xs">
                  <li>• Controleer ook uw spam/junk folder</li>
                  <li>• De link is 24 uur geldig</li>
                  <li>• U kunt doorgaan terwijl we automatisch controleren</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Auto-checking indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 text-sm">
                Automatisch controleren op verificatie...
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {resendStatus === 'sent' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-green-800 text-sm">
                  Nieuwe verificatie e-mail verzonden!
                </p>
              </div>
            </div>
          )}

          {resendStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-red-800 text-sm">
                  Fout bij verzenden. Probeer het opnieuw.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 space-y-3">
          <button
            onClick={checkVerificationNow}
            disabled={isCheckingVerification}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {isCheckingVerification ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Controleren...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Ik heb geverifieerd - Controleer nu
              </>
            )}
          </button>

          <button
            onClick={resendVerificationEmail}
            disabled={isResending || resendStatus === 'sent'}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {isResending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Verzenden...
              </>
            ) : resendStatus === 'sent' ? (
              `Opnieuw verzenden over ${countdown}s`
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                E-mail opnieuw verzenden
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={skipVerification}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Doorgaan zonder verificatie (tijdelijk)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
