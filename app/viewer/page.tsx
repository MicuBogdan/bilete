'use client'

import { useEffect, useState } from 'react'
import { supabase, Seat } from '@/lib/supabase'

export default function ViewerPage() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    disabled: 0,
  })

  useEffect(() => {
    loadSeats()
    
    // Actualizare automată la fiecare 5 secunde
    const interval = setInterval(loadSeats, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadSeats = async () => {
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
      calculateStats(data || [])
    }
    setLoading(false)
  }

  const calculateStats = (seatData: Seat[]) => {
    setStats({
      total: seatData.length,
      available: seatData.filter(s => !s.is_disabled && !s.is_occupied).length,
      occupied: seatData.filter(s => s.is_occupied).length,
      disabled: seatData.filter(s => s.is_disabled).length,
    })
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
  const zoneLeft = seats.filter(s => s.zone === 'LEFT').sort((a, b) => (a.position_order || 0) - (b.position_order || 0))
  const zoneRight = seats.filter(s => s.zone === 'RIGHT').sort((a, b) => (a.position_order || 0) - (b.position_order || 0))
  const zoneBottomLeft = seats.filter(s => s.zone === 'BOTTOM_LEFT').sort((a, b) => (a.position_order || 0) - (b.position_order || 0))
  const zoneBottomRight = seats.filter(s => s.zone === 'BOTTOM_RIGHT').sort((a, b) => (a.position_order || 0) - (b.position_order || 0))

  const renderMainZones = (zoneSeats: Seat[], zoneName: string) => {
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
                let seatClass = 'seat '
                if (seat.is_disabled) {
                  seatClass += 'seat-disabled'
                } else if (seat.is_occupied) {
                  seatClass += 'seat-occupied'
                } else {
                  seatClass += 'seat-available'
                }

                return (
                  <button
                    key={seat.id}
                    onClick={() => setSelectedSeat(seat)}
                    className={seatClass + ' cursor-pointer hover:opacity-80'}
                    title={`${zoneName}${seat.row_number}-${seat.seat_number}${
                      seat.occupant_name ? `: ${seat.occupant_name}` : ''
                    }`}
                  >
                    {seat.is_disabled && '✖'}
                    {!seat.is_disabled && seat.seat_number}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderSideZone = (zoneSeats: Seat[], zoneName: string) => {
    if (zoneSeats.length === 0) {
      return null
    }

    return (
      <div className="mb-4">
        <h4 className="text-lg font-bold text-center text-gray-900 bg-gray-200 py-1 px-3 rounded mb-2">{zoneName}</h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {zoneSeats.map(seat => {
            let seatClass = 'seat '
            if (seat.is_disabled) {
              seatClass += 'seat-disabled'
            } else if (seat.is_occupied) {
              seatClass += 'seat-occupied'
            } else {
              seatClass += 'seat-available'
            }

            return (
              <button
                key={seat.id}
                onClick={() => setSelectedSeat(seat)}
                className={seatClass + ' cursor-pointer hover:opacity-80'}
                title={`${zoneName} Scaun ${seat.position_order}${
                  seat.occupant_name ? `: ${seat.occupant_name}` : ''
                }`}
              >
                {seat.is_disabled && '✖'}
                {!seat.is_disabled && seat.position_order}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gray-100">
      {/* Modal cu detalii scaun */}
      {selectedSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedSeat.zone === 'A' || selectedSeat.zone === 'B' 
                  ? `Zona ${selectedSeat.zone} - Rând ${selectedSeat.row_number}, Scaun ${selectedSeat.seat_number}`
                  : `${selectedSeat.zone} - Scaun ${selectedSeat.position_order}`}
              </h2>
              <button
                onClick={() => setSelectedSeat(null)}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700 min-w-fit">Status:</span>
                {selectedSeat.is_disabled ? (
                  <span className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm">Dezactivat</span>
                ) : selectedSeat.is_occupied ? (
                  <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">Ocupat</span>
                ) : (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">Disponibil</span>
                )}
              </div>

              {selectedSeat.occupant_name && (
                <div>
                  <div className="font-semibold text-gray-700">Ocupant: <span className="text-gray-900">{selectedSeat.occupant_name}</span></div>
                </div>
              )}

              {selectedSeat.occupant_info && (
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Informații:</div>
                  <div className="text-gray-800 p-3 bg-gray-50 rounded-lg">{selectedSeat.occupant_info}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSeat(null)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Închide
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">👁️ Disponibilitate Locuri</h1>
        </div>

        {stats.total === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-yellow-900">
            Nu există scaune în baza de date pentru acest mediu. Verifică variabilele Vercel și rulează schema `supabase-schema-updated.sql` în proiectul Supabase folosit la deploy.
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-500 p-4 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-blue-100">Total Locuri</div>
          </div>
          <div className="bg-green-500 p-4 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-white">{stats.available}</div>
            <div className="text-sm text-green-100">Disponibile</div>
          </div>
          <div className="bg-red-500 p-4 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-white">{stats.occupied}</div>
            <div className="text-sm text-red-100">Ocupate</div>
          </div>
          <div className="bg-gray-600 p-4 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-white">{stats.disabled}</div>
            <div className="text-sm text-gray-200">Dezactivate</div>
          </div>
        </div>

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

          {/* Laterale sus */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="flex justify-center">
              {renderSideZone(zoneLeft, '👈 LEFT')}
            </div>
            <div></div>
            <div className="flex justify-center">
              {renderSideZone(zoneRight, '👉 RIGHT')}
            </div>
          </div>

          {/* Zone principale A și B */}
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            {renderMainZones(zoneA, 'A')}
            {renderMainZones(zoneB, 'B')}
          </div>

          {/* Zone jos */}
          <div className="border-t-2 border-gray-300 pt-6">
            <h3 className="text-lg font-bold text-center text-gray-900 mb-4">⬇️ Zone Jos</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {renderSideZone(zoneBottomLeft, 'BOTTOM LEFT')}
              {renderSideZone(zoneBottomRight, 'BOTTOM RIGHT')}
            </div>
          </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Actualizare automată la fiecare 5 secunde</p>
        </div>
      </div>
    </div>
  )
}
