import { useState, useEffect } from 'react'
import FlyerList from './components/FlyerList'
import FlyerForm from './components/FlyerForm'
import SearchBar from './components/SearchBar'
import Loader from './components/Loader'
import EmptyState from './components/EmptyState'
import ErrorMessage from './components/ErrorMessage'
import {
  getFlyers,
  addFlyer,
  updateFlyer,
  deleteFlyer,
  DEFAULT_MOCK_FLYERS,
} from './services/flyerService'
import { logAnalyticsInteraction } from './utils/analytics'
import { sanitizeInput } from './utils/sanitize'

/**
 * Main Frequent Flyer Portal Application component.
 */
export default function App({ initialFlyers, simulateServiceError = false }) {
  const [flyers, setFlyers] = useState(
    initialFlyers !== undefined ? initialFlyers : DEFAULT_MOCK_FLYERS
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFlyer, setEditingFlyer] = useState(null)
  const [retryTrigger, setRetryTrigger] = useState(0)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    let isMounted = true

    if (simulateServiceError) {
      const timer = setTimeout(() => {
        if (isMounted) {
          setError('Failed to fetch flyers. Service is currently unavailable.')
          setLoading(false)
        }
      }, 40)
      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    }

    if (initialFlyers !== undefined) {
      const timer = setTimeout(() => {
        if (isMounted) {
          setFlyers(initialFlyers)
          setLoading(false)
        }
      }, 40)
      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    }

    getFlyers(40)
      .then((data) => {
        if (isMounted) {
          setFlyers(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load flyers.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [initialFlyers, simulateServiceError, retryTrigger])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setRetryTrigger((prev) => prev + 1)
  }

  const handleOpenAddModal = () => {
    setEditingFlyer(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (flyer) => {
    setEditingFlyer(flyer)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFlyer(null)
  }

  /**
   * Applies a change to the list immediately (optimistic update), then saves it
   * in the background. If saving fails, the change is rolled back and an error
   * with a Retry button is shown, so staff never believe unsaved data was saved.
   */
  const runMutation = (op) => {
    setSaveError(null)
    setFlyers(op.apply)
    op.persist().catch(() => {
      setFlyers(op.rollback)
      setSaveError({
        message: op.failMessage,
        retry: () => runMutation(op),
      })
    })
  }

  const handleSaveFlyer = (savedData) => {
    // Sanitize before storing in state
    const cleanFlyer = {
      ...savedData,
      name: sanitizeInput(savedData.name),
      email: sanitizeInput(savedData.email),
      membershipNumber: sanitizeInput(savedData.membershipNumber),
      tier: savedData.tier,
      points: Number(savedData.points),
    }

    // Close modal synchronously to unmount form inputs
    setIsModalOpen(false)

    if (editingFlyer) {
      const original = editingFlyer
      const updated = { ...original, ...cleanFlyer }
      setEditingFlyer(null)
      logAnalyticsInteraction()

      runMutation({
        apply: (prev) => prev.map((f) => (f.id === original.id ? updated : f)),
        rollback: (prev) => prev.map((f) => (f.id === original.id ? original : f)),
        persist: () => updateFlyer(original.id, updated),
        failMessage: 'Could not save your changes. The flyer was restored. Please try again.',
      })
    } else {
      const created = {
        ...cleanFlyer,
        id: `ff-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      }
      logAnalyticsInteraction()

      runMutation({
        apply: (prev) => [created, ...prev],
        rollback: (prev) => prev.filter((f) => f.id !== created.id),
        persist: () => addFlyer(created),
        failMessage: 'Could not add the flyer. Nothing was saved. Please try again.',
      })
    }
  }

  const handleDeleteFlyer = (id) => {
    const index = flyers.findIndex((f) => f.id === id)
    const removed = flyers[index]
    if (!removed) return
    logAnalyticsInteraction()

    runMutation({
      apply: (prev) => prev.filter((f) => f.id !== id),
      rollback: (prev) => {
        if (prev.some((f) => f.id === id)) return prev
        const next = [...prev]
        next.splice(Math.min(index, next.length), 0, removed)
        return next
      },
      persist: () => deleteFlyer(id),
      failMessage: 'Could not delete the flyer. It was restored. Please try again.',
    })
  }

  const filteredFlyers = flyers.filter((f) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.email && f.email.toLowerCase().includes(q)) ||
      (f.membershipNumber && f.membershipNumber.toLowerCase().includes(q)) ||
      (f.tier && f.tier.toLowerCase().includes(q))
    )
  })

  return (
    <div className="portal-container">
      <header className="portal-header">
        <h1>Frequent Flyer Portal</h1>
      </header>

      <main className="portal-main">
        <section className="portal-controls" aria-label="Portal Controls">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <button
            type="button"
            aria-label="Add Flyer"
            className="btn btn-primary btn-add"
            onClick={handleOpenAddModal}
          >
            Add Flyer
          </button>
        </section>

        {loading && <Loader />}
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}
        {saveError && (
          <ErrorMessage message={saveError.message} onRetry={saveError.retry} />
        )}

        {!error && (
          <section
            className="portal-content"
            aria-label="Frequent Flyers Section"
          >
            {filteredFlyers.length === 0 ? (
              <EmptyState message="No data found" />
            ) : (
              <FlyerList
                flyers={filteredFlyers}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteFlyer}
              />
            )}
          </section>
        )}
      </main>

      {isModalOpen && (
        <FlyerForm
          initialData={editingFlyer}
          onSave={handleSaveFlyer}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
