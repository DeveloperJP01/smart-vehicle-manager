#!/bin/bash

# Restore the fully functional Maintenance component into the 9-module architecture
cat << 'EOF' > frontend/src/Pages.js
import React, { useState, useEffect } from 'react';

// 1. OVERVIEW MODULE
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

// 2. VEHICLES MODULE
export const Vehicles = ({ token }) => {
  const [vehicles, setVehicles] = useState([]);
  useEffect(() => { fetch('/api/vehicles', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setVehicles); }, [token]);
  return (
    <div>
      <div className="page-header"><h1>Vehicles Registry</h1></div>
      <div className="data-card">
        <table><thead><tr><th>ID</th><th>License Plate</th><th>Model</th><th>Owner</th><th>Odometer</th></tr></thead>
        <tbody>{vehicles.map(v => <tr key={v.id}><td>#{v.id}</td><td style={{fontWeight:'bold'}}>{v.licensePlate}</td><td>{v.makeAndModel}</td><td>{v.owner?.fullName}</td><td>{v.currentOdometer} km</td></tr>)}</tbody></table>
      </div>
    </div>
  );
};

// 3. SMART HEALTH MODULE
export const SmartHealth = ({ token }) => {
  const [diagnostics, setDiagnostics] = useState([]);
  useEffect(() => { fetch('/api/diagnostics', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setDiagnostics); }, [token]);
  const critical = diagnostics.filter(d => d.status === 'CRITICAL').length; const warning = diagnostics.filter(d => d.status === 'WARNING').length; const healthy = diagnostics.filter(d => d.status === 'OPTIMAL').length;
  return (
    <div>
      <div className="page-header"><h1>🛡️ Smart Health</h1><div className="live-indicator"><div className="live-dot"></div> Live &nbsp; Last updated: just now</div></div>
      <div className="filters-bar"><input placeholder="🔍 Search vehicles" /><select><option>All Status</option></select><select><option>All Vehicle Types</option></select><button>⚙ Filters</button></div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-icon critical">!</div><div className="kpi-data"><span className="kpi-val">{critical}</span><span className="kpi-label">Critical &gt;</span><span className="kpi-sub">Requires immediate attention</span></div></div>
        <div className="kpi-card"><div className="kpi-icon warning">⚠</div><div className="kpi-data"><span className="kpi-val">{warning}</span><span className="kpi-label">Warning &gt;</span><span className="kpi-sub">Requires inspection</span></div></div>
        <div className="kpi-card"><div className="kpi-icon healthy">✓</div><div className="kpi-data"><span className="kpi-val">{healthy}</span><span className="kpi-label">Healthy &gt;</span><span className="kpi-sub">All systems normal</span></div></div>
        <div className="kpi-card"><div className="kpi-icon total">⚙</div><div className="kpi-data"><span className="kpi-val">{diagnostics.length}</span><span className="kpi-label">Total Vehicles &gt;</span><span className="kpi-sub">Across your fleet</span></div></div>
      </div>
      <div className="data-card">
        {diagnostics.map((d, i) => (
          <div className="health-row" key={i}>
            <div className="vehicle-thumb">🚙</div>
            <div><div className="v-plate">{d.vehicle.licensePlate}</div><div className="v-model">{d.vehicle.makeAndModel}</div></div>
            <div><span className={`badge ${d.status === 'OPTIMAL' ? 'healthy' : d.status.toLowerCase()}`}>{d.status === 'OPTIMAL' ? 'Healthy' : d.status}</span></div>
            <ul className="alert-list">
              {d.alerts.length === 0 ? <li><span className="alert-dot" style={{background:'#10b981'}}></span> All systems normal</li> : d.alerts.map((a, j) => <li key={j}><span className={`alert-dot ${d.status}`}></span> {a}</li>)}
            </ul>
            <div className="time-ago">Just now &gt;</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. ALERTS MODULE
export const Alerts = ({ token }) => {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { fetch('/api/diagnostics', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(data => setAlerts(data.filter(d => d.alerts.length > 0))); }, [token]);
  return (
    <div>
      <div className="page-header"><h1>Alerts Log</h1></div>
      <div className="data-card">
        <table><thead><tr><th>Vehicle</th><th>Severity</th><th>Alert Details</th></tr></thead>
        <tbody>{alerts.map((a, i) => <tr key={i}><td>{a.vehicle.licensePlate}</td><td><span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span></td><td>{a.alerts.join(', ')}</td></tr>)}
        {alerts.length === 0 && <tr><td colSpan="3" style={{textAlign:'center'}}>No active alerts.</td></tr>}</tbody></table>
      </div>
    </div>
  );
};

// 5. MAINTENANCE MODULE (FEATURES FULLY RESTORED)
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
        
        {/* RESTORED BOOKING FORM */}
        <div className="data-card" style={{ padding: '20px' }}>
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px', fontSize:'1.1em'}}>Book a New Service</h2>
          <form onSubmit={handleSubmit} style={{padding:0, gap:'12px'}}>
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
              <textarea name="aftermarketMods" placeholder="Add details..." value={formData.aftermarketMods} onChange={e => setFormData({...formData, aftermarketMods: e.target.value})} rows="2" />
            </div>
            <div className="input-group">
              <label>Reference Photo</label>
              <input type="file" accept="image/*" onChange={e => setFormData({...formData, referencePhoto: e.target.files[0]})} style={{fontSize:'0.8em', padding:'6px'}}/>
            </div>
            <button type="submit" className="primary" style={{marginTop:'10px'}}>Create Booking</button>
          </form>
        </div>

        {/* RESTORED ACTIVE QUEUE TABLE */}
        <div className="data-card">
          <div style={{padding:'20px', borderBottom:'1px solid #1e2235', margin:0}}><h2 style={{margin:0, fontSize:'1.1em'}}>Active Queue</h2></div>
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Vehicle</th><th>Service Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{displayedTickets.map(t => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>{t.customer.fullName}</td>
                <td><div style={{fontWeight:'bold'}}>{t.vehicle.licensePlate}</div><div style={{fontSize:'0.8em', color:'#94a3b8'}}>{t.vehicle.makeAndModel}</div></td>
                <td>{t.serviceType}{t.aftermarketMods && <><br/><span className="badge" style={{background:'#374151', color:'#cbd5e1', padding:'2px 6px', marginTop:'4px'}}>Mods</span></>}</td>
                <td><span className={`badge ${t.status==='Pending'?'warning':'healthy'}`}>{t.status}</span></td>
                <td>
                  <div style={{display:'flex', gap:'8px'}}>
                    {t.status === 'Pending' && <button onClick={() => handleUpdateStatus(t.id, 'In-Progress')} style={{background:'#3b82f6', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8em', fontWeight:'bold'}}>Start</button>}
                    {t.status === 'In-Progress' && <button onClick={() => handleUpdateStatus(t.id, 'Completed')} style={{background:'#10b981', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8em', fontWeight:'bold'}}>Complete</button>}
                  </div>
                </td>
              </tr>
            ))}
            {displayedTickets.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', color:'#94a3b8'}}>No active orders.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 6. REPORTS MODULE
export const Reports = () => (
  <div><div className="page-header"><h1>Reports</h1></div><div className="data-card" style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}><h2>Monthly Service Report Generator</h2><p>Select a date range to export PDF/Excel reports.</p><button className="primary" style={{marginTop:'20px'}}>Generate Report</button></div></div>
);

// 7. GEOFENCES MODULE
export const Geofences = () => (
  <div><div className="page-header"><h1>Geofences & Tracking</h1></div><div className="data-card" style={{padding:'40px', textAlign:'center', color:'#94a3b8', minHeight:'400px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}><div style={{fontSize:'4em', marginBottom:'20px'}}>🗺️</div><h2>GPS Map Module Ready</h2><p>Integrate vehicle telematics hardware APIs here.</p></div></div>
);

// 8. DRIVERS MODULE
export const Drivers = ({ token }) => {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setUsers); }, [token]);
  return (
    <div><div className="page-header"><h1>Drivers / Customers</h1></div><div className="data-card"><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>#{u.id}</td><td style={{fontWeight:'bold'}}>{u.fullName}</td><td>{u.email}</td><td>{u.phone}</td></tr>)}</tbody></table></div></div>
  );
};

// 9. SETTINGS MODULE
export const Settings = () => (
  <div><div className="page-header"><h1>Settings</h1></div><div className="data-card" style={{padding:'20px', maxWidth:'600px'}}><form><div className="input-group"><label>System Name</label><input defaultValue="AutoSense Fleet Manager" /></div><div className="input-group"><label>Alert Thresholds (km)</label><input defaultValue="5000" /></div><button className="primary" type="button">Save Configuration</button></form></div></div>
);
EOF

# Rebuild React Project
echo "📦 Recompiling Application..."
cd frontend
npm run build --silent
cd ..
cp -r frontend/build/* src/main/resources/static/
echo "✅ Features successfully restored!"