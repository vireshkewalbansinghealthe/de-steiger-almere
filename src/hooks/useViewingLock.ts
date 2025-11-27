import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface UseViewingLockOptions {
  propertyId: string | null;
  enabled?: boolean;
}

interface ViewingLockState {
  isLocked: boolean;
  isOwner: boolean;
  message: string | null;
  secondsLeft: number | null;
}

/**
 * Hook to manage viewing locks with real-time updates
 * Prevents multiple users from starting a reservation on the same property
 */
export function useViewingLock({ propertyId, enabled = true }: UseViewingLockOptions) {
  const [state, setState] = useState<ViewingLockState>({
    isLocked: false,
    isOwner: false,
    message: null,
    secondsLeft: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string>(Math.random().toString(36).substring(7));
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return null;
    }
    return `Bearer ${session.access_token}`;
  };

  const acquireLock = async () => {
    if (!propertyId || !enabled) {
      console.log('🔒 Lock acquire skipped - propertyId:', propertyId, 'enabled:', enabled);
      return;
    }

    console.log('🔒 Attempting to acquire lock for property:', propertyId, 'session:', sessionIdRef.current);
    setIsLoading(true);
    try {
      const authHeader = await getAuthHeader();
      if (!authHeader) {
        console.log('❌ Not authenticated, skipping lock');
        setState({
          isLocked: false,
          isOwner: false,
          message: null,
          secondsLeft: null,
        });
        return;
      }

      const response = await fetch('/api/viewing-locks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          property_id: propertyId,
          session_id: sessionIdRef.current,
        }),
      });

      const data = await response.json();
      console.log('🔒 Lock response:', data);

      if (data.locked) {
        console.log('❌ Property is locked by another user');
        setState({
          isLocked: true,
          isOwner: false,
          message: data.message,
          secondsLeft: data.seconds_left || null,
        });
      } else {
        console.log('✅ Lock acquired successfully');
        setState({
          isLocked: false,
          isOwner: true,
          message: null,
          secondsLeft: null,
        });
        startHeartbeat();
      }
    } catch (error) {
      console.error('❌ Error acquiring lock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        const authHeader = await getAuthHeader();
        if (!authHeader) return;

        await fetch('/api/viewing-locks', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            session_id: sessionIdRef.current,
          }),
        });
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    }, 30000); // Every 30 seconds
  };

  const releaseLock = async () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Always try to release using session_id, even if propertyId is null
    if (!state.isOwner) return;

    try {
      const authHeader = await getAuthHeader();
      if (!authHeader) return;

      console.log('🔓 Releasing lock for session:', sessionIdRef.current);
      await fetch(`/api/viewing-locks?session_id=${sessionIdRef.current}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
        },
      });
      
      // Reset state
      setState({
        isLocked: false,
        isOwner: false,
        message: null,
        secondsLeft: null,
      });
    } catch (error) {
      console.error('Error releasing lock:', error);
    }
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!propertyId || !enabled) return;

    acquireLock();

    const channel = supabase
      .channel(`viewing_locks:${propertyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'viewing_locks',
          filter: `property_id=eq.${propertyId}`,
        },
        (payload) => {
          console.log('Lock change detected:', payload);
          acquireLock(); // Re-check lock status
        }
      )
      .subscribe();

    // Cleanup on unmount or when propertyId changes
    return () => {
      releaseLock();
      channel.unsubscribe();
    };
  }, [propertyId, enabled]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, release lock
        releaseLock();
      } else {
        // Page is visible again, reacquire lock
        acquireLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [propertyId, enabled]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use navigator.sendBeacon for reliable cleanup
      const authHeader = getAuthHeader();
      if (state.isOwner && authHeader) {
        navigator.sendBeacon(
          `/api/viewing-locks?session_id=${sessionIdRef.current}`,
          JSON.stringify({ method: 'DELETE' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.isOwner]);

  return {
    ...state,
    isLoading,
    retry: acquireLock,
  };
}

