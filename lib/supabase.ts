import { createClient } from '@supabase/supabase-js'

const FALLBACK_SUPABASE_URL = 'https://tkywatojfbasokbwdhnd.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRreXdhdG9qZmJhc29rYndkaG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzE3MjIsImV4cCI6MjA4Nzk0NzcyMn0.fHGgSkpZdf0Cg9a0PmCVrEYMTVlckVWcULnaMIl3M74'

const cleanEnv = (value?: string) => {
  if (!value) return ''
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

const normalizeApiKey = (value?: string) => cleanEnv(value).replace(/\s+/g, '')

const isLikelyJwt = (value: string) => {
  if (!value) return false
  const parts = value.split('.')
  return value.startsWith('eyJ') && parts.length === 3 && parts.every(Boolean)
}

const normalizeUrl = (value?: string) => cleanEnv(value).replace(/\s+/g, '')

const isLikelySupabaseUrl = (value: string) => {
  if (!value) return false
  return value.startsWith('https://') && value.includes('.supabase.co')
}

const envSupabaseUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
)

const supabaseUrl = isLikelySupabaseUrl(envSupabaseUrl)
  ? envSupabaseUrl
  : FALLBACK_SUPABASE_URL

const envSupabaseAnonKey = normalizeApiKey(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
)

const supabaseAnonKey = isLikelyJwt(envSupabaseAnonKey)
  ? envSupabaseAnonKey
  : FALLBACK_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type SeatZone = 'A' | 'B' | 'LEFT' | 'RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT'

export type Seat = {
  id: number
  zone: SeatZone
  row_number?: number
  seat_number?: number
  position_order?: number
  is_disabled: boolean
  is_occupied: boolean
  occupant_name?: string
  occupant_info?: string
  created_at: string
  updated_at: string
}

export type Reservation = {
  id: number
  name: string
  phone?: string
  email?: string
  group_size: number
  seat_ids: number[]
  status: 'confirmed' | 'pending' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export type HallConfig = {
  id: number
  zone_name: SeatZone
  total_seats: number
  rows?: number
  cols?: number
  description?: string
  created_at: string
  updated_at: string
}

