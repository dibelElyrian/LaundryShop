import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import ServiceManager from '../components/ServiceManager'
import OrderManager from '../components/OrderManager'
import MachineManager from '../components/MachineManager'

export default function StaffDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
      }
      setLoading(false)
    }
    checkSession()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="container">
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/" className="back-link" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>Home</Link>
          <h2>Staff Dashboard</h2>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </header>
      
      <div className="dashboard-tabs">
        <button onClick={() => setActiveTab('orders')} disabled={activeTab === 'orders'}>Orders</button>
        <button onClick={() => setActiveTab('machines')} disabled={activeTab === 'machines'}>Machines</button>
        <button onClick={() => setActiveTab('services')} disabled={activeTab === 'services'}>Services</button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'machines' && <MachineManager />}
        {activeTab === 'services' && <ServiceManager />}
      </div>
    </div>
  )
}
