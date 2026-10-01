#!/bin/bash

# 1. Update CSS to match the exact dark theme and sidebar of the reference image
cat << 'EOF' > frontend/src/App.css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body { font-family: 'Inter', sans-serif; background: #0f111a; color: #e2e8f0; margin: 0; padding: 0; }
.app-layout { display: flex; height: 100vh; overflow: hidden; }

/* 9-Module Sidebar */
.sidebar { width: 250px; background: #13151f; border-right: 1px solid #1e2235; display: flex; flex-direction: column; }
.sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 24px; font-size: 1.3em; font-weight: 700; color: #fff; }
.sidebar-brand span { color: #3b82f6; }
.nav-links { list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; }
.nav-links li { margin: 4px 12px; }
.nav-links a { display: flex; align-items: center; padding: 12px 16px; color: #94a3b8; text-decoration: none; font-size: 0.9em; font-weight: 500; border-radius: 6px; transition: 0.2s; }
.nav-links a:hover { color: #fff; background: rgba(255,255,255,0.05); }
.active-link { color: #fff !important; background: #242b42 !important; font-weight: 600; }

/* Sidebar User Profile Box */
.sidebar-user { margin: 12px; padding: 12px; background: #1e2235; border-radius: 8px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
.user-avatar-circle { width: 36px; height: 36px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 0.9em; }
.user-details { display: flex; flex-direction: column; }
.user-name { font-size: 0.85em; font-weight: 600; color: #fff; }
.user-role { font-size: 0.75em; color: #94a3b8; }

/* Main Content Area */
.main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; background: #0f111a; padding: 30px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { margin: 0; font-size: 1.5em; font-weight: 600; color: #fff; display: flex; align-items: center; gap: 10px; }
.live-indicator { font-size: 0.8em; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
.live-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; }

/* Smart Health Filters Bar */
.filters-bar { display: flex; gap: 12px; margin-bottom: 24px; }
.filters-bar input, .filters-bar select, .filters-bar button { background: #13151f; border: 1px solid #1e2235; color: #e2e8f0; padding: 10px 16px; border-radius: 6px; font-size: 0.85em; }

/* KPI Cards */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.kpi-card { background: #13151f; border: 1px solid #1e2235; border-radius: 8px; padding: 20px; display: flex; align-items: center; gap: 16px; }
.kpi-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em; }
.kpi-icon.critical { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.kpi-icon.warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.kpi-icon.healthy { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.kpi-icon.total { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }
.kpi-data { display: flex; flex-direction: column; }
.kpi-val { font-size: 1.5em; font-weight: 700; color: #fff; line-height: 1; }
.kpi-label { font-size: 0.8em; color: #e2e8f0; margin-top: 4px; font-weight: 500; }
.kpi-sub { font-size: 0.7em; color: #94a3b8; margin-top: 2px; }

/* Smart Health Table */
.data-card { background: #13151f; border: 1px solid #1e2235; border-radius: 8px; }
.health-row { display: grid; grid-template-columns: 80px 2fr 1fr 2fr 1fr; gap: 16px; align-items: center; padding: 16px 20px; border-bottom: 1px solid #1e2235; }
.health-row:last-child { border-bottom: none; }
.vehicle-thumb { width: 60px; height: 40px; background: #1e2235; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1.5em; }
.v-plate { font-weight: 600; color: #fff; font-size: 0.9em; }
.v-model { font-size: 0.75em; color: #94a3b8; margin-top: 4px; }
.alert-list { list-style: none; padding: 0; margin: 0; font-size: 0.8em; color: #cbd5e1; }
.alert-list li { margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
.alert-dot { width: 6px; height: 6px; border-radius: 50%; }
.alert-dot.CRITICAL { background: #ef4444; } .alert-dot.WARNING { background: #fbbf24; }
.time-ago { font-size: 0.8em; color: #94a3b8; text-align: right; }

/* Badges */
.badge { padding: 4px 12px; border-radius: 12px; font-size: 0.75em; font-weight: 600; border: 1px solid transparent; text-align: center; display: inline-block; }
.badge.critical { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
.badge.warning { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border-color: rgba(245, 158, 11, 0.2); }
.badge.healthy { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }

/* Standard Forms & Tables */
form { display: flex; flex-direction: column; gap: 16px; padding: 20px; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 0.8em; color: #94a3b8; font-weight: 500; }
input, select, textarea { width: 100%; box-sizing: border-box; padding: 10px; background: #0f111a; border: 1px solid #1e2235; color: #fff; border-radius: 6px; }
button.primary { background: #3b82f6; color: #fff; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; }
table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
th { color: #94a3b8; font-weight: 500; text-align: left; padding: 16px 20px; border-bottom: 1px solid #1e2235; }
td { padding: 16px 20px; border-bottom: 1px solid #1e2235; color: #e2e8f0; }
EOF

# 2. Build the 9 Module Pages inside a single React File
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

// 3. SMART HEALTH MODULE (Replicated from Image)
export const SmartHealth = ({ token }) => {
  const [diagnostics, setDiagnostics] = useState([]);
  useEffect(() => { fetch('/api/diagnostics', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setDiagnostics); }, [token]);
  
  const critical = diagnostics.filter(d => d.status === 'CRITICAL').length;
  const warning = diagnostics.filter(d => d.status === 'WARNING').length;
  const healthy = diagnostics.filter(d => d.status === 'OPTIMAL').length;

  return (
    <div>
      <div className="page-header">
        <h1>🛡️ Smart Health</h1>
        <div className="live-indicator"><div className="live-dot"></div> Live &nbsp; Last updated: just now</div>
      </div>
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
              {d.alerts.length === 0 ? <li><span className="alert-dot" style={{background:'#10b981'}}></span> All systems normal</li> : 
               d.alerts.map((a, j) => <li key={j}><span className={`alert-dot ${d.status}`}></span> {a}</li>)}
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

// 5. MAINTENANCE MODULE
export const Maintenance = ({ token }) => {
  const [tickets, setTickets] = useState([]);
  useEffect(() => { fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setTickets); }, [token]);
  return (
    <div>
      <div className="page-header"><h1>Maintenance Queue</h1><button className="primary">+ Book Service</button></div>
      <div className="data-card">
        <table><thead><tr><th>Order ID</th><th>Vehicle</th><th>Service</th><th>Status</th><th>Cost</th></tr></thead>
        <tbody>{tickets.filter(t => t.status !== 'Completed').map(t => <tr key={t.id}><td>#{t.id}</td><td>{t.vehicle.licensePlate}</td><td>{t.serviceType}</td><td><span className={`badge ${t.status==='Pending'?'warning':'healthy'}`}>{t.status}</span></td><td>₹{t.estimatedCost}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
};

// 6. REPORTS MODULE
export const Reports = () => (
  <div>
    <div className="page-header"><h1>Reports</h1></div>
    <div className="data-card" style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>
      <h2>Monthly Service Report Generator</h2>
      <p>Select a date range to export PDF/Excel reports of fleet maintenance costs.</p>
      <button className="primary" style={{marginTop:'20px'}}>Generate Report</button>
    </div>
  </div>
);

// 7. GEOFENCES MODULE
export const Geofences = () => (
  <div>
    <div className="page-header"><h1>Geofences & Tracking</h1></div>
    <div className="data-card" style={{padding:'40px', textAlign:'center', color:'#94a3b8', minHeight:'400px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
      <div style={{fontSize:'4em', marginBottom:'20px'}}>🗺️</div>
      <h2>GPS Map Module Ready</h2>
      <p>Integrate vehicle telematics hardware APIs to view real-time fleet locations here.</p>
    </div>
  </div>
);

// 8. DRIVERS MODULE
export const Drivers = ({ token }) => {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setUsers); }, [token]);
  return (
    <div>
      <div className="page-header"><h1>Drivers / Customers</h1></div>
      <div className="data-card">
        <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
        <tbody>{users.map(u => <tr key={u.id}><td>#{u.id}</td><td style={{fontWeight:'bold'}}>{u.fullName}</td><td>{u.email}</td><td>{u.phone}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
};

// 9. SETTINGS MODULE
export const Settings = () => (
  <div>
    <div className="page-header"><h1>Settings</h1></div>
    <div className="data-card" style={{padding:'20px', maxWidth:'600px'}}>
      <form>
        <div className="input-group"><label>System Name</label><input defaultValue="AutoSense Fleet Manager" /></div>
        <div className="input-group"><label>Alert Thresholds (km)</label><input defaultValue="5000" /></div>
        <button className="primary" type="button">Save Configuration</button>
      </form>
    </div>
  </div>
);
EOF

# 3. Wire the 9 Modules into App.js routing
cat << 'EOF' > frontend/src/App.js
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Overview, Vehicles, SmartHealth, Alerts, Maintenance, Reports, Geofences, Drivers, Settings } from './Pages';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
      if (response.ok) { const jwtToken = await response.text(); localStorage.setItem('token', jwtToken); setToken(jwtToken); }
    } catch (err) {}
  };

  if (!token) return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0f111a'}}>
      <form onSubmit={handleLogin} style={{background:'#13151f', padding:'40px', borderRadius:'8px', width:'300px', border:'1px solid #1e2235'}}>
        <h2 style={{color:'#fff', textAlign:'center', marginTop:0}}>AutoSense</h2>
        <input placeholder="Username" onChange={e => setCredentials({...credentials, username: e.target.value})} style={{marginBottom:'15px'}}/>
        <input type="password" placeholder="Password" onChange={e => setCredentials({...credentials, password: e.target.value})} style={{marginBottom:'15px'}}/>
        <button className="primary" type="submit" style={{width:'100%'}}>Login</button>
      </form>
    </div>
  );

  return (
    <Router>
      <div className="app-layout">
        
        {/* EXACT 9-MODULE SIDEBAR */}
        <nav className="sidebar">
          <div className="sidebar-brand">🚙 Auto<span>Sense</span></div>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({isActive}) => isActive ? "active-link" : ""}>⊞ Overview</NavLink></li>
            <li><NavLink to="/vehicles" className={({isActive}) => isActive ? "active-link" : ""}>🚐 Vehicles</NavLink></li>
            <li><NavLink to="/health" className={({isActive}) => isActive ? "active-link" : ""}>🛡️ Smart Health</NavLink></li>
            <li><NavLink to="/alerts" className={({isActive}) => isActive ? "active-link" : ""}>🔔 Alerts</NavLink></li>
            <li><NavLink to="/maintenance" className={({isActive}) => isActive ? "active-link" : ""}>🔧 Maintenance</NavLink></li>
            <li><NavLink to="/reports" className={({isActive}) => isActive ? "active-link" : ""}>📄 Reports</NavLink></li>
            <li><NavLink to="/geofences" className={({isActive}) => isActive ? "active-link" : ""}>📍 Geofences</NavLink></li>
            <li><NavLink to="/drivers" className={({isActive}) => isActive ? "active-link" : ""}>👤 Drivers</NavLink></li>
            <li><NavLink to="/settings" className={({isActive}) => isActive ? "active-link" : ""}>⚙ Settings</NavLink></li>
          </ul>
          <div className="sidebar-user" onClick={() => {localStorage.removeItem('token'); setToken(null);}}>
            <div className="user-avatar-circle">AD</div>
            <div className="user-details"><span className="user-name">Acme Demo</span><span className="user-role">Fleet Admin / Logout</span></div>
          </div>
        </nav>

        {/* DYNAMIC CONTENT ROUTER */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Overview token={token} />} />
            <Route path="/vehicles" element={<Vehicles token={token} />} />
            <Route path="/health" element={<SmartHealth token={token} />} />
            <Route path="/alerts" element={<Alerts token={token} />} />
            <Route path="/maintenance" element={<Maintenance token={token} />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/geofences" element={<Geofences />} />
            <Route path="/drivers" element={<Drivers token={token} />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
EOF

# 4. Rebuild the Frontend
echo "📦 Compiling 9-Module Architecture..."
cd frontend
npm run build --silent
cd ..
cp -r frontend/build/* src/main/resources/static/
echo "✅ AutoSense Enterprise Dashboard deployed!"