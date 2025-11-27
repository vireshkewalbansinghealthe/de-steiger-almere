-- Create a function to confirm payment and update reservation status
-- This runs with SECURITY DEFINER to bypass RLS
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION confirm_reservation_payment(
  p_reservation_id uuid,
  p_payment_intent_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation record;
  v_now timestamp with time zone := now();
BEGIN
  -- Find the reservation
  IF p_reservation_id IS NOT NULL THEN
    SELECT * INTO v_reservation FROM reservations WHERE id = p_reservation_id;
  ELSIF p_payment_intent_id IS NOT NULL THEN
    SELECT * INTO v_reservation FROM reservations WHERE stripe_payment_intent_id = p_payment_intent_id;
  END IF;

  IF v_reservation IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found');
  END IF;

  -- Check if already processed
  IF v_reservation.payment_status = 'completed' AND v_reservation.status = 'reservation_paid' THEN
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Reservation already confirmed',
      'reservation_id', v_reservation.id,
      'reservation_number', v_reservation.reservation_number
    );
  END IF;

  -- Update reservation status
  UPDATE reservations SET
    status = 'reservation_paid',
    payment_status = 'completed',
    paid_at = v_now,
    contract_signed_at = COALESCE(contract_signed_at, v_now),
    updated_at = v_now
  WHERE id = v_reservation.id;

  -- Update property status to reserved
  UPDATE properties SET
    status = 'reserved',
    updated_at = v_now
  WHERE id = v_reservation.property_id;

  -- Remove payment lock
  DELETE FROM payment_locks WHERE property_id = v_reservation.property_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Payment confirmed successfully',
    'reservation_id', v_reservation.id,
    'reservation_number', v_reservation.reservation_number
  );
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION confirm_reservation_payment TO anon;
GRANT EXECUTE ON FUNCTION confirm_reservation_payment TO authenticated;

