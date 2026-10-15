const STORAGE_KEY = 'frequent_flyer_portal_flyers'

export const DEFAULT_MOCK_FLYERS = [
  {
    id: 'ff-002',
    name: 'Charles Lindbergh',
    email: 'charles.lindbergh@airline.com',
    membershipNumber: 'FF-100201',
    tier: 'Gold',
    points: 62000,
  },
  {
    id: 'ff-003',
    name: 'Bessie Coleman',
    email: 'bessie.coleman@airline.com',
    membershipNumber: 'FF-100202',
    tier: 'Silver',
    points: 34000,
  },
]

const getFreshMockFlyers = () => DEFAULT_MOCK_FLYERS.map((f) => ({ ...f }))

let memoryFallback = null

const readStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      const initial = getFreshMockFlyers()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
  } catch {
    // Fall back to memory
  }

  if (!memoryFallback) {
    memoryFallback = getFreshMockFlyers()
  }
  return memoryFallback
}

const writeStorage = (flyers) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flyers))
    }
  } catch {
    // Fall back to memory
  }
  memoryFallback = flyers
}

/**
 * Simulates async fetch with network latency.
 */
export const getFlyers = (delay = 20) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(readStorage())
    }, delay)
  })
}

/**
 * Simulates async flyer addition.
 */
export const addFlyer = (flyerData, delay = 20) => {
  return new Promise((resolve) => {
    const current = readStorage()
    const newFlyer = {
      ...flyerData,
      id: flyerData.id || `ff-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      points: Number(flyerData.points),
    }
    const updated = [newFlyer, ...current]
    writeStorage(updated)
    setTimeout(() => {
      resolve(newFlyer)
    }, delay)
  })
}

/**
 * Simulates async flyer update.
 */
export const updateFlyer = (id, flyerData, delay = 20) => {
  return new Promise((resolve, reject) => {
    const current = readStorage()
    const index = current.findIndex((f) => f.id === id)
    if (index === -1) {
      reject(new Error(`Flyer with id ${id} not found`))
      return
    }
    const updatedFlyer = {
      ...current[index],
      ...flyerData,
      id,
      points: Number(flyerData.points),
    }
    const updatedList = [...current]
    updatedList[index] = updatedFlyer
    writeStorage(updatedList)
    setTimeout(() => {
      resolve(updatedFlyer)
    }, delay)
  })
}

/**
 * Simulates async flyer deletion.
 */
export const deleteFlyer = (id, delay = 20) => {
  return new Promise((resolve) => {
    const current = readStorage()
    const updatedList = current.filter((f) => f.id !== id)
    writeStorage(updatedList)
    setTimeout(() => {
      resolve({ success: true, id })
    }, delay)
  })
}

/**
 * Resets local storage to default seeded flyers.
 */
export const resetFlyers = () => {
  memoryFallback = null
  writeStorage(getFreshMockFlyers())
}
