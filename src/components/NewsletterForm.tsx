import { useState } from 'react';

export default function NewsletterForm({ locationName }: { locationName?: string }) {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, locationName }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Bedankt voor je inschrijving!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Er is iets misgegaan. Probeer het later opnieuw.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Er is een netwerkfout opgetreden.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Je e-mailadres"
          required
          disabled={status === 'loading' || status === 'success'}
          className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={status === 'loading' || status === 'success'}
          className="unity-btn-secondary disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? 'Laden...' : 'Inschrijven'}
        </button>
      </div>
      
      {status === 'success' && (
        <p className="mt-3 text-green-200 text-sm">{message}</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-red-200 text-sm">{message}</p>
      )}
    </form>
  );
}