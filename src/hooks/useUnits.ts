import { useState, useEffect } from 'react';

export interface Unit {
  id: string;
  type: 'bedrijfsunit' | 'opslagbox';
  name: string;
  description: string;
  unit_number: string;
  type_number: number;
  gross_area: number;
  net_area: number;
  industrie_net_area?: number;
  industrie_gross_area?: number;
  kantoor_net_area?: number;
  kantoor_gross_area?: number;
  sale_price: number;
  slug: string;
  status: 'available' | 'reserved' | 'sold' | 'maintenance';
  ceiling_height: number;
  parking_spaces: number;
  reservation_fee: number;
  features: string[];
  specifications: Record<string, any>;
  images: string[];
  location: string;
  created_at: string;
  updated_at: string;
}

export interface UseUnitsOptions {
  type?: 'bedrijfsunit' | 'opslagbox';
  status?: 'available' | 'reserved' | 'sold';
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  slug?: string;
}

export function useUnits(options: UseUnitsOptions = {}) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Unit[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams();
        if (options.type) params.append('type', options.type);
        if (options.status) params.append('status', options.status);
        if (options.minPrice) params.append('min_price', options.minPrice.toString());
        if (options.maxPrice) params.append('max_price', options.maxPrice.toString());
        if (options.minArea) params.append('min_area', options.minArea.toString());
        if (options.maxArea) params.append('max_area', options.maxArea.toString());
        if (options.slug) params.append('slug', options.slug);

        const response = await fetch(`/api/units?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch units');
        }

        const data = await response.json();
        
        if (data.success) {
          setUnits(data.units);
          setGrouped(data.grouped);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err: any) {
        console.error('Error fetching units:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [
    options.type,
    options.status,
    options.minPrice,
    options.maxPrice,
    options.minArea,
    options.maxArea,
    options.slug,
  ]);

  return { units, grouped, loading, error };
}

export function useUnit(slug: string) {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/units/${slug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch unit');
        }

        const data = await response.json();
        
        if (data.success) {
          setUnit(data.unit);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err: any) {
        console.error('Error fetching unit:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchUnit();
    }
  }, [slug]);

  return { unit, loading, error };
}


