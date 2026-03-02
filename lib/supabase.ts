import { createClient } from '@supabase/supabase-js'

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

const supabaseUrl = cleanEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
)

const supabaseAnonKey = cleanEnv(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
)

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

