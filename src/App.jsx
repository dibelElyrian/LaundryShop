import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
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

function Tracker() {
  return <h2>Customer Tracker (Coming Soon)</h2>
}

function StaffDashboard() {
  return <h2>Staff Dashboard (Coming Soon)</h2>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<Tracker />} />
        <Route path="/staff" element={<StaffDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
