import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function ServiceManager() {
  const [services, setServices] = useState([])
  const [newService, setNewService] = useState({ name: '', price: '', unit: 'kg' })
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState(null)
  
  // Edit State
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', unit: '' })

  useEffect(() => {
    fetchShopAndServices()
  }, [])

  const fetchShopAndServices = async () => {
    setLoading(true)
    // For now, we assume the first shop is the one we manage. 
    // In a real multi-tenant app, we'd get this from the user's profile.
    const { data: shops } = await supabase.from('shops').select('id').limit(1)
    
    if (shops && shops.length > 0) {
      const currentShopId = shops[0].id
      setShopId(currentShopId)
      
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', currentShopId)
        .order('name')
      
      setServices(servicesData || [])
    } else {
      // Create a default shop if none exists (for demo purposes)
      const { data: newShop } = await supabase
        .from('shops')
        .insert([{ name: 'My Laundry Shop' }])
        .select()
        .single()
      
      if (newShop) {
        setShopId(newShop.id)
      }
    }
    setLoading(false)
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    if (!shopId) {
      console.error("No shop ID found")
      return
    }

    console.log("Adding service:", newService)

    const { data, error } = await supabase
      .from('services')
      .insert([{ ...newService, shop_id: shopId }])
      .select()

    if (error) {
      console.error("Error adding service:", error)
      alert("Error adding service: " + error.message)
    }

    if (data) {
      console.log("Service added:", data)
      setServices([...services, data[0]])
      setNewService({ name: '', price: '', unit: 'kg' })
    }
  }

  const handleDeleteService = async (id) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (!error) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  const handleEditClick = (service) => {
    setEditingId(service.id)
    setEditForm({ name: service.name, price: service.price, unit: service.unit })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', price: '', unit: '' })
  }

  const handleUpdateService = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('services')
      .update({ name: editForm.name, price: editForm.price, unit: editForm.unit })
      .eq('id', editingId)

    if (!error) {
      setServices(services.map(s => s.id === editingId ? { ...s, ...editForm } : s))
      setEditingId(null)
    } else {
      alert('Error updating service: ' + error.message)
    }
  }

  if (loading) return <p>Loading services...</p>

  return (
    <div className="service-manager">
      <h3>Manage Services</h3>
      
      <ul className="service-list">
        {services.map(service => (
          <li key={service.id} className="service-item">
            {editingId === service.id ? (
              <form onSubmit={handleUpdateService} className="edit-service-form">
                <input 
                  type="text"
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  required 
                  placeholder="Service Name"
                />
                <input 
                  type="number" 
                  value={editForm.price} 
                  onChange={e => setEditForm({...editForm, price: e.target.value})} 
                  required 
                  placeholder="Price"
                />
                <select 
                  value={editForm.unit} 
                  onChange={e => setEditForm({...editForm, unit: e.target.value})}
                >
                  <option value="kg">kg</option>
                  <option value="piece">piece</option>
                  <option value="load">load</option>
                </select>
                <div className="edit-actions">
                  <button type="submit" className="save-btn">Save</button>
                  <button type="button" onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <span>{service.name} - ₱{service.price}/{service.unit}</span>
                <div className="service-actions">
                  <button onClick={() => handleEditClick(service)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDeleteService(service.id)} className="delete-btn">Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddService} className="add-service-form">
        <input
          type="text"
          placeholder="Service Name (e.g. Wash & Fold)"
          value={newService.name}
          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={newService.price}
          onChange={(e) => setNewService({ ...newService, price: e.target.value })}
          required
        />
        <select
          value={newService.unit}
          onChange={(e) => setNewService({ ...newService, unit: e.target.value })}
        >
          <option value="kg">per kg</option>
          <option value="load">per load</option>
          <option value="piece">per piece</option>
        </select>
        <button type="submit">Add Service</button>
      </form>
    </div>
  )
}
