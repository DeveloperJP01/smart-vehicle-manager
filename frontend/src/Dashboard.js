import React, { useState, useEffect } from 'react';

function Dashboard({ token }) {
  const [stats, setStats] = useState({ fleetSize: 0, activeServices: 0, criticalAlerts: 0, completedBilling: 0 });
  const [diagnostics, setDiagnostics] = useState([]);
  const [users, setUsers] = useState([]); const [vehicles, setVehicles] = useState([]); const [mechanics, setMechanics] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ customerId: '', vehicleId: '', mechanicId: '', serviceType: '', appointmentDate: '', aftermarketMods: '', referencePhoto: null });

  const fetchAllData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    const [statRes, diagRes, uRes, vRes, mRes, tRes] = await Promise.all([
      fetch('/api/dashboard', { headers }), fetch('/api/diagnostics', { headers }),
      fetch('/api/users', { headers }), fetch('/api/vehicles', { headers }),
      fetch('/api/mechanics', { headers }), fetch('/api/services', { headers })
    ]);
    if(statRes.ok) setStats(await statRes.json());
    if(diagRes.ok) setDiagnostics(await diagRes.json());
    if(uRes.ok) setUsers(await uRes.json());
    if(vRes.ok) setVehicles(await vRes.json());
    if(mRes.ok) setMechanics(await mRes.json());
    if(tRes.ok) setTickets(await tRes.json());
  };

  useEffect(() => { fetchAllData(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => { if (formData[key]) dataToSend.append(key, formData[key]); });
    await fetch('/api/services', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: dataToSend });
    setFormData({ customerId: '', vehicleId: '', mechanicId: '', serviceType: '', appointmentDate: '', aftermarketMods: '', referencePhoto: null });
    fetchAllData();
  };

  const handleUpdateStatus = async (id, status) => {
    await fetch(`/api/services/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'text/plain', 'Authorization': `Bearer ${token}` }, body: status });
    fetchAllData();
  };

  const availableVehicles = formData.customerId ? vehicles.filter(v => v.owner.id === Number(formData.customerId)) : [];
  const displayedTickets = tickets.filter(t => t.status !== 'Completed').sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. AUTOSENSE KPI CARDS (TOP) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.9em', textTransform: 'uppercase' }}>Vehicles Fleet</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#fff' }}>{stats.fleetSize}</div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #fbbf24' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.9em', textTransform: 'uppercase' }}>Active Work Orders</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#fff' }}>{stats.activeServices}</div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.9em', textTransform: 'uppercase' }}>Critical Alerts</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#ef4444' }}>{stats.criticalAlerts}</div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.9em', textTransform: 'uppercase' }}>Completed Billing</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#10b981' }}>₹{stats.completedBilling.toFixed(2)}</div>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT GRID (BOTTOM) */}
      <div className="dashboard-grid">
        
        {/* LEFT: BOOKING FORM */}
        <div className="card">
          <h2>Book a New Service</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Customer</label>
              <select name="customerId" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value, vehicleId: ''})} required><option value="">Select Customer</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select>
            </div>
            <div className="input-group">
              <label>Vehicle</label>
              <select name="vehicleId" value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} required disabled={!formData.customerId}><option value="">{!formData.customerId ? 'Select Customer First' : 'Select Vehicle'}</option>{availableVehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} - {v.makeAndModel}</option>)}</select>
            </div>
            <div className="input-group">
              <label>Technician</label>
              <select name="mechanicId" value={formData.mechanicId} onChange={e => setFormData({...formData, mechanicId: e.target.value})}><option value="">Any Available</option>{mechanics.map(m => <option key={m.id} value={m.id}>{m.name} ({m.specialization})</option>)}</select>
            </div>
            <div className="input-group">
              <label>Service Type</label>
              <input name="serviceType" placeholder="e.g. Engine Diagnostics" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Preferred Date</label>
              <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required />
            </div>
            <div className="input-group">
              <label>Notes & Modifications</label>
              <textarea name="aftermarketMods" placeholder="Add additional notes..." value={formData.aftermarketMods} onChange={e => setFormData({...formData, aftermarketMods: e.target.value})} rows="2" />
            </div>
            <div className="file-upload-group">
              <label>Reference Attachment</label>
              <input type="file" accept="image/*" onChange={e => setFormData({...formData, referencePhoto: e.target.files[0]})} />
            </div>
            <button type="submit">Create Booking</button>
          </form>
        </div>

        {/* RIGHT: TABLES STACKED */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Queue Table */}
          <div className="card">
            <h2>Active Queue</h2>
            <table>
              <thead><tr><th>Order ID</th><th>Customer</th><th>Vehicle</th><th>Service Type</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{displayedTickets.map(t => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>{t.customer.fullName}</td>
                  <td>{t.vehicle.licensePlate}<br/><span style={{fontSize:'0.85em', color:'#9ca3af'}}>{t.vehicle.makeAndModel}</span></td>
                  <td>{t.serviceType}{t.aftermarketMods && <><br/><span className="mod-badge">Custom</span></>}</td>
                  <td><span className={`status ${t.status.toLowerCase()}`}>{t.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      {t.status === 'Pending' && <button className="btn-sm btn-progress" onClick={() => handleUpdateStatus(t.id, 'In-Progress')}>Start</button>}
                      {t.status === 'In-Progress' && <button className="btn-sm btn-complete" onClick={() => handleUpdateStatus(t.id, 'Completed')}>Complete</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {displayedTickets.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', color:'#9ca3af'}}>No active orders.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Smart Health Table */}
          <div className="card">
            <h2>Smart Health Overview</h2>
            <table>
              <thead><tr><th>Vehicle</th><th>Odometer</th><th>Status</th><th>Active Alerts</th></tr></thead>
              <tbody>
                {diagnostics.map((d, i) => (
                  <tr key={i}>
                    <td>{d.vehicle.licensePlate}<br/><span style={{fontSize:'0.85em', color:'#9ca3af'}}>{d.vehicle.makeAndModel}</span></td>
                    <td>{d.vehicle.currentOdometer} km</td>
                    <td><span className={`status ${d.status.toLowerCase() === 'optimal' ? 'completed' : d.status.toLowerCase() === 'warning' ? 'pending' : 'critical'}`} style={d.status === 'CRITICAL' ? {background:'rgba(239, 68, 68, 0.15)', color:'#ef4444', border:'1px solid rgba(239, 68, 68, 0.3)'} : {}}>{d.status}</span></td>
                    <td style={{color: '#9ca3af', fontSize: '0.9em'}}>{d.alerts.length > 0 ? d.alerts.join(', ') : 'All systems normal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
export default Dashboard;
