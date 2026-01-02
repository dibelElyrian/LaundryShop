import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function MachineManager() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState(null)
  const [, setTick] = useState(0) // Used to force re-render for timer

  useEffect(() => {
    fetchShopAndMachines()
    
    // Update timers every 30 seconds
    const timer = setInterval(() => {
      setTick(t => t + 1)
    }, 30000)

    return () => clearInterval(timer)
  }, [])

  const fetchShopAndMachines = async () => {
    setLoading(true)
    const { data: shops } = await supabase.from('shops').select('id').limit(1)
    
    if (shops && shops.length > 0) {
      const currentShopId = shops[0].id
      setShopId(currentShopId)
      fetchMachines(currentShopId)
    }
    setLoading(false)
  }

  const fetchMachines = async (currentShopId) => {
    const { data } = await supabase
      .from('machines')
      .select('*')
      .eq('shop_id', currentShopId)
      .order('name')
    
    setMachines(data || [])
  }

  const handleAddMachine = async () => {
    if (!shopId) return
    const name = prompt("Enter Machine Name (e.g. Washer 1):")
    const type = prompt("Enter Type (washer/dryer):")
    
    if (name && type) {
      const { error } = await supabase
        .from('machines')
        .insert([{ shop_id: shopId, name, type: type.toLowerCase() }])
      
      if (!error) fetchMachines(shopId)
    }
  }

  const updateStatus = async (id, status) => {
    const updates = { status }
    if (status === 'in_use') {
      updates.started_at = new Date().toISOString()
      updates.duration_minutes = 45 // Default duration, could be dynamic
    } else {
      updates.started_at = null
      updates.duration_minutes = 0
    }

    await supabase.from('machines').update(updates).eq('id', id)
    fetchMachines(shopId)
  }

  const calculateTimeLeft = (startedAt, duration) => {
    if (!startedAt || !duration) return null
    const start = new Date(startedAt).getTime()
    const now = new Date().getTime()
    const end = start + (duration * 60 * 1000)
    const left = Math.ceil((end - now) / (1000 * 60))
    return left > 0 ? left : 0
  }

  if (loading) return <p>Loading machines...</p>

  return (
    <div className="machine-manager">
      <div className="machine-header">
        <h3>Machine Status</h3>
        <button onClick={handleAddMachine}>+ Add Machine</button>
      </div>

      <div className="machines-grid">
        {machines.map(machine => {
          const timeLeft = machine.status === 'in_use' 
            ? calculateTimeLeft(machine.started_at, machine.duration_minutes) 
            : null

          return (
            <div key={machine.id} className={`machine-card type-${machine.type} status-${machine.status}`}>
              <div className="machine-icon">
                {machine.type === 'washer' ? '🧺' : '💨'}
              </div>
              <h4>{machine.name}</h4>
              <p className="machine-status">{machine.status.replace('_', ' ').toUpperCase()}</p>
              
              {timeLeft !== null && (
                <p className="timer">{timeLeft} mins left</p>
              )}

              <div className="machine-controls">
                {machine.status === 'available' && (
                  <button onClick={() => updateStatus(machine.id, 'in_use')}>Start</button>
                )}
                {machine.status === 'in_use' && (
                  <button onClick={() => updateStatus(machine.id, 'available')}>Finish</button>
                )}
                <button 
                  className="maintenance-btn"
                  onClick={() => updateStatus(machine.id, machine.status === 'maintenance' ? 'available' : 'maintenance')}
                >
                  {machine.status === 'maintenance' ? 'Fix' : '⚠️'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
