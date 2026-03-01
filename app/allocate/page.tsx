'use client'

import { useState } from 'react'
import Link from 'next/link'

type Group = {
  size: number
  name: string
  info?: string
}

export default function AllocatePage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [newGroup, setNewGroup] = useState({ size: 2, name: '', info: '' })
  const [allocation, setAllocation] = useState<Record<string, number[]> | null>(null)
  const [loading, setLoading] = useState(false)

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

    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">🧠 Alocare Inteligentă</h1>
          <Link href="/" className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            ← Înapoi
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Adaugă Grupuri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Număr persoane</label>
              <input
                type="number"
                min="1"
                max="12"
                value={newGroup.size}
                onChange={(e) => setNewGroup({ ...newGroup, size: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Nume grup</label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="ex: Familie Popescu"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Informații adiționale (opțional)</label>
              <input
                type="text"
                value={newGroup.info}
                onChange={(e) => setNewGroup({ ...newGroup, info: e.target.value })}
                placeholder="ex: Părinți corist Ion"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={addGroup}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              + Adaugă Grup
            </button>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">Grupuri Adăugate ({groups.length})</h2>
            <div className="space-y-2">
              {groups.map((group, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{group.name}</div>
                    <div className="text-sm text-gray-600">
                      {group.size} {group.size === 1 ? 'persoană' : 'persoane'}
                      {group.info && ` • ${group.info}`}
                    </div>
                  </div>
                  <button
                    onClick={() => removeGroup(idx)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={allocateSeats}
              disabled={loading}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Se alocă...' : '🎯 Alocă Locuri Inteligent'}
            </button>
          </div>
        )}

        {allocation && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">✅ Rezultate Alocare</h2>
            <div className="space-y-3">
              {Object.entries(allocation).map(([groupName, seatIds]) => (
                <div key={groupName} className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-800">{groupName}</div>
                  <div className="text-sm text-green-700 mt-1">
                    Locuri alocate: {seatIds.length > 0 ? seatIds.join(', ') : 'Niciun loc disponibil'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>Notă:</strong> Acestea sunt doar sugestii de alocare. Pentru a aplica efectiv 
                aceste modificări, mergi la pagina de administrator și actualizează manual scaunele.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Cum funcționează algoritmul?</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Grupurile mari sunt așezate împreună pe același rând</li>
            <li>✓ Preferință pentru rândurile din mijloc (vizibilitate optimă)</li>
            <li>✓ Persoanele singure sunt distribuite uniform pentru balanță</li>
            <li>✓ Ține cont de scaunele deja ocupate sau dezactivate</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
