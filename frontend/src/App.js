import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { GateScanner, Overview, Vehicles, SmartHealth, Alerts, Maintenance, Reports, Geofences,  Inventory, Registry, Finance } from './Pages';

function App() {
  const getInitialToken = () => {
    const t = localStorage.getItem('token');
    return (t === 'null' || t === 'undefined' || !t) ? null : t;
  };
  const [token, setToken] = useState(getInitialToken());
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
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
      <form onSubmit={handleLogin} style={{ padding:'40px', borderRadius:'8px', width:'300px'}}>
        <h2 style={{ textAlign:'center', marginTop:0}}>Premium Auto Services</h2>
        <input placeholder="Username" onChange={e => setCredentials({...credentials, username: e.target.value})} style={{marginBottom:'15px'}}/>
        <input type="password" placeholder="Password" onChange={e => setCredentials({...credentials, password: e.target.value})} style={{marginBottom:'15px'}}/>
        <button className="primary" type="submit" style={{width:'100%'}}>Login</button>
      </form>
    </div>
  );

  const role = user?.role?.toUpperCase() || 'EMPLOYEE';
  const isOwner = role === 'OWNER';
  const isManager = role === 'MANAGER';
  const isEmployee = role === 'EMPLOYEE';

  return (
    <Router>
      <div className="app-layout">
        
        {/* EXACT 9-MODULE SIDEBAR */}
        <nav className="sidebar">
          <div className="sidebar-brand" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 16L3 5L8.5 4L10 8H14L15.5 4L21 5L19 16H5Z" fill="url(#grad1)"/>
    <circle cx="8" cy="19" r="2.5" fill="var(--black)"/>
    <circle cx="16" cy="19" r="2.5" fill="var(--black)"/>
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#800000" />
        <stop offset="100%" stopColor="#000000" />
      </linearGradient>
    </defs>
  </svg>
  Premium Auto<span>Services</span>
</div>
                    <ul className="nav-links">
            <li><NavLink to="/" end className={({isActive}) => isActive ? "active-link" : ""}>📊 Overview</NavLink></li>
            <li><NavLink to="/vehicles" className={({isActive}) => isActive ? "active-link" : ""}>🚗 Vehicles</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/scanner" className={({isActive}) => isActive ? "active-link" : ""}>📷 Gate Scanner</NavLink></li>}
            <li><NavLink to="/health" className={({isActive}) => isActive ? "active-link" : ""}>🩺 Smart Health</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/alerts" className={({isActive}) => isActive ? "active-link" : ""}>🚨 Alerts</NavLink></li>}
            {(!isEmployee) && <li><NavLink to="/maintenance" className={({isActive}) => isActive ? "active-link" : ""}>🔧 Maintenance</NavLink></li>}
            <li><NavLink to="/reports" className={({isActive}) => isActive ? "active-link" : ""}>📈 Reports</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/geofences" className={({isActive}) => isActive ? "active-link" : ""}>📍 Geofences</NavLink></li>}
            <li><NavLink to="/inventory" className={({isActive}) => isActive ? "active-link" : ""}>📦 Parts Vault</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/finance" className={({isActive}) => isActive ? "active-link" : ""}>💰 Financial Management</NavLink></li>}
            {(!isEmployee) && <li><NavLink to="/registry" className={({isActive}) => isActive ? "active-link" : ""}>🏢 Registry</NavLink></li>}
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
            {(!isEmployee) && <Route path="/finance" element={<Finance token={token} />} />}
            {(!isEmployee) && <Route path="/registry" element={<Registry token={token} userRole={role} />} />}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
