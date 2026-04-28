import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

export default function BezichtigingForm() {
  const { trackContactFormSubmitted } = useAnalytics();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/bezichtiging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Bedankt! We nemen binnen 24 uur contact met u op.');
        trackContactFormSubmitted('bezichtiging');
        setName('');
        setEmail('');
        setPhone('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Er is iets misgegaan. Probeer het later opnieuw.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Er is een netwerkfout opgetreden.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center mt-4">
        <p className="text-green-100 font-medium">{message}</p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-3 text-sm text-green-200 underline hover:text-white"
        >
          Nieuwe aanvraag doen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Uw naam"
        required
        disabled={status === 'loading'}
        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-slate-300 transition-all duration-300 text-sm disabled:opacity-50"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="uw@email.nl"
        required
        disabled={status === 'loading'}
        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-slate-300 transition-all duration-300 text-sm disabled:opacity-50"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+31 6 12345678"
        required
        disabled={status === 'loading'}
        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-white placeholder-slate-300 transition-all duration-300 text-sm disabled:opacity-50"
      />
      <button 
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:from-yellow-300 hover:to-yellow-100 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm disabled:opacity-50"
      >
        {status === 'loading' ? 'Verzenden...' : 'Plan Bezichtiging'}
      </button>

      {status === 'error' && (
        <p className="text-red-300 text-sm mt-2">{message}</p>
      )}
    </form>
  );
}