import Webcam from "react-webcam";
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
    fetch('/api/admin/users', { headers }).then(r => r.json()).then(setUsers);
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
    const [uRes, vRes, mRes, tRes] = await Promise.all([ fetch('/api/admin/users', { headers }), fetch('/api/vehicles', { headers }), fetch('/api/mechanics', { headers }), fetch('/api/services', { headers }) ]);
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

  const fetchUsers = () => fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setUsers);
  useEffect(() => { fetchUsers(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
    setFormData({ fullName: '', email: '', phone: '' });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
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

export const Settings = ({ token }) => {
  const [users, setUsers] = React.useState([]);
  const [newUsername, setNewUsername] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [newRole, setNewRole] = React.useState('MECHANIC');

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) setUsers(await res.json());
  };

  React.useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
    });
    if(res.ok) {
      setNewUsername(''); setNewPassword(''); fetchUsers();
    } else {
      const data = await res.json(); alert(data.error);
    }
  };

  const handleDelete = async (id, username) => {
    if(username.toLowerCase() === 'admin') return alert("Access Denied: Cannot delete Master Admin.");
    if(!window.confirm(`Are you sure you want to revoke access for ${username}?`)) return;
    
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.ok) fetchUsers();
    else { const data = await res.json(); alert(data.error); }
  };

  return (
    <div>
      <div className="page-header"><h1>⚙️ Command Center Settings</h1></div>
      
      <div className="data-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{marginTop: 0, marginBottom: '20px', color: '#ffd700'}}>Access Control & Identity</h2>
        
        {/* Add User Form */}
        <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <input placeholder="New Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} required style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5'}} />
          <input type="password" placeholder="Secure Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5'}} />
          <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{padding: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffd700'}}>
            <option value="MECHANIC">Mechanic Level</option>
            <option value="MANAGER">Manager Level</option>
          </select>
          <button type="submit" className="primary" style={{padding: '12px 24px'}}>Grant Access</button>
        </form>

        {/* Active Users Table */}
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
              <th style={{padding: '16px', color: '#ffd700'}}>Operator ID</th>
              <th style={{padding: '16px', color: '#ffd700'}}>Clearance Level</th>
              <th style={{padding: '16px', color: '#ffd700', textAlign: 'right'}}>Override</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{padding: '16px', fontWeight: 'bold'}}>{u.username}</td>
                <td style={{padding: '16px'}}><span className="badge">{u.role}</span></td>
                <td style={{padding: '16px', textAlign: 'right'}}>
                  {u.username.toLowerCase() !== 'admin' ? (
                    <button onClick={() => handleDelete(u.id, u.username)} style={{ background: '#ef4444', color: '#fff', padding: '8px 16px', boxShadow: 'none' }}>Revoke</button>
                  ) : (
                    <span style={{ color: '#d4af37', fontStyle: 'italic' }}>Master Admin (Protected)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const GateScanner = ({ token }) => {
  const webcamRef = React.useRef(null);
  const [scanResult, setScanResult] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [isScanning, setIsScanning] = React.useState(false);

  const captureAndScan = async () => {
    setIsScanning(true); setError(null); setScanResult(null);
    const imageSrc = webcamRef.current.getScreenshot();
    
    try {
      const response = await fetch('/api/alpr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: imageSrc })
      });
      
      const data = await response.json();
      if (response.ok) { setScanResult(data); } 
      else { setError(data.error); }
    } catch (err) {
      setError("Network or server connection failed.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div>
      <div className="page-header"><h1>👁 Automated Gate Scanner</h1><div className="live-indicator"><div className="live-dot"></div> ALPR Active</div></div>
      <div className="data-card" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', display: 'block' }} />
          <div style={{ position: 'absolute', top: '25%', left: '15%', width: '70%', height: '50%', border: '2px solid #ffd700', boxShadow: '0 0 15px #ffd700', background: isScanning ? 'rgba(255, 215, 0, 0.2)' : 'transparent', transition: 'background 0.3s' }} />
        </div>
        
        <button onClick={captureAndScan} className="primary" style={{ width: '100%', marginTop: '20px', padding: '16px', fontSize: '1.1em' }} disabled={isScanning}>
          {isScanning ? 'Processing Optical Telemetry...' : 'Engage Gate Scanner'}
        </button>

        {scanResult && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Vehicle Identified: {scanResult.licensePlate}</h3>
            <p style={{ margin: '4px 0', color: '#e2e8f0' }}>Owner: {scanResult.ownerName}</p>
            <p style={{ margin: '4px 0', color: '#e2e8f0' }}>Triage Ticket: <span style={{fontWeight:'bold'}}>{scanResult.ticketId}</span></p>
            <div style={{marginTop:'12px'}}><span className="badge healthy">Gate Opened</span></div>
          </div>
        )}
        
        {error && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>Scan Failed</h3>
            <p style={{ margin: 0, color: '#e2e8f0' }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
