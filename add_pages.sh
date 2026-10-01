#!/bin/bash

# 1. Install React Router
echo "📦 Installing React Router..."
cd frontend
npm install react-router-dom --silent
cd ..

# 2. Create the New Dedicated History Page
cat << 'EOF' > frontend/src/History.js
import React, { useState, useEffect } from 'react';

function History({ token }) {
  const [tickets, setTickets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [tRes, vRes] = await Promise.all([
        fetch('/api/services', { headers }), fetch('/api/vehicles', { headers })
      ]);
      setTickets(await tRes.json());
      setVehicles(await vRes.json());
    };
    fetchData();
  }, [token]);

  const displayedHistory = tickets
    .filter(t => t.status === 'Completed')
    .filter(t => selectedVehicle === 'All' || t.vehicle.id === Number(selectedVehicle))
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  return (
    <div className="page-content">
      <div className="header">
        <h1>Service <span>History</span></h1>
      </div>
      <div className="history-controls">
        <label>Filter by Vehicle: </label>
        <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
          <option value="All">All Vehicles</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} - {v.makeAndModel}</option>)}
        </select>
      </div>
      
      <table>
        <thead><tr><th>ID</th><th>Vehicle</th><th>Service Performed</th><th>Modifications</th><th>Date</th></tr></thead>
        <tbody>
          {displayedHistory.length === 0 ? (<tr><td colSpan="5" style={{textAlign:'center'}}>No history found for this vehicle.</td></tr>) : 
           displayedHistory.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.vehicle.licensePlate}<br/><small>{t.vehicle.makeAndModel}</small></td>
              <td>{t.serviceType}</td>
              <td>{t.aftermarketMods || '-'}</td>
              <td>{t.appointmentDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default History;
EOF

# 3. Move the current dashboard into its own component
cat << 'EOF' > frontend/src/Dashboard.js
import React, { useState, useEffect } from 'react';

function Dashboard({ token }) {
  const [users, setUsers] = useState([]); const [vehicles, setVehicles] = useState([]); const [mechanics, setMechanics] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All'); const [sortOrder, setSortOrder] = useState('asc');
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
  const displayedTickets = tickets.filter(t => filterStatus === 'All' || t.status === filterStatus).filter(t => t.status !== 'Completed').sort((a, b) => sortOrder === 'asc' ? new Date(a.appointmentDate) - new Date(b.appointmentDate) : new Date(b.appointmentDate) - new Date(a.appointmentDate));

  return (
    <div className="page-content">
      <div className="header"><h1>Active <span>Queue</span></h1></div>
      <div className="form-section">
        <h2>Book Service</h2>
        <form onSubmit={handleSubmit}>
          <select name="customerId" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value, vehicleId: ''})} required><option value="">Select Customer</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select>
          <select name="vehicleId" value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} required disabled={!formData.customerId}><option value="">{!formData.customerId ? 'Select Customer First' : 'Select Vehicle'}</option>{availableVehicles.map(v => <option key={v.id} value={v.id}>{v.makeAndModel} - {v.licensePlate}</option>)}</select>
          <select name="mechanicId" value={formData.mechanicId} onChange={e => setFormData({...formData, mechanicId: e.target.value})}><option value="">Assign Mechanic (Optional)</option>{mechanics.map(m => <option key={m.id} value={m.id}>{m.name} ({m.specialization})</option>)}</select>
          <input name="serviceType" placeholder="Service Type" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} required />
          <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required />
          <textarea name="aftermarketMods" placeholder="Mods (e.g. Twin LEDs)" value={formData.aftermarketMods} onChange={e => setFormData({...formData, aftermarketMods: e.target.value})} rows="2" />
          <div className="file-upload-group"><label>Reference Photo:</label><input type="file" accept="image/*" onChange={e => setFormData({...formData, referencePhoto: e.target.files[0]})} /></div>
          <button type="submit">Book Appointment</button>
        </form>
      </div>
      <div className="list-section">
        <div className="list-header"><h2>Pending Jobs</h2></div>
        <table><thead><tr><th>ID</th><th>Customer</th><th>Vehicle Info</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{displayedTickets.map(t => (
            <tr key={t.id}><td>{t.id}</td><td>{t.customer.fullName}</td>
              <td><div className="vehicle-info">{t.vehicle.makeAndModel}<div className="badge-row">{t.aftermarketMods && <span className="mod-badge" title={t.aftermarketMods}>🛠️ Mods</span>}<img src={`/api/services/${t.id}/photo?t=${Date.now()}`} alt="Ref" className="thumbnail" onError={e => e.target.style.display='none'}/></div></div></td>
              <td>{t.appointmentDate}</td><td><span className={`status ${t.status.toLowerCase()}`}>{t.status}</span></td>
              <td><div className="action-buttons">
                  {t.status === 'Pending' && <button className="btn-sm btn-progress" onClick={() => handleUpdateStatus(t.id, 'In-Progress')}>Start Job</button>}
                  {t.status === 'In-Progress' && <button className="btn-sm btn-complete" onClick={() => handleUpdateStatus(t.id, 'Completed')}>Mark Done</button>}
              </div></td></tr>
          ))}</tbody></table>
      </div>
    </div>
  );
}
export default Dashboard;
EOF

