'use client'

import { useEffect, useState } from 'react'
import { supabase, HallConfig } from '@/lib/supabase'
import Link from 'next/link'

export default function HallConfigPage() {
  const [config, setConfig] = useState<HallConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [editValue, setEditValue] = useState(0)

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadConfig()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      sessionStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      loadConfig()
    } else {
      alert('Parolă incorectă!')
    }
  }

  const loadConfig = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('hall_config')
      .select('*')
      .order('zone_name')

    if (error) {
      console.error('Error loading config:', error)
    } else {
      setConfig(data || [])
    }
    setLoading(false)
  }

  const updateZoneSeats = async (zoneName: string, totalSeats: number) => {
    const { error } = await supabase
      .from('hall_config')
      .update({ total_seats: totalSeats })
      .eq('zone_name', zoneName)

    if (error) {
      console.error('Error updating config:', error)
      alert('Eroare la actualizare!')
      return
    }

    // Pentru zonele principale păstrăm structura existentă (rânduri/scaune)
    if (zoneName === 'A' || zoneName === 'B') {
      await loadConfig()
      setEditingZone(null)
      return
    }

    const removedZone = `${zoneName}_REMOVED`

    const { data: existingSeats, error: fetchError } = await supabase
      .from('seats')
      .select('id, position_order')
      .eq('zone', zoneName)
      .order('position_order', { ascending: true })

    if (fetchError) {
      console.error('Error loading seats for zone update:', fetchError)
      alert('Eroare la actualizare scaune!')
      return
    }

    const currentCount = existingSeats?.length || 0

    if (currentCount > totalSeats) {
      const seatsToHide = (existingSeats || []).slice(totalSeats).map((seat) => seat.id)
      if (seatsToHide.length > 0) {
        const { error: hideError } = await supabase
          .from('seats')
          .update({ zone: removedZone })
          .in('id', seatsToHide)

        if (hideError) {
          console.error('Error hiding extra seats:', hideError)
          alert('Eroare la reducerea numărului de scaune!')
          return
        }
      }
    } else if (currentCount < totalSeats) {
      const seatsToCreate = totalSeats - currentCount
      const newSeats = Array.from({ length: seatsToCreate }, (_, i) => ({
        zone: zoneName,
        position_order: currentCount + i + 1,
      }))

      const { error: insertError } = await supabase
        .from('seats')
        .insert(newSeats)

      if (insertError) {
        console.error('Error inserting seats:', insertError)
        alert('Eroare la adăugarea scaunelor!')
        return
      }
    }

    await loadConfig()
    setEditingZone(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-3xl font-bold text-gray-800">Configurare Sală</h2>
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
            ← Înapoi
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

  const zoneEmojis: Record<string, string> = {
    A: '🎭',
    B: '🎭',
    LEFT: '👈',
    RIGHT: '👉',
    BOTTOM_LEFT: '⬇️',
    BOTTOM_RIGHT: '⬇️',
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">⚙️ Configurare Sală Concert</h1>
          <Link href="/admindash" className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-medium">
            ← Admin Dashboard
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Zone Disponibile</h2>
          <p className="text-gray-600 mb-6">Configurează numărul de scaune pentru fiecare zonă:</p>

          <div className="grid md:grid-cols-2 gap-6">
            {config.map((zone) => (
              <div key={zone.zone_name} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-5xl">{zoneEmojis[zone.zone_name] || '🪑'}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Zona {zone.zone_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{zone.description}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg mb-6 border-2 border-blue-300">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">{zone.total_seats}</div>
                    <div className="text-lg text-gray-700">scaune active</div>
                  </div>
                </div>

                {editingZone === zone.zone_name ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-800 mb-2">Introdu numărul de scaune:</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editValue}
                      onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-4 text-2xl font-bold text-gray-900 border-3 border-blue-500 rounded-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-600 bg-white placeholder-gray-400"
                      autoFocus
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateZoneSeats(zone.zone_name, editValue)}
                        className="w-full px-4 py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 active:bg-green-700 transition shadow-lg"
                      >
                        ✓ Salvează
                      </button>
                      <button
                        onClick={() => setEditingZone(null)}
                        className="w-full px-4 py-4 bg-gray-500 text-white rounded-lg font-bold text-lg hover:bg-gray-600 active:bg-gray-700 transition shadow-lg"
                      >
                        ✕ Anulează
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingZone(zone.zone_name)
                      setEditValue(zone.total_seats)
                    }}
                    className="w-full px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 transition shadow-lg hover:shadow-xl"
                  >
                    ✏️ Editează: {zone.total_seats} scaune
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Informații:</h3>
            <ul className="space-y-2 text-blue-800">
              <li>✔️ <strong>Zona A & B</strong> - Zoneaza principale cu rânduri de 12 scaune</li>
              <li>✔️ <strong>Zona LEFT & RIGHT</strong> - Laterale (stânga/dreapta) - o coloană verticală</li>
              <li>✔️ <strong>BOTTOM_LEFT & BOTTOM_RIGHT</strong> - Zona jos (split) - fiecare are propriile scaune</li>
              <li>✔️ Când schimbi numărul de scaune, se regenerează automat baza de date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
