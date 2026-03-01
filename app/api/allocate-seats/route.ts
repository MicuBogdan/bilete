import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { findOptimalSeats, Group } from '@/lib/seating-algorithm'

export async function POST(request: Request) {
  try {
    const { groups } = await request.json() as { groups: Group[] }

    if (!groups || !Array.isArray(groups)) {
      return NextResponse.json(
        { error: 'Invalid groups data' },
        { status: 400 }
      )
    }

    // Încarcă toate scaunele disponibile
    const { data: seats, error } = await supabase
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

    // Calculează alocarea optimă
    const allocation = findOptimalSeats(seats, groups)

    // Convertește Map în obiect pentru răspuns JSON
    const allocationObject: Record<string, number[]> = {}
    allocation.forEach((value, key) => {
      allocationObject[key] = value
    })

    return NextResponse.json({
      success: true,
      allocation: allocationObject,
    })
  } catch (error) {
    console.error('Error in allocate-seats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
