import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { GateScanner, Overview, Vehicles, SmartHealth, Alerts, Maintenance, Reports, Geofences,  Inventory, Registry, Finance } from './Pages';

function App() {
  // Always open on login page first for security
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
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

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: username, 2: answer, 3: new password, 4: success
  const [forgotUser, setForgotUser] = useState('');
  const [forgotQuestion, setForgotQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const resetForgotState = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotUser('');
    setForgotQuestion('');
    setForgotAnswer('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotLoading(false);
  };

  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    if (!forgotUser.trim()) {
      setForgotError('Please enter your username.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/auth/security-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotUser.trim() })
      });
      const data = await res.json();
      if (res.ok && data.question) {
        setForgotQuestion(data.question);
        setForgotStep(2);
      } else {
        setForgotError(data.error || 'Failed to retrieve security question.');
      }
    } catch (err) {
      setForgotError('Network error connecting to server.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    if (!forgotAnswer.trim()) {
      setForgotError('Please enter your security answer.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/auth/verify-security-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotUser.trim(), answer: forgotAnswer.trim() })
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setForgotStep(3);
      } else {
        setForgotError(data.error || 'Incorrect security answer. Please try again.');
      }
    } catch (err) {
      setForgotError('Network error verifying answer.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotNewPassword.trim()) {
      setForgotError('Please enter a new password.');
      return;
    }
    if (forgotNewPassword.trim().length < 4) {
      setForgotError('Password must be at least 4 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUser.trim(),
          answer: forgotAnswer.trim(),
          newPassword: forgotNewPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotStep(4);
      } else {
        setForgotError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setForgotError('Network error resetting password.');
    } finally {
      setForgotLoading(false);
    }
  };

  if (!token) return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background: 'transparent'}}>
      {!showForgot ? (
        <form onSubmit={handleLogin} className="data-card" style={{ padding:'44px 36px', borderRadius:'20px', width:'380px', margin: 0, boxShadow: '0 20px 50px rgba(0,0,0,0.6)'}}>
          <div style={{textAlign:'center', marginBottom: '24px'}}>
            <h2 style={{ margin: 0, fontSize: '1.6em', color: '#f8fafc' }}>Premium Auto <span style={{color: '#9f1239'}}>Services</span></h2>
            <p style={{ margin: '6px 0 0', fontSize: '0.85em', color: '#94a3b8' }}>Vehicle Service & Maintenance Platform</p>
          </div>
          <input placeholder="Username" value={credentials.username} onChange={e => setCredentials({...credentials, username: e.target.value})} style={{marginBottom:'16px'}}/>
          <input type="password" placeholder="Password" value={credentials.password} onChange={e => setCredentials({...credentials, password: e.target.value})} style={{marginBottom:'24px'}}/>
          <button className="primary" type="submit" style={{width:'100%', padding: '14px', background: '#9f1239', color: '#ffffff', border: '1px solid #be123c', fontWeight: 600}}>Sign In</button>
          
          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <button 
              type="button" 
              onClick={() => { setShowForgot(true); setForgotStep(1); setForgotError(''); }} 
              style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '0.85em', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Forgot Password?
            </button>
          </div>
        </form>
      ) : (
        <div className="data-card" style={{ padding:'40px 34px', borderRadius:'20px', width:'420px', margin: 0, boxShadow: '0 20px 50px rgba(0,0,0,0.6)'}}>
          <div style={{textAlign:'center', marginBottom: '20px'}}>
            <h2 style={{ margin: 0, fontSize: '1.45em', color: '#f8fafc' }}>
              {forgotStep === 1 && 'Account Recovery'}
              {forgotStep === 2 && 'Security Verification'}
              {forgotStep === 3 && 'Change Password'}
              {forgotStep === 4 && 'Password Reset Complete'}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '0.82em', color: '#94a3b8' }}>
              {forgotStep === 1 && 'Enter your username to look up your security question.'}
              {forgotStep === 2 && 'Answer your security question correctly to proceed.'}
              {forgotStep === 3 && 'Enter your new password below.'}
              {forgotStep === 4 && 'Your password has been successfully updated.'}
            </p>
          </div>

          {forgotError && (
            <div style={{ background: 'rgba(159, 18, 57, 0.25)', border: '1px solid #9f1239', color: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85em', marginBottom: '16px', textAlign: 'center' }}>
              {forgotError}
            </div>
          )}

          {forgotStep === 1 && (
            <form onSubmit={handleFetchQuestion}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82em', color: '#cbd5e1', marginBottom: '6px' }}>Registered Username</label>
                <input 
                  type="text" 
                  placeholder="Enter your username" 
                  value={forgotUser} 
                  onChange={e => setForgotUser(e.target.value)} 
                  autoFocus 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="primary" 
                disabled={forgotLoading}
                style={{ width:'100%', padding: '12px', background: '#9f1239', color: '#ffffff', border: '1px solid #be123c', fontWeight: 600, marginBottom: '12px' }}
              >
                {forgotLoading ? 'Checking...' : 'Continue'}
              </button>
              <button 
                type="button" 
                onClick={resetForgotState} 
                style={{ width:'100%', padding: '10px', background: 'transparent', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer' }}
              >
                Back to Sign In
              </button>
            </form>
          )}

          {forgotStep === 2 && (
            <form onSubmit={handleVerifyAnswer}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75em', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Question:</div>
                <div style={{ fontSize: '0.95em', color: '#ffffff', fontWeight: 600, marginTop: '4px' }}>{forgotQuestion}</div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82em', color: '#cbd5e1', marginBottom: '6px' }}>Your Answer</label>
                <input 
                  type="text" 
                  placeholder="Enter security answer" 
                  value={forgotAnswer} 
                  onChange={e => setForgotAnswer(e.target.value)} 
                  autoFocus 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="primary" 
                disabled={forgotLoading}
                style={{ width:'100%', padding: '12px', background: '#9f1239', color: '#ffffff', border: '1px solid #be123c', fontWeight: 600, marginBottom: '12px' }}
              >
                {forgotLoading ? 'Verifying...' : 'Verify Answer'}
              </button>
              <button 
                type="button" 
                onClick={() => { setForgotStep(1); setForgotError(''); }} 
                style={{ width:'100%', padding: '10px', background: 'transparent', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer' }}
              >
                Back
              </button>
            </form>
          )}

          {forgotStep === 3 && (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82em', color: '#cbd5e1', marginBottom: '6px' }}>New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  value={forgotNewPassword} 
                  onChange={e => setForgotNewPassword(e.target.value)} 
                  autoFocus 
                  required 
                />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82em', color: '#cbd5e1', marginBottom: '6px' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={forgotConfirmPassword} 
                  onChange={e => setForgotConfirmPassword(e.target.value)} 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="primary" 
                disabled={forgotLoading}
                style={{ width:'100%', padding: '12px', background: '#9f1239', color: '#ffffff', border: '1px solid #be123c', fontWeight: 600, marginBottom: '12px' }}
              >
                {forgotLoading ? 'Updating...' : 'Change Password'}
              </button>
              <button 
                type="button" 
                onClick={resetForgotState} 
                style={{ width:'100%', padding: '10px', background: 'transparent', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </form>
          )}

          {forgotStep === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', color: '#ffffff', marginBottom: '12px' }}>✓</div>
              <p style={{ color: '#f8fafc', fontSize: '0.95em', marginBottom: '20px' }}>
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <button 
                type="button" 
                onClick={resetForgotState} 
                style={{ width:'100%', padding: '12px', background: '#9f1239', color: '#ffffff', border: '1px solid #be123c', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const role = user?.role?.toUpperCase() || 'EMPLOYEE';
  const isOwner = role === 'OWNER';
  const isManager = role === 'MANAGER';
  const isEmployee = role === 'EMPLOYEE';
  const isViewer = role === 'VIEWER';

  return (
    <Router>
      <div className="app-layout" data-theme="glass">
        
        {/* EXACT 10-MODULE SIDEBAR */}
        <nav className="sidebar">
          <div className="sidebar-brand" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 16L3 5L8.5 4L10 8H14L15.5 4L21 5L19 16H5Z" fill="url(#grad1)"/>
    <circle cx="8" cy="19" r="2.5" fill="#f8fafc"/>
    <circle cx="16" cy="19" r="2.5" fill="#f8fafc"/>
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#be123c" />
        <stop offset="100%" stopColor="#4c0519" />
      </linearGradient>
    </defs>
  </svg>
  Premium Auto<span>Services</span>
</div>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({isActive}) => isActive ? "active-link" : ""}>📊 Overview</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/scanner" className={({isActive}) => isActive ? "active-link" : ""}>📷 Gate Scanner</NavLink></li>}
            <li><NavLink to="/vehicles" className={({isActive}) => isActive ? "active-link" : ""}>🚗 Vehicles</NavLink></li>
            <li><NavLink to="/maintenance" className={({isActive}) => isActive ? "active-link" : ""}>🔧 Maintenance</NavLink></li>
            <li><NavLink to="/reports" className={({isActive}) => isActive ? "active-link" : ""}>📈 Reports</NavLink></li>
            {(!isEmployee) && <li><NavLink to="/geofences" className={({isActive}) => isActive ? "active-link" : ""}>📍 Geofences</NavLink></li>}
            {(!isEmployee) && <li><NavLink to="/alerts" className={({isActive}) => isActive ? "active-link" : ""}>🚨 Alerts</NavLink></li>}
            {(!isEmployee) && <li><NavLink to="/inventory" className={({isActive}) => isActive ? "active-link" : ""}>📦 Parts Vault</NavLink></li>}
            {(!isEmployee) && <li><NavLink to="/finance" className={({isActive}) => isActive ? "active-link" : ""}>💰 Financial Management</NavLink></li>}
            {(!isEmployee) && <li><NavLink to="/registry" className={({isActive}) => isActive ? "active-link" : ""}>🏢 Registry</NavLink></li>}
          </ul>
          <div className="sidebar-user" onClick={logout}>
            <div className="user-avatar-circle">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            <div className="user-details"><span className="user-name">{user?.username || 'User'}</span><span className="user-role">{role === 'VIEWER' ? 'VIEWER (READ-ONLY)' : role} / Logout</span></div>
          </div>
        </nav>

        {/* DYNAMIC CONTENT ROUTER */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Overview token={token} userRole={role} />} />
            {(!isEmployee) && <Route path="/scanner" element={<GateScanner token={token} userRole={role} />} />}
            <Route path="/vehicles" element={<Vehicles token={token} userRole={role} />} />
            <Route path="/maintenance" element={<Maintenance token={token} userRole={role} />} />
            <Route path="/reports" element={<Reports token={token} userRole={role} />} />
            {(!isEmployee) && <Route path="/geofences" element={<Geofences userRole={role} />} />}
            {(!isEmployee) && <Route path="/alerts" element={<Alerts token={token} userRole={role} />} />}
            {(!isEmployee) && <Route path="/inventory" element={<Inventory token={token} userRole={role} />} />}
            {(!isEmployee) && <Route path="/finance" element={<Finance token={token} userRole={role} />} />}
            {(!isEmployee) && <Route path="/registry" element={<Registry token={token} userRole={role} />} />}
            <Route path="/health" element={<SmartHealth token={token} userRole={role} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
