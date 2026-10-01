#!/bin/bash

# 1. Update CSS for the corporate dark theme and badge-driven design
cat << 'EOF' > frontend/src/App.css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body { font-family: 'Inter', sans-serif; background: #0b0f19; color: #e2e8f0; margin: 0; padding: 0; }
.app-layout { display: flex; height: 100vh; overflow: hidden; }

/* Sidebar */
.sidebar { width: 240px; background: #111827; border-right: 1px solid #1f2937; display: flex; flex-direction: column; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 20px; font-size: 1.2em; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
.sidebar-brand span { color: #3b82f6; }
.nav-links { list-style: none; padding: 0; margin: 0; }
.nav-links a { display: flex; align-items: center; padding: 14px 24px; color: #9ca3af; text-decoration: none; font-size: 0.9em; font-weight: 500; border-left: 3px solid transparent; transition: 0.2s; }
.nav-links a:hover { color: #fff; background: rgba(255,255,255,0.03); }
.active-link { color: #fff !important; background: rgba(59, 130, 246, 0.1) !important; border-left-color: #3b82f6 !important; }
.logout-btn { margin: auto 20px 20px 20px; background: transparent; border: 1px solid #374151; color: #9ca3af; padding: 10px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: 500; }
.logout-btn:hover { background: #374151; color: #fff; }

/* Main Content & Topbar */
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #0b0f19; }
.topbar { height: 65px; background: #111827; border-bottom: 1px solid #1f2937; display: flex; justify-content: space-between; align-items: center; padding: 0 30px; }
.topbar-title { font-weight: 600; font-size: 1.1em; color: #fff; }
.topbar-user { display: flex; align-items: center; gap: 12px; font-size: 0.85em; color: #9ca3af; }
.user-avatar { width: 32px; height: 32px; background: #374151; border-radius: 50%; border: 1px solid #4b5563; }
.page-content { padding: 30px; overflow-y: auto; flex: 1; }

/* Dashboard Split Layout */
.dashboard-grid { display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: start; }
.card { background: #151b2b; border: 1px solid #1f2937; border-radius: 8px; padding: 24px; }
.card h2 { font-size: 1.05em; font-weight: 600; color: #fff; margin-top: 0; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #1f2937; }

/* Form Controls */
form { display: flex; flex-direction: column; gap: 16px; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 0.8em; color: #9ca3af; font-weight: 500; }
input, select, textarea { width: 100%; box-sizing: border-box; padding: 10px 14px; background: #0b0f19; border: 1px solid #374151; color: #f8fafc; border-radius: 6px; font-size: 0.85em; transition: 0.2s; font-family: inherit; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
button[type="submit"] { background: #3b82f6; color: #fff; border: none; padding: 12px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; margin-top: 8px; }
button[type="submit"]:hover { background: #2563eb; }
.file-upload-group { display: flex; flex-direction: column; gap: 6px; font-size: 0.8em; color: #9ca3af; }

/* Table Styling */
table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
th { color: #9ca3af; font-weight: 500; text-align: left; padding: 12px 16px; border-bottom: 1px solid #1f2937; }
td { padding: 16px; border-bottom: 1px solid #1f2937; color: #e2e8f0; vertical-align: middle; }
tr:hover td { background: rgba(255,255,255,0.015); }
.thumbnail { width: 36px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid #374151; cursor: pointer; }

/* Alert Badges */
.status { padding: 4px 10px; border-radius: 12px; font-size: 0.8em; font-weight: 600; display: inline-block; }
.status.pending { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); } /* Amber */
.status.in-progress { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); } /* Blue */
.status.completed { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); } /* Green */
.mod-badge { font-size: 0.75em; background: #374151; padding: 3px 8px; border-radius: 4px; color: #d1d5db; margin-top: 4px; display: inline-block; }

/* Table Action Buttons */
.action-buttons { display: flex; gap: 8px; }
.btn-sm { font-size: 0.8em; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; transition: 0.2s; }
.btn-progress { background: #3b82f6; color: white; } .btn-progress:hover { background: #2563eb; }
.btn-complete { background: #10b981; color: white; } .btn-complete:hover { background: #059669; }

/* Login */
.login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #0b0f19; }
.login-form { background: #111827; padding: 40px; border-radius: 8px; border: 1px solid #1f2937; box-shadow: 0 10px 25px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 20px; width: 340px; }
.login-form h2 { color: #fff; margin: 0 0 10px 0; font-size: 1.5em; text-align: center; }
.error-msg { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px; border-radius: 4px; font-size: 0.85em; text-align: center; }
EOF

# 2. Update Layout Structure with Topbar in App.js
cat << 'EOF' > frontend/src/App.js
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import History from './History';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError('');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
      if (!response.ok) throw new Error();
      const jwtToken = await response.text(); localStorage.setItem('token', jwtToken); setToken(jwtToken);
    } catch (err) { setLoginError('Authentication failed.'); }
  };

  if (!token) return (
    <div className="login-container"><form className="login-form" onSubmit={handleLogin}><h2>System Login</h2>
    {loginError && <p className="error-msg">{loginError}</p>}
    <input name="username" placeholder="Username ID" onChange={e => setCredentials({...credentials, username: e.target.value})} required />
    <input type="password" name="password" placeholder="Password" onChange={e => setCredentials({...credentials, password: e.target.value})} required />
    <button type="submit">Access System</button></form></div>
  );

  return (
    <Router>
      <div className="app-layout">
        <nav className="sidebar">
          <div className="sidebar-brand">Auto<span>Sense</span></div>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({isActive}) => isActive ? "active-link" : ""}>Service Orders</NavLink></li>
            <li><NavLink to="/history" className={({isActive}) => isActive ? "active-link" : ""}>Vehicles Fleet</NavLink></li>
          </ul>
          <button className="logout-btn" onClick={() => {localStorage.removeItem('token'); setToken(null);}}>Sign Out</button>
        </nav>
        <main className="main-content">
          <header className="topbar">
            <div className="topbar-title">Service Orders Overview</div>
            <div className="topbar-user">
              <span>admin_mechanic</span>
              <div className="user-avatar"></div>
            </div>
          </header>
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard token={token} />} />
              <Route path="/history" element={<History token={token} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
export default App;
EOF

# 3. Implement the Side-by-Side Dashboard Layout
cat << 'EOF' > frontend/src/Dashboard.js
import React, { useState, useEffect } from 'react';

function Dashboard({ token }) {
  const [users, setUsers] = useState([]); const [vehicles, setVehicles] = useState([]); const [mechanics, setMechanics] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ customerId: '', vehicleId: '', mechanicId: '', serviceType: '', appointmentDate: '', aftermarketMods: '', referencePhoto: null });

  useEffect(() => { fetchTickets(); fetchReferenceData(); }, [token]);

  const fetchReferenceData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    const [uRes, vRes, mRes] = await Promise.all([fetch('/api/users', { headers }), fetch('/api/vehicles', { headers }), fetch('/api/mechanics', { headers })]);
    setUsers(await uRes.json()); setVehicles(await vRes.json()); setMechanics(await mRes.json());
  };

  const fetchTickets = async () => {
    const response = await fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } });
    setTickets(await response.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => { if (formData[key]) dataToSend.append(key, formData[key]); });
    await fetch('/api/services', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: dataToSend });
    setFormData({ customerId: '', vehicleId: '', mechanicId: '', serviceType: '', appointmentDate: '', aftermarketMods: '', referencePhoto: null });
    fetchTickets();
  };

  const handleUpdateStatus = async (id, status) => {
    await fetch(`/api/services/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'text/plain', 'Authorization': `Bearer ${token}` }, body: status });
    fetchTickets();
  };

  const availableVehicles = formData.customerId ? vehicles.filter(v => v.owner.id === Number(formData.customerId)) : [];
  const displayedTickets = tickets.filter(t => t.status !== 'Completed').sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  return (
    <div className="dashboard-grid">
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
    </div>
  );
}
export default Dashboard;
EOF

# 4. Update the History Page Style
cat << 'EOF' > frontend/src/History.js
import React, { useState, useEffect } from 'react';

function History({ token }) {
  const [tickets, setTickets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [tRes, vRes] = await Promise.all([ fetch('/api/services', { headers }), fetch('/api/vehicles', { headers }) ]);
      setTickets(await tRes.json()); setVehicles(await vRes.json());
    };
    fetchData();
  }, [token]);

  const displayedHistory = tickets
    .filter(t => t.status === 'Completed')
    .filter(t => selectedVehicle === 'All' || t.vehicle.id === Number(selectedVehicle))
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', borderBottom:'1px solid #1f2937', paddingBottom:'16px'}}>
        <h2 style={{margin:0, border:0, padding:0}}>Service History</h2>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <label style={{margin:0}}>Filter Registry:</label>
          <select style={{width:'200px', padding:'6px 10px'}} value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            <option value="All">All Vehicles</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate}</option>)}
          </select>
        </div>
      </div>
      
      <table>
        <thead><tr><th>Order ID</th><th>License Plate</th><th>Vehicle Model</th><th>Service Performed</th><th>Completion Date</th><th>Status</th></tr></thead>
        <tbody>
          {displayedHistory.length === 0 ? (<tr><td colSpan="6" style={{textAlign:'center', color:'#9ca3af'}}>No historical records found.</td></tr>) : 
           displayedHistory.map(t => (
            <tr key={t.id}>
              <td>#{t.id}</td>
              <td style={{fontWeight:'bold'}}>{t.vehicle.licensePlate}</td>
              <td style={{color:'#9ca3af'}}>{t.vehicle.makeAndModel}</td>
              <td>{t.serviceType}</td>
              <td>{t.appointmentDate}</td>
              <td><span className="status completed">Completed</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default History;
EOF

# 5. Build and deploy to Spring Boot
echo "📦 Compiling corporate UI..."
cd frontend
npm run build --silent
cd ..
echo "🚚 Deploying new layout..."
cp -r frontend/build/* src/main/resources/static/
echo "✅ Professional Theme Applied!"