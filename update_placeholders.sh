#!/bin/bash

# Update the placeholder text in frontend/src/Pages.js
cat << 'EOF' > frontend/src/Pages.js
import React, { useState, useEffect } from 'react';

export const Overview = ({ token }) => {
  const [stats, setStats] = useState({ fleetSize: 0, activeServices: 0, criticalAlerts: 0, completedBilling: 0 });
  useEffect(() => { fetch('/api/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setStats); }, [token]);
  return (
    <div>
      <div className="page-header"><h1>Overview</h1></div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-icon total">🚘</div><div className="kpi-data"><span className="kpi-val">{stats.fleetSize}</span><span className="kpi-label">Total Fleet</span></div></div>
        <div className="kpi-card"><div className="kpi-icon warning">🔧</div><div className="kpi-data"><span className="kpi-val">{stats.activeServices}</span><span className="kpi-label">Active Orders</span></div></div>
        <div className="kpi-card"><div className="kpi-icon critical">!</div><div className="kpi-data"><span className="kpi-val">{stats.criticalAlerts}</span><span className="kpi-label">Critical Alerts</span></div></div>
        <div className="kpi-card"><div className="kpi-icon healthy">$</div><div className="kpi-data"><span className="kpi-val">₹{stats.completedBilling}</span><span className="kpi-label">Revenue</span></div></div>
      </div>
    </div>
  );
};

export const Vehicles = ({ token }) => {
  const [vehicles, setVehicles] = useState([]); const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ makeAndModel: '', licensePlate: '', color: '', currentOdometer: '', ownerId: '' });

  const fetchData = () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    fetch('/api/vehicles', { headers }).then(r => r.json()).then(setVehicles);
    fetch('/api/users', { headers }).then(r => r.json()).then(setUsers);
  };
  useEffect(() => { fetchData(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/vehicles', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({...formData, currentOdometer: Number(formData.currentOdometer)}) });
    setFormData({ makeAndModel: '', licensePlate: '', color: '', currentOdometer: '', ownerId: '' });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) fetchData(); else alert(await res.text());
  };

  return (
    <div>
      <div className="page-header"><h1>Vehicles Registry</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="data-card" style={{ padding: '20px' }}>
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px', fontSize:'1.1em'}}>Register Vehicle</h2>
          <form onSubmit={handleSubmit} style={{padding:0, gap:'12px'}}>
            <div className="input-group"><label>Owner / Driver</label><select value={formData.ownerId} onChange={e => setFormData({...formData, ownerId: e.target.value})} required><option value="">Select Owner</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select></div>
            <div className="input-group"><label>Make & Model</label><input placeholder="e.g. Bajaj Platina 2017" value={formData.makeAndModel} onChange={e => setFormData({...formData, makeAndModel: e.target.value})} required /></div>
            <div className="input-group"><label>License Plate</label><input placeholder="e.g. MH-15-AB-1234" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} required /></div>
            <div className="input-group"><label>Color</label><input placeholder="e.g. matt red" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} required /></div>
            <div className="input-group"><label>Current Odometer (km)</label><input type="number" placeholder="e.g. 15000" value={formData.currentOdometer} onChange={e => setFormData({...formData, currentOdometer: e.target.value})} required /></div>
            <button type="submit" className="primary" style={{marginTop:'10px'}}>Register Vehicle</button>
          </form>
        </div>
        <div className="data-card">
          <table><thead><tr><th>ID</th><th>License Plate</th><th>Model</th><th>Color</th><th>Owner</th><th>Odometer</th><th>Action</th></tr></thead>
          <tbody>{vehicles.map(v => <tr key={v.id}><td>#{v.id}</td><td style={{fontWeight:'bold'}}>{v.licensePlate}</td><td>{v.makeAndModel}</td><td>{v.color}</td><td>{v.owner?.fullName}</td><td>{v.currentOdometer} km</td>
          <td><button onClick={() => handleDelete(v.id)} style={{background:'#ef4444', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8em', fontWeight:'bold'}}>Delete</button></td>
          </tr>)}</tbody></table>
        </div>
      </div>
    </div>
  );
};

export const SmartHealth = ({ token }) => {
  const [diagnostics, setDiagnostics] = useState([]);
  useEffect(() => { fetch('/api/diagnostics', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setDiagnostics); }, [token]);
  const critical = diagnostics.filter(d => d.status === 'CRITICAL').length; const warning = diagnostics.filter(d => d.status === 'WARNING').length; const healthy = diagnostics.filter(d => d.status === 'OPTIMAL').length;
  return (
    <div>
      <div className="page-header"><h1>🛡️ Smart Health</h1><div className="live-indicator"><div className="live-dot"></div> Live</div></div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-icon critical">!</div><div className="kpi-data"><span className="kpi-val">{critical}</span><span className="kpi-label">Critical</span></div></div>
        <div className="kpi-card"><div className="kpi-icon warning">⚠</div><div className="kpi-data"><span className="kpi-val">{warning}</span><span className="kpi-label">Warning</span></div></div>
        <div className="kpi-card"><div className="kpi-icon healthy">✓</div><div className="kpi-data"><span className="kpi-val">{healthy}</span><span className="kpi-label">Healthy</span></div></div>
        <div className="kpi-card"><div className="kpi-icon total">⚙</div><div className="kpi-data"><span className="kpi-val">{diagnostics.length}</span><span className="kpi-label">Total</span></div></div>
      </div>
      <div className="data-card">
        {diagnostics.map((d, i) => (
          <div className="health-row" key={i}>
            <div className="vehicle-thumb">🚙</div><div><div className="v-plate">{d.vehicle.licensePlate}</div><div className="v-model">{d.vehicle.makeAndModel} ({d.vehicle.color})</div></div>
            <div><span className={`badge ${d.status === 'OPTIMAL' ? 'healthy' : d.status.toLowerCase()}`}>{d.status === 'OPTIMAL' ? 'Healthy' : d.status}</span></div>
            <ul className="alert-list">{d.alerts.length === 0 ? <li><span className="alert-dot" style={{background:'#10b981'}}></span> All normal</li> : d.alerts.map((a, j) => <li key={j}><span className={`alert-dot ${d.status}`}></span> {a}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Alerts = ({ token }) => {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { fetch('/api/diagnostics', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(data => setAlerts(data.filter(d => d.alerts.length > 0))); }, [token]);
  return (
    <div>
      <div className="page-header"><h1>Alerts Log</h1></div>
      <div className="data-card">
        <table><thead><tr><th>Vehicle</th><th>Severity</th><th>Alert Details</th></tr></thead>
        <tbody>{alerts.map((a, i) => <tr key={i}><td>{a.vehicle.licensePlate}</td><td><span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span></td><td>{a.alerts.join(', ')}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
};

export const Maintenance = ({ token }) => {
  const [users, setUsers] = useState([]); const [vehicles, setVehicles] = useState([]); const [mechanics, setMechanics] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ customerId: '', vehicleId: '', mechanicId: '', serviceType: '', appointmentDate: '', aftermarketMods: '', referencePhoto: null });

  const fetchAllData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    const [uRes, vRes, mRes, tRes] = await Promise.all([ fetch('/api/users', { headers }), fetch('/api/vehicles', { headers }), fetch('/api/mechanics', { headers }), fetch('/api/services', { headers }) ]);
    if(uRes.ok) setUsers(await uRes.json()); if(vRes.ok) setVehicles(await vRes.json()); if(mRes.ok) setMechanics(await mRes.json()); if(tRes.ok) setTickets(await tRes.json());
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
  const availableVehicles = formData.customerId ? vehicles.filter(v => v.owner?.id === Number(formData.customerId)) : [];
  const displayedTickets = tickets.filter(t => t.status !== 'Completed').sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  return (
    <div>
      <div className="page-header"><h1>🔧 Maintenance Operations</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="data-card" style={{ padding: '20px' }}>
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px', fontSize:'1.1em'}}>Book a New Service</h2>
          <form onSubmit={handleSubmit} style={{padding:0, gap:'12px'}}>
            <div className="input-group"><label>Customer</label><select name="customerId" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value, vehicleId: ''})} required><option value="">Select Customer</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select></div>
            <div className="input-group"><label>Vehicle</label><select name="vehicleId" value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} required disabled={!formData.customerId}><option value="">{!formData.customerId ? 'Select Customer First' : 'Select Vehicle'}</option>{availableVehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} - {v.makeAndModel}</option>)}</select></div>
            <div className="input-group"><label>Technician</label><select name="mechanicId" value={formData.mechanicId} onChange={e => setFormData({...formData, mechanicId: e.target.value})}><option value="">Any Available</option>{mechanics.map(m => <option key={m.id} value={m.id}>{m.name} ({m.specialization})</option>)}</select></div>
            <div className="input-group"><label>Service Type</label><input name="serviceType" placeholder="e.g. Engine Diagnostics" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} required /></div>
            <div className="input-group"><label>Preferred Date</label><input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required /></div>
            <button type="submit" className="primary" style={{marginTop:'10px'}}>Create Booking</button>
          </form>
        </div>
        <div className="data-card">
          <table><thead><tr><th>Order ID</th><th>Customer</th><th>Vehicle</th><th>Service</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{displayedTickets.map(t => (
            <tr key={t.id}><td>#{t.id}</td><td>{t.customer.fullName}</td><td><div style={{fontWeight:'bold'}}>{t.vehicle.licensePlate}</div></td><td>{t.serviceType}</td><td><span className={`badge ${t.status==='Pending'?'warning':'healthy'}`}>{t.status}</span></td>
              <td>
                <div style={{display:'flex', gap:'8px'}}>
                  {t.status === 'Pending' && <button onClick={() => handleUpdateStatus(t.id, 'In-Progress')} style={{background:'#3b82f6', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}>Start</button>}
                  {t.status === 'In-Progress' && <button onClick={() => handleUpdateStatus(t.id, 'Completed')} style={{background:'#10b981', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}>Complete</button>}
                </div>
              </td>
            </tr>
          ))}</tbody></table>
        </div>
      </div>
    </div>
  );
};

export const Reports = () => ( <div><div className="page-header"><h1>Reports</h1></div><div className="data-card" style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}><h2>Service Reports</h2></div></div> );
export const Geofences = () => ( <div><div className="page-header"><h1>Geofences</h1></div><div className="data-card" style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}><h2>GPS Module</h2></div></div> );

export const Drivers = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });

  const fetchUsers = () => fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setUsers);
  useEffect(() => { fetchUsers(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
    setFormData({ fullName: '', email: '', phone: '' });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) fetchUsers(); else alert(await res.text());
  };

  return (
    <div>
      <div className="page-header"><h1>Drivers / Customers</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="data-card" style={{ padding: '20px' }}>
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px', fontSize:'1.1em'}}>Register Driver</h2>
          <form onSubmit={handleSubmit} style={{padding:0, gap:'12px'}}>
            <div className="input-group"><label>Full Name</label><input placeholder="e.g. Rahul Sharma" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required /></div>
            <div className="input-group"><label>Email Address</label><input type="email" placeholder="e.g. rahul@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
            <div className="input-group"><label>Phone Number</label><input placeholder="e.g. 9876543210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
            <button type="submit" className="primary" style={{marginTop:'10px'}}>Register Driver</button>
          </form>
        </div>
        <div className="data-card">
          <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Action</th></tr></thead>
          <tbody>{users.map(u => <tr key={u.id}><td>#{u.id}</td><td style={{fontWeight:'bold'}}>{u.fullName}</td><td>{u.email}</td><td>{u.phone}</td>
          <td><button onClick={() => handleDelete(u.id)} style={{background:'#ef4444', color:'#fff', border:'none', padding:'6px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8em', fontWeight:'bold'}}>Delete</button></td>
          </tr>)}</tbody></table>
        </div>
      </div>
    </div>
  );
};

export const Settings = () => ( <div><div className="page-header"><h1>Settings</h1></div><div className="data-card" style={{padding:'20px'}}><h2>Settings</h2></div></div> );
EOF

# Rebuild React Bundle
echo "📦 Rebuilding frontend bundle..."
cd frontend
npm run build --silent
cd ..
cp -r frontend/build/* src/main/resources/static/
echo "✅ Placeholders successfully updated to Bajaj Platina 2017 and matt red!"