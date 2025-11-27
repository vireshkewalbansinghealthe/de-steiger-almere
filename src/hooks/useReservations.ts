import { useState, useEffect } from 'react';
import { Unit } from './useUnits';

export interface Reservation {
  id: string;
  property_id: string;
  customer_id: string;
  reservation_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_company?: string;
  customer_address?: string;
  customer_city?: string;
  customer_postal_code?: string;
  customer_country: string;
  total_property_price: number;
  reservation_fee_amount: number;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  paid_at?: string;
  notes?: string;
  intended_use?: string;
  reservation_expires_at?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: string;
  financing_confirmed: boolean;
  created_at: string;
  updated_at: string;
  properties?: Unit;
}

export function useReservations(status?: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const response = await fetch(`/api/reservations?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      
      if (data.success) {
        setReservations(data.reservations);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [status]);

  return { reservations, loading, error, refetch: fetchReservations };
}

export async function createReservation(data: {
  property_id: string;
  customer_details: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  intended_use?: string;
  notes?: string;
}) {
  const response = await fetch('/api/reservations/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create reservation');
  }

  return await response.json();
}

export async function confirmReservation(paymentIntentId: string) {
  const response = await fetch('/api/reservations/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payment_intent_id: paymentIntentId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to confirm reservation');
  }

  return await response.json();
}


