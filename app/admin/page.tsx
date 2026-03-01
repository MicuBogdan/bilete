'use client'

import { useEffect, useState } from 'react'
import { supabase, Seat } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadSeats()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = () => {
    // Simplu check pentru demo - în producție folosește autentificare reală
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      sessionStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      loadSeats()
    } else {
      alert('Parolă incorectă!')
    }
  }

  const loadSeats = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .order('zone')
      .order('row_number')
      .order('seat_number')

    if (error) {
      console.error('Error loading seats:', error)
    } else {
      setSeats(data || [])
    }
    setLoading(false)
  }

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat)
  }

  const updateSeat = async (updates: Partial<Seat>) => {
    if (!selectedSeat) return

    const { error } = await supabase
      .from('seats')
      .update(updates)
      .eq('id', selectedSeat.id)

    if (error) {
      console.error('Error updating seat:', error)
      alert('Eroare la actualizare!')
    } else {
      await loadSeats()
      setSelectedSeat(null)
    }
  }

  const toggleDisabled = () => {
    if (selectedSeat) {
      updateSeat({ is_disabled: !selectedSeat.is_disabled })
    }
  }

  const updateOccupant = () => {
    if (selectedSeat) {
      const name = prompt('Introdu numele ocupantului:', selectedSeat.occupant_name || '')
      if (name !== null) {
        const info = prompt('Informații adiționale (opțional):', selectedSeat.occupant_info || '')
        updateSeat({
          occupant_name: name || undefined,
          occupant_info: info || undefined,
          is_occupied: !!name,
        })
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">🔐 Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Introdu parola"
            className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Login
          </button>
          <Link href="/" className="block text-center mt-4 text-blue-600 hover:underline">
            ← Înapoi
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Se încarcă...</div>
      </div>
    )
  }

  const zoneA = seats.filter(s => s.zone === 'A')
  const zoneB = seats.filter(s => s.zone === 'B')

  const renderZone = (zoneSeats: Seat[], zoneName: string) => {
    const rows: Seat[][] = []
    for (let i = 1; i <= 17; i++) {
      rows.push(zoneSeats.filter(s => s.row_number === i))
    }

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-center text-gray-900 bg-gray-200 py-2 rounded">Zona {zoneName}</h3>
        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={idx} className="flex items-center gap-2 justify-center">
              <span className="text-sm w-8 text-gray-700 font-bold">{idx + 1}</span>
              {row.map(seat => {
                const isSelected = selectedSeat?.id === seat.id
                let seatClass = 'seat '
                if (seat.is_disabled) {
                  seatClass += 'seat-disabled'
                } else if (seat.is_occupied) {
                  seatClass += 'seat-occupied'
                } else {
                  seatClass += 'seat-available'
                }
                if (isSelected) {
                  seatClass += ' ring-4 ring-blue-500'
                }

                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    className={seatClass}
                    title={`${zoneName}${seat.row_number}-${seat.seat_number}${seat.occupant_name ? `: ${seat.occupant_name}` : ''}`}
                  >
                    {seat.is_occupied && '👤'}
                    {seat.is_disabled && '✖'}
                    {!seat.is_occupied && !seat.is_disabled && seat.seat_number}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">👨‍💼 Panoul Administrator</h1>
          <Link href="/" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
            ← Înapoi
          </Link>
        </div>

        {/* Info panel */}
        {selectedSeat && (
          <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg mb-3 text-gray-900">
              Scaun Selectat: Zona {selectedSeat.zone}, Rând {selectedSeat.row_number}, Scaun {selectedSeat.seat_number}
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleDisabled}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  selectedSeat.is_disabled
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {selectedSeat.is_disabled ? 'Activează' : 'Dezactivează'}
              </button>
              <button
                onClick={updateOccupant}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
              >
                {selectedSeat.is_occupied ? 'Modifică Ocupant' : 'Adaugă Ocupant'}
              </button>
              {selectedSeat.occupant_name && (
                <div className="flex-1 min-w-[200px] px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="font-semibold">{selectedSeat.occupant_name}</div>
                  {selectedSeat.occupant_info && (
                    <div className="text-sm text-gray-600">{selectedSeat.occupant_info}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md flex flex-wrap gap-4 text-base font-medium">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 border-2 border-green-600 bg-green-500 rounded shadow-sm"></div>
            <span className="text-gray-800">Disponibil</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 border-2 border-red-600 bg-red-500 rounded shadow-sm"></div>
            <span className="text-gray-800">Ocupat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 border-2 border-gray-600 bg-gray-500 rounded shadow-sm"></div>
            <span className="text-gray-800">Dezactivat</span>
          </div>
        </div>

        {/* Seating layout */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="text-center mb-6 py-4 bg-gray-900 text-white rounded-lg font-bold text-xl">
            🎭 SCENĂ
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {renderZone(zoneA, 'A')}
            {renderZone(zoneB, 'B')}
          </div>
        </div>
      </div>
    </div>
  )
}
