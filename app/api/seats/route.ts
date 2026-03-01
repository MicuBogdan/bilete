import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .order('zone')
      .order('row_number')
      .order('seat_number')

    if (error) {
      return NextResponse.json(
        { error: 'Failed to load seats' },
        { status: 500 }
      )
    }

    return NextResponse.json({ seats: data })
  } catch (error) {
    console.error('Error loading seats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { seatId, updates } = await request.json()

    if (!seatId) {
      return NextResponse.json(
        { error: 'Seat ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('seats')
      .update(updates)
      .eq('id', seatId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update seat' },
        { status: 500 }
      )
    }

    return NextResponse.json({ seat: data })
  } catch (error) {
    console.error('Error updating seat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
