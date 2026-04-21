import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function NewsletterForm({ 
  locationName,
  containerClassName,
  inputClassName,
  buttonClassName,
  successMessageClassName,
  errorMessageClassName
}: { 
  locationName?: string;
  containerClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  successMessageClassName?: string;
  errorMessageClassName?: string;
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locationName }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Bedankt voor je inschrijving!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Er is iets misgegaan. Probeer het later opnieuw.');
      }
    } catch {
      setStatus('error');
      setMessage('Er is een verbindingsfout opgetreden. Probeer het later opnieuw.');
    }
  };

  if (status === 'success') {
    return (
      <div className={successMessageClassName || "flex items-start gap-3 bg-green-500/20 border border-green-400/40 rounded-xl px-4 py-4 text-green-100 max-w-md mx-auto"}>
        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-300" />
        <div>
          <p className="font-semibold text-sm">Inschrijving gelukt!</p>
          <p className="text-sm opacity-80">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className={containerClassName || "flex gap-2"}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Je e-mailadres"
          required
          disabled={status === 'loading'}
          className={inputClassName || "flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:outline-none disabled:opacity-50"}
        />
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className={buttonClassName || "unity-btn-secondary disabled:opacity-60 whitespace-nowrap flex items-center gap-2"}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Laden...
            </>
          ) : 'Inschrijven'}
        </button>
      </div>

      {status === 'error' && (
        <div className={errorMessageClassName || "flex items-start gap-2 mt-3 bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2 text-red-200"}>
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{message}</p>
        </div>
      )}
    </form>
  );
}
