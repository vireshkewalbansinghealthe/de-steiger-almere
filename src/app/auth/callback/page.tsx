'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code and session from URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('Auth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || error);
          return;
        }

        if (code) {
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setStatus('error');
            setMessage('Er is een fout opgetreden bij het inloggen. Probeer het opnieuw.');
            return;
          }

          if (data.user) {
            setStatus('success');
            
            if (data.user.email_confirmed_at) {
              setMessage(`Welkom terug, ${data.user.email}! U wordt doorgestuurd...`);
            } else {
              setMessage(`Account aangemaakt voor ${data.user.email}. Controleer uw e-mail voor verificatie.`);
            }

            // Redirect after a short delay
            setTimeout(() => {
              // Try to redirect to the page they were on before authentication
              const returnTo = sessionStorage.getItem('auth_return_to') || '/bedrijfsunits';
              sessionStorage.removeItem('auth_return_to');
              router.push(returnTo);
            }, 2000);
          }
        } else {
          // No code, try to get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Fout bij het ophalen van de sessie.');
            return;
          }

          if (session?.user) {
            setStatus('success');
            setMessage(`Ingelogd als ${session.user.email}`);
            
            setTimeout(() => {
              const returnTo = sessionStorage.getItem('auth_return_to') || '/bedrijfsunits';
              sessionStorage.removeItem('auth_return_to');
              router.push(returnTo);
            }, 1500);
          } else {
            setStatus('error');
            setMessage('Geen geldige authenticatie gevonden.');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Er is een onverwachte fout opgetreden.');
      }
    };

    handleAuthCallback();
  }, [searchParams, supabase, router]);

  // Auto redirect to bedrijfsunits after error
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        router.push('/bedrijfsunits');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Inloggen verwerken...
            </h2>
            <p className="text-gray-600">
              Een moment geduld terwijl we uw authenticatie verwerken.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              Succesvol ingelogd! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                U wordt automatisch doorgestuurd naar uw reservering...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Inloggen mislukt
            </h2>
            <p className="text-red-600 mb-4">
              {message}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">
                U wordt over 5 seconden doorgestuurd naar de hoofdpagina.
              </p>
            </div>
            <button
              onClick={() => router.push('/bedrijfsunits')}
              className="bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
            >
              Terug naar Units
            </button>
          </>
        )}

        {/* Email verification reminder */}
        {status === 'success' && message.includes('Controleer uw e-mail') && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800 font-medium text-sm">Verificatie E-mail</span>
            </div>
            <p className="text-blue-700 text-sm">
              We hebben een verificatielink gestuurd naar uw e-mailadres. 
              U kunt alvast doorgaan met uw reservering terwijl we automatisch controleren op verificatie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800" /></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
