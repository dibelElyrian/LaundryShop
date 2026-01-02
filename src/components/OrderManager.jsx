import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function OrderManager() {
  const [orders, setOrders] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState(null)
  
  // New Order Form State
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    // Get Shop ID
    const { data: shops } = await supabase.from('shops').select('id').limit(1)
    if (shops && shops.length > 0) {
      const currentShopId = shops[0].id
      setShopId(currentShopId)

      // Get Services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', currentShopId)
      setServices(servicesData || [])
      if (servicesData && servicesData.length > 0) {
        setSelectedServiceId(servicesData[0].id)
      }

      // Get Active Orders
      fetchOrders(currentShopId)
    }
    setLoading(false)
  }

  const fetchOrders = async (currentShopId) => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        *,
        customers (name, phone),
        order_items (
          quantity,
          services (name, unit)
        )
      `)
      .eq('shop_id', currentShopId)
      .neq('status', 'completed') // Hide completed orders for now
      .order('created_at', { ascending: false })
    
    setOrders(ordersData || [])
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    if (!shopId || !selectedServiceId) return

    // 1. Create or Get Customer
    // For simplicity, we just create a new customer record every time or find by phone
    // In a real app, we'd have a better customer lookup
    let customerId
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customerPhone)
      .eq('shop_id', shopId)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert([{ shop_id: shopId, name: customerName, phone: customerPhone }])
        .select()
        .single()
      customerId = newCustomer.id
    }

    // 2. Calculate Price
    const service = services.find(s => s.id === selectedServiceId)
    const totalPrice = service.price * quantity

    // 3. Create Order
    const { data: newOrder } = await supabase
      .from('orders')
      .insert([{
        shop_id: shopId,
        customer_id: customerId,
        status: 'pending',
        total_price: totalPrice,
        payment_status: 'unpaid'
      }])
      .select()
      .single()

    // 4. Create Order Item
    await supabase
      .from('order_items')
      .insert([{
        order_id: newOrder.id,
        service_id: selectedServiceId,
        quantity: quantity,
        price_at_time: service.price
      }])

    // Refresh Orders
    fetchOrders(shopId)
    
    // Reset Form
    setCustomerName('')
    setCustomerPhone('')
    setQuantity(1)
  }

  const updateStatus = async (orderId, newStatus) => {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    
    fetchOrders(shopId)
  }

  const updatePayment = async (orderId, paymentStatus, paymentMethod) => {
    await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        payment_method: paymentMethod
      })
      .eq('id', orderId)
    
    fetchOrders(shopId)
  }

  if (loading) return <p>Loading orders...</p>

  return (
    <div className="order-manager">
      <div className="create-order-section">
        <h3>New Order</h3>
        <form onSubmit={handleCreateOrder} className="create-order-form">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
          />
          <div className="service-selection">
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (₱{s.price}/{s.unit})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <button type="submit">Create Order</button>
        </form>
      </div>

      <div className="active-orders-section">
        <h3>Active Orders</h3>
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.id} className={`order-card status-${order.status}`}>
              <div className="order-header">
                <strong>#{order.id.slice(0, 8)}</strong>
                <span className="order-price">₱{order.total_price}</span>
              </div>
              <div className="customer-info">
                <p>{order.customers?.name}</p>
                <p>{order.customers?.phone}</p>
                <a href={`/receipt/${order.id}`} target="_blank" rel="noopener noreferrer" className="receipt-link">
                  📄 View Receipt
                </a>
              </div>
              <div className="order-items">
                {order.order_items?.map(item => (
                  <div key={item.id}>
                    {item.quantity} x {item.services?.name}
                  </div>
                ))}
              </div>
              <div className="status-control">
                <label>Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="washing">Washing</option>
                  <option value="drying">Drying</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="payment-control">
                <label>Payment:</label>
                <select
                  value={order.payment_status}
                  onChange={(e) => updatePayment(order.id, e.target.value, order.payment_method || 'cash')}
                  className={`payment-${order.payment_status}`}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
                
                {order.payment_status !== 'unpaid' && (
                  <select
                    value={order.payment_method || 'cash'}
                    onChange={(e) => updatePayment(order.id, order.payment_status, e.target.value)}
                    className="payment-method-select"
                  >
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="maya">Maya</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
