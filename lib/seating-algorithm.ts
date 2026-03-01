import { Seat } from './supabase'

export type Group = {
  size: number
  name: string
  info?: string
}

/**
 * Algoritm de alocare inteligentă a locurilor pentru familii
 * Principii:
 * - Grupuri de 2+ persoane: așezează împreună pe același rând
 * - Persoane singure: distribuie uniform pentru a balansa sălile
 * - Preferință pentru randurile din mijloc (7-11)
 */
export function findOptimalSeats(
  seats: Seat[],
  groups: Group[]
): Map<string, number[]> {
  const allocation = new Map<string, number[]>()
  
  // Sortează grupurile: mai întâi cele mari, apoi cele mici
  const sortedGroups = [...groups].sort((a, b) => b.size - a.size)
  
  // Organizează scaunele disponibile pe zone și rânduri
  const availableSeats = seats.filter(s => !s.is_disabled && !s.is_occupied)
  const seatsByZoneAndRow = organizeSeatsByZoneAndRow(availableSeats)
  
  for (const group of sortedGroups) {
    if (group.size === 1) {
      // Pentru persoane singure, găsește cel mai bun loc pentru balanță
      const seatId = findBalancedSingleSeat(seatsByZoneAndRow, allocation)
      if (seatId) {
        allocation.set(group.name, [seatId])
        removeSeatFromAvailable(seatsByZoneAndRow, seatId, availableSeats)
      }
    } else {
      // Pentru grupuri, găsește locuri consecutive
      const seatIds = findConsecutiveSeats(
        seatsByZoneAndRow,
        group.size,
        availableSeats
      )
      if (seatIds.length === group.size) {
        allocation.set(group.name, seatIds)
        for (const seatId of seatIds) {
          removeSeatFromAvailable(seatsByZoneAndRow, seatId, availableSeats)
        }
      }
    }
  }
  
  return allocation
}

function organizeSeatsByZoneAndRow(seats: Seat[]): Map<string, Seat[]> {
  const organized = new Map<string, Seat[]>()
  
  for (const seat of seats) {
    const key = `${seat.zone}-${seat.row_number || 'single'}`
    if (!organized.has(key)) {
      organized.set(key, [])
    }
    organized.get(key)!.push(seat)
  }
  
  // Sortează scaunele în fiecare rând după numărul scaunului
  for (const [key, rowSeats] of organized) {
    organized.set(
      key,
      rowSeats.sort((a, b) => {
        const aNum = a.seat_number || a.position_order || 0
        const bNum = b.seat_number || b.position_order || 0
        return aNum - bNum
      })
    )
  }
  
  return organized
}

function findConsecutiveSeats(
  seatsByZoneAndRow: Map<string, Seat[]>,
  size: number,
  availableSeats: Seat[]
): number[] {
  // Prioritizează rândurile din mijloc (7-11) pentru vizibilitate mai bună
  const preferredRows = [9, 10, 8, 11, 7, 12, 6, 13, 5, 14, 4, 15, 3, 16, 2, 17, 1]
  const zones = ['A', 'B']
  
  for (const row of preferredRows) {
    for (const zone of zones) {
      const key = `${zone}-${row}`
      const rowSeats = seatsByZoneAndRow.get(key) || []
      
      // Caută secvențe consecutive de scaune disponibile
      for (let i = 0; i <= rowSeats.length - size; i++) {
        const consecutive = rowSeats.slice(i, i + size)
        
        // Verifică dacă toate scaunele sunt consecutive numeric
        let isConsecutive = true
        for (let j = 1; j < consecutive.length; j++) {
          const currNum = consecutive[j].seat_number || consecutive[j].position_order || 0
          const prevNum = consecutive[j - 1].seat_number || consecutive[j - 1].position_order || 0
          if (currNum !== prevNum + 1) {
            isConsecutive = false
            break
          }
        }
        
        if (isConsecutive && consecutive.length === size) {
          return consecutive.map(s => s.id)
        }
      }
    }
  }
  
  return []
}

function findBalancedSingleSeat(
  seatsByZoneAndRow: Map<string, Seat[]>,
  currentAllocation: Map<string, number[]>
): number | null {
  // Calculează ocuparea fiecărei zone
  const occupancyByZone = calculateZoneOccupancy(currentAllocation, seatsByZoneAndRow)
  
  // Alege zona cu mai puțină ocupare
  const targetZone = occupancyByZone.A <= occupancyByZone.B ? 'A' : 'B'
  
  // Preferă rândurile din mijloc
  const preferredRows = [9, 10, 8, 11, 7, 12, 6, 13, 5, 14, 4, 15, 3, 16, 2, 17, 1]
  
  for (const row of preferredRows) {
    const key = `${targetZone}-${row}`
    const rowSeats = seatsByZoneAndRow.get(key) || []
    
    if (rowSeats.length > 0) {
      // Preferă scaunele din mijlocul rândului
      const middleIndex = Math.floor(rowSeats.length / 2)
      return rowSeats[middleIndex].id
    }
  }
  
  // Dacă nu găsește în zona preferată, încearcă cealaltă zonă
  const otherZone = targetZone === 'A' ? 'B' : 'A'
  for (const row of preferredRows) {
    const key = `${otherZone}-${row}`
    const rowSeats = seatsByZoneAndRow.get(key) || []
    
    if (rowSeats.length > 0) {
      const middleIndex = Math.floor(rowSeats.length / 2)
      return rowSeats[middleIndex].id
    }
  }
  
  return null
}

function calculateZoneOccupancy(
  allocation: Map<string, number[]>,
  seatsByZoneAndRow: Map<string, Seat[]>
): { A: number; B: number } {
  const occupancy = { A: 0, B: 0 }
  
  for (const [key, rowSeats] of seatsByZoneAndRow) {
    const zone = key.split('-')[0] as 'A' | 'B'
    occupancy[zone] += rowSeats.length
  }
  
  // Scade scaunele deja alocate
  for (const seatIds of allocation.values()) {
    for (const seatId of seatIds) {
      for (const [key, rowSeats] of seatsByZoneAndRow) {
        const zone = key.split('-')[0] as 'A' | 'B'
        if (rowSeats.some(s => s.id === seatId)) {
          occupancy[zone]--
        }
      }
    }
  }
  
  return occupancy
}

function removeSeatFromAvailable(
  seatsByZoneAndRow: Map<string, Seat[]>,
  seatId: number,
  availableSeats: Seat[]
): void {
  const seatIndex = availableSeats.findIndex(s => s.id === seatId)
  if (seatIndex !== -1) {
    const seat = availableSeats[seatIndex]
    const key = `${seat.zone}-${seat.row_number}`
    const rowSeats = seatsByZoneAndRow.get(key) || []
    const rowIndex = rowSeats.findIndex(s => s.id === seatId)
    if (rowIndex !== -1) {
      rowSeats.splice(rowIndex, 1)
    }
    availableSeats.splice(seatIndex, 1)
  }
}
