import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Receipt() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        shops (name, address, phone),
        customers (name, phone),
        order_items (
          quantity,
          price_at_time,
          services (name, unit)
        )
      `)
      .eq('id', orderId)
      .single()
    
    if (data) setOrder(data)
    setLoading(false)
  }

  if (loading) return <p>Loading receipt...</p>
  if (!order) return <p>Order not found.</p>

  return (
    <div className="receipt-container">
      <div className="receipt-paper">
        <div className="receipt-header">
          <h2>{order.shops?.name}</h2>
          <p>{order.shops?.address}</p>
          <p>Tel: {order.shops?.phone}</p>
          <hr />
          <h3>OFFICIAL RECEIPT</h3>
          <p>Order #: {order.id.slice(0, 8)}</p>
          <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
        </div>

        <div className="receipt-customer">
          <p><strong>Customer:</strong> {order.customers?.name}</p>
          <p><strong>Phone:</strong> {order.customers?.phone}</p>
        </div>

        <table className="receipt-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item, index) => (
              <tr key={index}>
                <td>{item.services?.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price_at_time}</td>
                <td>{item.quantity * item.price_at_time}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-total">
          <hr />
          <div className="total-row">
            <span>TOTAL:</span>
            <span>₱{order.total_price}</span>
          </div>
          <div className="payment-info">
            <p>Status: {order.payment_status.toUpperCase()}</p>
            {order.payment_method && <p>Method: {order.payment_method.toUpperCase()}</p>}
          </div>
        </div>

        <div className="receipt-footer">
          <p>Thank you for your business!</p>
          <p>Track your laundry at:</p>
          <p className="website-url">{window.location.origin}/track</p>
        </div>
      </div>

      <div className="no-print">
        <button onClick={() => window.print()}>Print Receipt</button>
        <Link to="/staff" className="back-link">Back to Dashboard</Link>
      </div>
    </div>
  )
}
