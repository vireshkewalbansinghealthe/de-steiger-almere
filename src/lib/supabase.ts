import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client for client-side operations
export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)

// Legacy export for backward compatibility
export const supabase = createClient()

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          company_name: string | null
          role: 'customer' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company_name?: string | null
          role?: 'customer' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          company_name?: string | null
          role?: 'customer' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          type: 'bedrijfsunit' | 'opslagbox'
          name: string
          description: string | null
          unit_number: string
          type_number: number
          gross_area: number | null
          net_area: number | null
          industrie_net_area: number | null
          industrie_gross_area: number | null
          kantoor_net_area: number | null
          kantoor_gross_area: number | null
          sale_price: number
          reservation_fee: number | null
          status: 'available' | 'reserved' | 'sold' | 'maintenance'
          floor_level: number | null
          ceiling_height: number | null
          parking_spaces: number | null
          features: any
          specifications: any
          images: any
          location: string | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'bedrijfsunit' | 'opslagbox'
          name: string
          description?: string | null
          unit_number: string
          type_number: number
          gross_area?: number | null
          net_area?: number | null
          industrie_net_area?: number | null
          industrie_gross_area?: number | null
          kantoor_net_area?: number | null
          kantoor_gross_area?: number | null
          sale_price: number
          reservation_fee?: number | null
          status?: 'available' | 'reserved' | 'sold' | 'maintenance'
          floor_level?: number | null
          ceiling_height?: number | null
          parking_spaces?: number | null
          features?: any
          specifications?: any
          images?: any
          location?: string | null
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'bedrijfsunit' | 'opslagbox'
          name?: string
          description?: string | null
          unit_number?: string
          type_number?: number
          gross_area?: number | null
          net_area?: number | null
          industrie_net_area?: number | null
          industrie_gross_area?: number | null
          kantoor_net_area?: number | null
          kantoor_gross_area?: number | null
          sale_price?: number
          reservation_fee?: number | null
          status?: 'available' | 'reserved' | 'sold' | 'maintenance'
          floor_level?: number | null
          ceiling_height?: number | null
          parking_spaces?: number | null
          features?: any
          specifications?: any
          images?: any
          location?: string | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          property_id: string
          customer_id: string
          reservation_number: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          customer_first_name: string
          customer_last_name: string
          customer_email: string
          customer_phone: string | null
          customer_company: string | null
          customer_address: string | null
          customer_city: string | null
          customer_postal_code: string | null
          customer_country: string | null
          reservation_fee_amount: number
          total_property_price: number
          stripe_payment_intent_id: string | null
          stripe_customer_id: string | null
          payment_status: string | null
          paid_at: string | null
          notes: string | null
          intended_use: string | null
          financing_confirmed: boolean | null
          reservation_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          customer_id: string
          reservation_number?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          customer_first_name: string
          customer_last_name: string
          customer_email: string
          customer_phone?: string | null
          customer_company?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_postal_code?: string | null
          customer_country?: string | null
          reservation_fee_amount?: number
          total_property_price: number
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          payment_status?: string | null
          paid_at?: string | null
          notes?: string | null
          intended_use?: string | null
          financing_confirmed?: boolean | null
          reservation_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          customer_id?: string
          reservation_number?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          customer_first_name?: string
          customer_last_name?: string
          customer_email?: string
          customer_phone?: string | null
          customer_company?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_postal_code?: string | null
          customer_country?: string | null
          reservation_fee_amount?: number
          total_property_price?: number
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          payment_status?: string | null
          paid_at?: string | null
          notes?: string | null
          intended_use?: string | null
          financing_confirmed?: boolean | null
          reservation_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_inquiries: {
        Row: {
          id: string
          property_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string | null
          company_name: string | null
          subject: string | null
          message: string
          inquiry_type: string | null
          status: string | null
          assigned_to: string | null
          admin_response: string | null
          responded_at: string | null
          responded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          company_name?: string | null
          subject?: string | null
          message: string
          inquiry_type?: string | null
          status?: string | null
          assigned_to?: string | null
          admin_response?: string | null
          responded_at?: string | null
          responded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          company_name?: string | null
          subject?: string | null
          message?: string
          inquiry_type?: string | null
          status?: string | null
          assigned_to?: string | null
          admin_response?: string | null
          responded_at?: string | null
          responded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Property = Database['public']['Tables']['properties']['Row']
export type Reservation = Database['public']['Tables']['reservations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type PropertyInquiry = Database['public']['Tables']['property_inquiries']['Row']
