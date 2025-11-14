import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function App() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ title: '', sets: '', reps: '', day: '', notes: '' })
  const [filterDay, setFilterDay] = useState('')

  const days = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [])

  const fetchWorkouts = async (dayParam = '') => {
    try {
      setLoading(true)
      setError('')
      const url = dayParam ? `${API_BASE}/api/workouts?day=${encodeURIComponent(dayParam)}` : `${API_BASE}/api/workouts`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setWorkouts(data)
    } catch (e) {
      setError('Could not load workouts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkouts(filterDay)
  }, [filterDay])

  const addWorkout = async (e) => {
    e.preventDefault()
    try {
      setError('')
      const payload = {
        title: form.title.trim(),
        sets: form.sets ? Number(form.sets) : undefined,
        reps: form.reps ? Number(form.reps) : undefined,
        day: form.day || undefined,
        notes: form.notes || undefined,
        completed: false
      }
      const res = await fetch(`${API_BASE}/api/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to add')
      const created = await res.json()
      setWorkouts((prev) => [created, ...prev])
      setForm({ title: '', sets: '', reps: '', day: '', notes: '' })
    } catch (e) {
      setError('Could not add workout')
    }
  }

  const toggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`${API_BASE}/api/workouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      setWorkouts((prev) => prev.map((w) => (w.id === id ? updated : w)))
    } catch (e) {
      setError('Update failed')
    }
  }

  const removeWorkout = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/workouts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setWorkouts((prev) => prev.filter((w) => w.id !== id))
    } catch (e) {
      setError('Delete failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">Workout Plan</h1>
        <p className="text-emerald-700 mb-6">Plan your sessions like a simple to‑do list. Add exercises, set reps, and check them off.</p>

        <form onSubmit={addWorkout} className="bg-white shadow rounded-lg p-4 mb-6 grid sm:grid-cols-6 gap-3">
          <input
            className="sm:col-span-2 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Exercise (e.g., Squats)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Sets"
            type="number"
            min="1"
            value={form.sets}
            onChange={(e) => setForm({ ...form, sets: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Reps"
            type="number"
            min="1"
            value={form.reps}
            onChange={(e) => setForm({ ...form, reps: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
          >
            <option value="">Day</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            className="sm:col-span-2 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button className="sm:col-span-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded px-4 py-2 transition">Add Workout</button>
        </form>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-emerald-800">Filter by day:</label>
          <select
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
          >
            <option value="">All</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4">{error}</div>}

        {loading ? (
          <div className="text-emerald-700">Loading...</div>
        ) : workouts.length === 0 ? (
          <div className="text-emerald-700">No workouts yet. Add your first one above.</div>
        ) : (
          <ul className="space-y-2">
            {workouts.map((w) => (
              <li key={w.id} className="bg-white rounded-lg shadow p-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={!!w.completed}
                    onChange={() => toggleComplete(w.id, w.completed)}
                    className="mt-1 h-5 w-5 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-semibold text-emerald-900">{w.title}</div>
                    <div className="text-sm text-emerald-700">
                      {(w.sets ? `${w.sets} sets` : '')}
                      {w.sets && w.reps ? ' · ' : ''}
                      {(w.reps ? `${w.reps} reps` : '')}
                      {(w.day ? ` · ${w.day}` : '')}
                    </div>
                    {w.notes && <div className="text-sm text-emerald-600 mt-1">{w.notes}</div>}
                  </div>
                </div>
                <button onClick={() => removeWorkout(w.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
