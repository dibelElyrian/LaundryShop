import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import StaffDashboard from './pages/StaffDashboard'
import Tracker from './pages/Tracker'
import Receipt from './pages/Receipt'
import OfflineAlert from './components/OfflineAlert'
import './App.css'

function Home() {
  return (
    <div className="container">
      <h1>Laundry Shop Manager</h1>
      <p>Track your laundry status or manage your shop.</p>
      <div className="links">
        <Link to="/track">Customer Tracker</Link> | <Link to="/staff">Staff Dashboard</Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <OfflineAlert />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<Tracker />} />
        <Route path="/login" element={<Login />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/receipt/:orderId" element={<Receipt />} />
      </Routes>
    </Router>
  )
}

export default App