# 4. Rewrite App.js to handle Routing and Sidebar Layout
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
    } catch (err) { setLoginError('Login failed.'); }
  };

  if (!token) return (
    <div className="login-container"><form className="login-form" onSubmit={handleLogin}><h2>Mechanic Login</h2>
    {loginError && <p className="error-msg">{loginError}</p>}
    <input name="username" placeholder="Username" onChange={e => setCredentials({...credentials, username: e.target.value})} required />
    <input type="password" name="password" placeholder="Password" onChange={e => setCredentials({...credentials, password: e.target.value})} required />
    <button type="submit">Login</button></form></div>
  );

  return (
    <Router>
      <div className="app-layout">
        <nav className="sidebar">
          <div className="sidebar-brand">GEAR<span>BOX</span></div>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({isActive}) => isActive ? "active-link" : ""}>Active Queue</NavLink></li>
            <li><NavLink to="/history" className={({isActive}) => isActive ? "active-link" : ""}>Service History</NavLink></li>
          </ul>
          <button className="logout-btn" onClick={() => {localStorage.removeItem('token'); setToken(null);}}>Logout</button>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard token={token} />} />
            <Route path="/history" element={<History token={token} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
EOF

# 5. Add Sidebar CSS
cat << 'EOF' >> frontend/src/App.css

/* Multi-Page Layout Styles */
.app-layout { display: flex; min-height: 100vh; background: #0a0a0c; }
.sidebar { width: 260px; background: #131316; border-right: 1px solid #27272a; display: flex; flex-direction: column; padding: 30px 20px; }
.sidebar-brand { font-family: 'Oswald', sans-serif; font-size: 2.5em; color: #fff; margin-bottom: 50px; text-align: center; letter-spacing: 2px; }
.sidebar-brand span { color: #d97736; }
.nav-links { list-style: none; padding: 0; margin: 0; flex-grow: 1; }
.nav-links li { margin-bottom: 15px; }
.nav-links a { display: block; padding: 15px; color: #a1a1aa; text-decoration: none; font-size: 1.1em; font-weight: bold; text-transform: uppercase; border-radius: 8px; transition: all 0.2s; border: 1px solid transparent; }
.nav-links a:hover { background: rgba(217, 119, 54, 0.1); color: #d97736; }
.active-link { background: rgba(217, 119, 54, 0.1); color: #d97736 !important; border-color: rgba(217, 119, 54, 0.3) !important; }
.main-content { flex-grow: 1; padding: 40px; overflow-y: auto; }
.page-content { max-width: 1100px; margin: 0 auto; }
.header h1 span { color: #d97736; }
.history-controls { margin-bottom: 25px; display: flex; align-items: center; gap: 15px; background: #1a1a1f; padding: 15px 25px; border-radius: 8px; border: 1px solid #27272a; }
.history-controls label { color: #a1a1aa; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
.sidebar .logout-btn { width: 100%; margin-top: auto; }
EOF

# 6. Build and Deploy
echo "📦 Compiling React Router Build..."
cd frontend
npm run build --silent
cd ..
echo "🚚 Deploying new architecture to Spring Boot..."
cp -r frontend/build/* src/main/resources/static/
echo "✅ Multi-page system setup complete!"