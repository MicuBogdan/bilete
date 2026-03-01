'use client'

import { useEffect, useState } from 'react'
import { supabase, Seat } from '@/lib/supabase'
import Link from 'next/link'
import { Group } from '@/lib/seating-algorithm'

export default function AdminDashboard() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState<'seats' | 'allocate'>('seats')
  
  // Allocate state
  const [groups, setGroups] = useState<Group[]>([])
  const [newGroup, setNewGroup] = useState({ size: 2, name: '', info: '' })
  const [allocation, setAllocation] = useState<Record<string, number[]> | null>(null)
  const [allocating, setAllocating] = useState(false)

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

  // Allocation functions
  const addGroup = () => {
    if (newGroup.name.trim()) {
      setGroups([...groups, { ...newGroup }])
      setNewGroup({ size: 2, name: '', info: '' })
    }
  }

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index))
  }

  const allocateSeats = async () => {
    if (groups.length === 0) {
      alert('Adaugă cel puțin un grup!')
      return
    }

    setAllocating(true)
    try {
      const response = await fetch('/api/allocate-seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups }),
      })

      const data = await response.json()
      if (data.success) {
        setAllocation(data.allocation)
      } else {
        alert('Eroare la alocare: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Eroare la alocare!')
    } finally {
      setAllocating(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-gray-600 mt-2">Introdu parola pentru acces</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Parolă administrator"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
          >
            Login
          </button>
          <Link href="/" className="block text-center mt-4 text-blue-600 hover:underline font-medium">
            ← Înapoi la Home
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Se încarcă...</div>
        </div>
      </div>
    )
  }

  const zoneA = seats.filter(s => s.zone === 'A')
  const zoneB = seats.filter(s => s.zone === 'B')
  const zoneLeft = seats.filter(s => s.zone === 'LEFT').sort((a, b) => (a.position_order || 0) - (b.position_order || 0))
  const zoneRight = seats.filter(s => s.zone === 'RIGHT').sort((a, b) => (a.position_order || 0) - (b.position_order || 0))
  const zoneBottomLeft = seats.filter(s => s.zone === 'BOTTOM_LEFT').sort((a, b) => (a.position_order || 0) - (b.position_order || 0))
  const zoneBottomRight = seats.filter(s => s.zone === 'BOTTOM_RIGHT').sort((a, b) => (a.position_order || 0) - (b.position_order || 0))

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
                  seatClass += ' ring-4 ring-yellow-400'
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

  const renderSideZone = (zoneSeats: Seat[], zoneName: string) => {
    if (zoneSeats.length === 0) {
      return null
    }

    return (
      <div className="mb-4">
        <h4 className="text-lg font-bold text-center text-gray-900 bg-gray-200 py-1 px-3 rounded mb-2">{zoneName}</h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {zoneSeats.map(seat => {
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
              seatClass += ' ring-4 ring-yellow-400'
            }

            return (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className={seatClass}
                title={`${zoneName} Scaun ${seat.position_order}${
                  seat.occupant_name ? `: ${seat.occupant_name}` : ''
                }`}
              >
                {seat.is_occupied && '👤'}
                {seat.is_disabled && '✖'}
                {!seat.is_occupied && !seat.is_disabled && seat.position_order}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🎛️ Admin Dashboard</h1>
          <Link href="/" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium">
            ← Home
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('seats')}
            className={`py-3 px-6 rounded-lg font-bold transition ${
              activeTab === 'seats'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🪑 Gestionare Scaune
          </button>
          <button
            onClick={() => setActiveTab('allocate')}
            className={`py-3 px-6 rounded-lg font-bold transition ${
              activeTab === 'allocate'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🧠 Alocare Inteligentă
          </button>
          <Link
            href="/hall-config"
            className="py-3 px-6 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition shadow-md"
          >
            ⚙️ Configurare Sală
          </Link>
        </div>

        {/* Seats Management Tab */}
        {activeTab === 'seats' && (
          <>
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
                    <div className="flex-1 min-w-[200px] px-4 py-2 bg-white rounded-lg border-2 border-gray-300">
                      <div className="font-semibold text-gray-900">{selectedSeat.occupant_name}</div>
                      {selectedSeat.occupant_info && (
                        <div className="text-sm text-gray-600">{selectedSeat.occupant_info}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

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

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <div className="text-center mb-6 py-4 bg-gray-900 text-white rounded-lg font-bold text-xl">
                🎭 SCENĂ
              </div>

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
                {renderZone(zoneA, 'A')}
                {renderZone(zoneB, 'B')}
              </div>

              {/* Zone jos */}
              <div className="border-t-2 border-gray-300 pt-6">
                <h3 className="text-lg font-bold text-center text-gray-900 mb-4">⬇️ Zone Jos</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {renderSideZone(zoneBottomLeft, 'BOTTOM LEFT')}
                  {renderSideZone(zoneBottomRight, 'BOTTOM RIGHT')}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Allocate Tab */}
        {activeTab === 'allocate' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Adaugă Grupuri pentru Alocare</h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Număr persoane</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newGroup.size}
                    onChange={(e) => setNewGroup({ ...newGroup, size: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Nume grup</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="ex: Familie Popescu"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Info (opțional)</label>
                  <input
                    type="text"
                    value={newGroup.info}
                    onChange={(e) => setNewGroup({ ...newGroup, info: e.target.value })}
                    placeholder="ex: Părinți corist"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                onClick={addGroup}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-md"
              >
                + Adaugă Grup
              </button>
            </div>

            {groups.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Grupuri Adăugate ({groups.length})</h2>
                <div className="space-y-2 mb-6">
                  {groups.map((group, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-semibold text-gray-900">{group.name}</div>
                        <div className="text-sm text-gray-600">
                          {group.size} {group.size === 1 ? 'persoană' : 'persoane'}
                          {group.info && ` • ${group.info}`}
                        </div>
                      </div>
                      <button
                        onClick={() => removeGroup(idx)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={allocateSeats}
                  disabled={allocating}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 shadow-lg text-lg"
                >
                  {allocating ? 'Se alocă...' : '🎯 Alocă Locuri Inteligent'}
                </button>
              </div>
            )}

            {allocation && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-green-800">✅ Rezultate Alocare</h2>
                <div className="space-y-3">
                  {Object.entries(allocation).map(([groupName, seatIds]) => (
                    <div key={groupName} className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                      <div className="font-bold text-green-900">{groupName}</div>
                      <div className="text-sm text-green-700 mt-1">
                        Locuri alocate: {seatIds.length > 0 ? seatIds.join(', ') : 'Niciun loc disponibil'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
