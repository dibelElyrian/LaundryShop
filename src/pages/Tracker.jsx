import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function Tracker() {
  const [searchQuery, setSearchQuery] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const { data, error } = await supabase
        .rpc('get_order_status', { search_input: searchQuery })
        .single()

      if (error) throw error

      if (data) {
        setOrder(data)
      } else {
        setError("No active order found for this ID or Phone Number.")
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      setError("No active order found for this ID or Phone Number.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
      <h2>Track Your Laundry</h2>
      <p>Enter your Order ID or Phone Number to check status.</p>

      <form onSubmit={handleSearch} className="tracker-form">
        <input
          type="text"
          placeholder="e.g. 550e8400... or 09171234567"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Track Now'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {order && (
        <div className={`status-card status-${order.status}`}>
          <div className="status-header">
            <h3>Status: {order.status.toUpperCase()}</h3>
          </div>
          
          <div className="status-details">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Customer:</strong> {order.customer_name}</p>
            <p><strong>Total:</strong> ₱{order.total_price}</p>
            <p><strong>Payment:</strong> {order.payment_status ? order.payment_status.toUpperCase() : 'PENDING'}</p>
          </div>

          <div className="status-items">
            <h4>Items:</h4>
            <ul>
              {order.items?.map((item, index) => (
                <li key={index}>
                  {item.quantity} x {item.service_name} ({item.unit})
                </li>
              ))}
            </ul>
          </div>

          {order.status === 'ready' && (
            <div className="ready-message">
              🎉 Your laundry is ready for pickup!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
