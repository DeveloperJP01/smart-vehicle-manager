import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { GateScanner, Overview, Vehicles, SmartHealth, Alerts, Maintenance, Reports, Geofences,  Inventory, Registry } from './Pages';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
      if (response.ok) { 
        const jwtToken = await response.text(); 
        if (jwtToken.includes('.')) {
          localStorage.setItem('token', jwtToken); 
          setToken(jwtToken); 
          
          // Fetch user details
          const meRes = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${jwtToken}` } });
          if (meRes.ok) {
            const meData = await meRes.json();
            localStorage.setItem('user', JSON.stringify(meData));
            setUser(meData);
          }
        } else {
          alert('Invalid credentials or server error.');
        }
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (err) {
      alert('Network error during login.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
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

  const role = user?.role || 'Employee';
  const isOwner = role === 'Owner';
  const isManager = role === 'Manager';
  const isEmployee = role === 'Employee';

  return (
    <Router>
      <div className="app-layout">
        
        {/* EXACT 9-MODULE SIDEBAR */}
        <nav className="sidebar">
          <div className="sidebar-brand">dYsT Auto<span>Sense</span></div>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({isActive}) => isActive ? "active-link" : ""}>Sz Overview</NavLink></li>
            <li><NavLink to="/vehicles" className={({isActive}) => isActive ? "active-link" : ""}>🚘 Vehicles</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/scanner" className={({isActive}) => isActive ? "active-link" : ""}>📷 Gate Scanner</NavLink></li>}
            <li><NavLink to="/health" className={({isActive}) => isActive ? "active-link" : ""}>🩺 Smart Health</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/alerts" className={({isActive}) => isActive ? "active-link" : ""}>⚠️ Alerts</NavLink></li>}
            {(!isEmployee) && <li><NavLink to="/maintenance" className={({isActive}) => isActive ? "active-link" : ""}>🔧 Maintenance</NavLink></li>}
            <li><NavLink to="/reports" className={({isActive}) => isActive ? "active-link" : ""}>📋 Reports</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/geofences" className={({isActive}) => isActive ? "active-link" : ""}>📍 Geofences</NavLink></li>}
            <li><NavLink to="/inventory" className={({isActive}) => isActive ? "active-link" : ""}>📦 Parts Vault</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/registry" className={({isActive}) => isActive ? "active-link" : ""}>🗃️ Registry</NavLink></li>}
          </ul>
          <div className="sidebar-user" onClick={logout}>
            <div className="user-avatar-circle">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div className="user-details"><span className="user-name">{user?.username || 'User'}</span><span className="user-role">{role} / Logout</span></div>
          </div>
        </nav>

        {/* DYNAMIC CONTENT ROUTER */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Overview token={token} />} />
            <Route path="/vehicles" element={<Vehicles token={token} />} />
            {(!isEmployee) && <Route path="/scanner" element={<GateScanner token={token} />} />}
            <Route path="/health" element={<SmartHealth token={token} />} />
            {(!isEmployee) && <Route path="/alerts" element={<Alerts token={token} />} />}
            {(!isEmployee) && <Route path="/maintenance" element={<Maintenance token={token} userRole={role} />} />}
            <Route path="/reports" element={<Reports token={token} userRole={role} />} />
            {(!isEmployee) && <Route path="/geofences" element={<Geofences />} />}
            <Route path="/inventory" element={<Inventory token={token} />} />
            {(!isEmployee) && <Route path="/registry" element={<Registry token={token} userRole={role} />} />}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
