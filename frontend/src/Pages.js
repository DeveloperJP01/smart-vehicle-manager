import Webcam from "react-webcam";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const Overview = ({ token }) => {
  const [stats, setStats] = useState({ fleetSize: 0, activeServices: 0, criticalAlerts: 0, completedBilling: 0 });
  useEffect(() => { fetch('/api/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setStats); }, [token]);
  
  const revenueData = [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 59000 },
    { name: 'Jun', revenue: 75000 },
    { name: 'Jul', revenue: stats.completedBilling > 0 ? stats.completedBilling : 82000 },
  ];

  return (
    <div>
      <div className="page-header"><h1>Overview</h1></div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-icon total">🚘</div><div className="kpi-data"><span className="kpi-val">{stats.fleetSize}</span><span className="kpi-label">Total Fleet</span></div></div>
        <div className="kpi-card"><div className="kpi-icon warning">🔧</div><div className="kpi-data"><span className="kpi-val">{stats.activeServices}</span><span className="kpi-label">Active Orders</span></div></div>
        <div className="kpi-card"><div className="kpi-icon critical">!</div><div className="kpi-data"><span className="kpi-val">{stats.criticalAlerts}</span><span className="kpi-label">Critical Alerts</span></div></div>
        <div className="kpi-card"><div className="kpi-icon healthy">₹</div><div className="kpi-data"><span className="kpi-val">₹{stats.completedBilling}</span><span className="kpi-label">Revenue</span></div></div>
      </div>

      <div className="data-card" style={{ marginTop: '24px', height: '400px', padding: '20px' }}>
        <h3 style={{ color: '#ffd700', marginTop: 0 }}>Revenue Trend (YTD)</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #d4af37' }} />
            <Legend />
            <Bar dataKey="revenue" fill="#d4af37" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const Vehicles = ({ token }) => {
  const [vehicles, setVehicles] = React.useState([]);
  const [formData, setFormData] = React.useState({ ownerName: '', ownerPhone: '', makeAndModel: '', licensePlate: '', color: '', currentOdometer: '' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/vehicles', { headers: { 'Authorization': 'Bearer ' + token } });
      if(res.ok) {
         const data = await res.json();
         setVehicles(Array.isArray(data) ? data : []); 
      }
    } catch(e) { console.error(e); }
  };

  React.useEffect(() => { fetchData(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, currentOdometer: Number(formData.currentOdometer) };
      const res = await fetch('/api/vehicles', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(payload) });
      if(res.ok) {
        fetchData();
        setFormData({ ownerName: '', ownerPhone: '', makeAndModel: '', licensePlate: '', color: '', currentOdometer: '' });
      } else {
        alert("Error registering vehicle");
      }
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete vehicle?')) return;
    try {
      const res = await fetch('/api/vehicles/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
      if (res.ok) fetchData();
    } catch(e) { console.error(e); }
  };

  return (
    <div>
      <div className="page-header"><h1>🚛 Vehicles Dashboard</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        
        <div className="data-card" style={{ padding: '20px' }}>
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px', fontSize:'1.1em'}}>Register Vehicle</h2>
          <form onSubmit={handleSubmit} style={{padding:0, gap:'12px', display:'flex', flexDirection:'column'}}>
            <div className="input-group"><label>Owner Name</label><input placeholder="e.g. Rahul Sharma" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>Owner Phone</label><input placeholder="e.g. 9876543210" value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>Make & Model</label><input placeholder="e.g. Yamaha FZ-X" value={formData.makeAndModel} onChange={e => setFormData({...formData, makeAndModel: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>License Plate</label><input placeholder="e.g. MH-15-AB-1234" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>Color</label><input placeholder="e.g. Matt Copper" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>Current Odometer</label><input type="number" placeholder="e.g. 15000" value={formData.currentOdometer} onChange={e => setFormData({...formData, currentOdometer: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <button type="submit" className="primary" style={{marginTop:'10px', padding:'12px'}}>Register Vehicle</button>
          </form>
        </div>

        <div className="data-card">
          <h2 style={{marginTop:0, marginBottom:'20px', color:'#ffd700'}}>Registered Vehicles Directory</h2>
          <table style={{width:'100%', textAlign:'left', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(212, 175, 55, 0.4)'}}>
                <th style={{padding:'12px', color:'#ffd700'}}>License Plate</th>
                <th style={{padding:'12px', color:'#ffd700'}}>Model & Color</th>
                <th style={{padding:'12px', color:'#ffd700'}}>Owner Name</th>
                <th style={{padding:'12px', color:'#ffd700'}}>Phone</th>
                <th style={{padding:'12px', color:'#ffd700'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#888'}}>No vehicles registered yet.</td></tr> : null}
              {vehicles.map(v => (
                <tr key={v.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'12px', fontWeight:'bold'}}>{v.licensePlate}</td>
                  <td style={{padding:'12px'}}>{v.makeAndModel} ({v.color})</td>
                  <td style={{padding:'12px'}}>{v.ownerName || "N/A"}</td>
                  <td style={{padding:'12px'}}>{v.ownerPhone || "N/A"}</td>
                  <td style={{padding:'12px'}}><button onClick={() => handleDelete(v.id)} style={{background:'#ef4444', color:'#fff', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const [users, setUsers] = React.useState([]); 
  const [vehicles, setVehicles] = React.useState([]); 
  const [tickets, setTickets] = React.useState([]);
  const [parts, setParts] = React.useState([]);
  const [selectedPartId, setSelectedPartId] = React.useState('');
  
  const [formData, setFormData] = React.useState({ 
    customerId: '', vehicleId: '', serviceType: '', appointmentDate: '', aftermarketMods: '', referencePhoto: null 
  });

  const fetchAllData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    const [uRes, vRes, tRes, pRes] = await Promise.all([ 
      fetch('/api/admin/users', { headers }), 
      fetch('/api/vehicles', { headers }), 
      fetch('/api/services', { headers }),
      fetch('/api/inventory', { headers })
    ]);
    if(uRes.ok) setUsers(await uRes.json()); 
    if(vRes.ok) setVehicles(await vRes.json()); 
    if(tRes.ok) setTickets(await tRes.json());
    if(pRes.ok) setParts(await pRes.json());
  };

  React.useEffect(() => { fetchAllData(); }, [token]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if(res.ok) {
      alert("Service ticket successfully created!");
      setFormData({ customerId: '', vehicleId: '', serviceType: '', appointmentDate: '', aftermarketMods: '', referencePhoto: null });
      fetchAllData();
    } else {
      alert("Error creating ticket");
    }
  };

  const handleAttachPart = async (e) => {
    e.preventDefault();
    if (!selectedPartId) return;

    const res = await fetch(`/api/inventory/${selectedPartId}/use?quantity=1`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      alert("Part attached to service and deducted from vault!");
      fetchAllData(); 
      setSelectedPartId('');
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div>
      <div className="page-header"><h1>🔧 Maintenance Operations</h1></div>
      
      <div className="data-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{marginTop: 0, marginBottom: '20px', color: '#ffd700'}}>Service Bay & Inventory Control</h2>
        
        {/* Service Ticket Form */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{marginTop: 0, color: '#e8dcc5'}}>Schedule New Service Ticket</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} required style={{padding: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffd700', borderRadius: '12px'}}>
                <option value="">-- Select Customer / User --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>

              <select value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} required style={{padding: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffd700', borderRadius: '12px'}}>
                <option value="">-- Select Vehicle --</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} - {v.makeAndModel}</option>)}
              </select>

              <input placeholder="Service Type (e.g. Oil Change)" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} required style={{padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5', borderRadius: '12px'}} />
              
              <input type="date" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required style={{padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5', borderRadius: '12px'}} />
              
              <input placeholder="Aftermarket Mods (if any)" value={formData.aftermarketMods} onChange={e => setFormData({...formData, aftermarketMods: e.target.value})} style={{padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5', borderRadius: '12px'}} />

              <button type="submit" className="primary" style={{gridColumn: 'span 2', padding: '12px', marginTop: '8px'}}>Create Service Ticket</button>
            </form>
        </div>

        {/* Smart Parts Vault Integration */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{marginTop: 0, color: '#e8dcc5'}}>Attach Parts to Active Job (Deducts from Vault)</h3>
            <form onSubmit={handleAttachPart} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <select 
                value={selectedPartId} 
                onChange={e => setSelectedPartId(e.target.value)} 
                style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffd700', borderRadius: '12px'}}
              >
                <option value="">-- Select Part from Vault --</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stockLevel === 0}>
                    {p.partName} ({p.stockLevel} in stock) - ₹{p.price.toFixed(2)}
                  </option>
                ))}
              </select>
              <button type="submit" className="primary" style={{padding: '12px 24px'}}>Use Part</button>
            </form>
        </div>

        {/* Active Service Queue Table */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{marginTop: 0, color: '#e8dcc5'}}>Active Service Queue</h3>
            {tickets.length === 0 ? (
                <p style={{ color: 'gray', fontStyle: 'italic' }}>No active service tickets found.</p>
            ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
                      <th style={{padding: '12px', color: '#ffd700'}}>Service Type</th>
                      <th style={{padding: '12px', color: '#ffd700'}}>Appointment</th>
                      <th style={{padding: '12px', color: '#ffd700'}}>Status</th>
                      <th style={{padding: '12px', color: '#ffd700', textAlign: 'right'}}>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{padding: '12px'}}>{t.serviceType}</td>
                        <td style={{padding: '12px'}}>{t.appointmentDate}</td>
                        <td style={{padding: '12px'}}><span className="badge">Active</span></td>
                        <td style={{padding: '12px', textAlign: 'right'}}>
                          <button 
                            onClick={() => window.open(`/api/invoices/${t.id}`, '_blank')}
                            style={{ background: '#ffd700', color: '#000', padding: '6px 12px', fontSize: '12px', boxShadow: 'none' }}
                          >
                            📄 Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export const Reports = ({ token }) => {
  const [tickets, setTickets] = React.useState([]);
  React.useEffect(() => { 
    if(token) {
      fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setTickets(Array.isArray(data) ? data : []))
        .catch(console.error); 
    }
  }, [token]);

  return (
    <div>
      <div className="page-header"><h1>📊 Financial & Service Reports</h1></div>
      <div className="data-card">
        <h2 style={{color: '#ffd700', marginTop: 0}}>Service History Report</h2>
        <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '1px solid rgba(212,175,55,0.4)'}}>
              <th style={{padding: '12px', color: '#ffd700'}}>Ticket ID</th>
              <th style={{padding: '12px', color: '#ffd700'}}>Date</th>
              <th style={{padding: '12px', color: '#ffd700'}}>Type</th>
              <th style={{padding: '12px', color: '#ffd700'}}>Vehicle ID</th>
              <th style={{padding: '12px', color: '#ffd700'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center', color: '#888'}}>No service records found.</td></tr>}
            {tickets.map(t => (
              <tr key={t.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                <td style={{padding: '12px'}}>TKT-{t.id}</td>
                <td style={{padding: '12px'}}>{t.appointmentDate}</td>
                <td style={{padding: '12px'}}>{t.serviceType}</td>
                <td style={{padding: '12px'}}>{t.vehicleId}</td>
                <td style={{padding: '12px'}}><button onClick={() => window.open(`/api/invoices/${t.id}`, '_blank')} className="primary" style={{padding: '6px 12px', fontSize: '12px'}}>Download PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Geofences = () => (
  <div>
    <div className="page-header"><h1>📍 Live GPS & Geofencing</h1><div className="live-indicator"><div className="live-dot"></div> Sat-Link Active</div></div>
    <div className="data-card" style={{padding:'20px'}}>
      <div style={{height: '500px', background: '#0a0c10', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)', position: 'relative', overflow: 'hidden'}}>
        {/* Mock Map Background Grid */}
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)'}}></div>
        
        {/* Mock Geofence Area */}
        <div style={{position: 'absolute', top: '20%', left: '30%', width: '350px', height: '250px', background: 'rgba(16, 185, 129, 0.1)', border: '2px dashed #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '1.2em'}}>Authorized Zone Alpha</div>
        
        {/* Mock Vehicle Trackers */}
        <div style={{position: 'absolute', top: '35%', left: '40%', fontSize: '24px'}}>🚙<span style={{color: '#fff', fontSize: '12px', marginLeft: '8px'}}>MH-15-AB-1234</span></div>
        <div style={{position: 'absolute', top: '55%', left: '60%', fontSize: '24px'}}>🚚<span style={{color: '#fff', fontSize: '12px', marginLeft: '8px'}}>DL-01-XYZ</span></div>
        <div style={{position: 'absolute', top: '75%', left: '20%', fontSize: '24px'}}>🚛
          <span style={{color: '#fff', fontSize: '12px', marginLeft: '8px'}}>KA-09-CD-99</span>
          <div style={{position:'absolute', top: '-25px', left: '10px', background: '#ef4444', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'}}>⚠ Out of bounds!</div>
        </div>
      </div>
    </div>
  </div>
);

export const Settings = ({ token }) => {
  return (
    <div>
      <div className="page-header"><h1>⚙️ Command Center Settings</h1></div>
      <div className="data-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <h2>System Settings</h2>
        <p>This module has been stripped of identity and mechanic logic per administrator request.</p>
      </div>
    </div>
  );
};

export const GateScanner = ({ token }) => {
  const webcamRef = React.useRef(null);
  const [scanResult, setScanResult] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scannedPlate, setScannedPlate] = React.useState('');
  const [serviceHistory, setServiceHistory] = React.useState([]);
  const [manualPlate, setManualPlate] = React.useState('');
  
  // Database-backed Scanner History
  const [scannerHistory, setScannerHistory] = React.useState([]);

  const fetchScanHistory = async () => {
    try {
      const res = await fetch('/api/alpr/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setScannerHistory(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchScanHistory();
  }, [token]);

  const fetchServicePassport = async (plate) => {
    setScannedPlate(plate);
    try {
      const histRes = await fetch(`/api/service-history/${plate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (histRes.ok) {
        setServiceHistory(await histRes.json());
      } else {
        setServiceHistory([]);
      }
    } catch (e) {
      setServiceHistory([]);
    }
  };

  const captureAndScan = async () => {
    setIsScanning(true); setError(null); setScanResult(null); setScannedPlate(''); setServiceHistory([]);
    const imageSrc = webcamRef.current ? webcamRef.current.getScreenshot() : null;
    
    try {
      const response = await fetch('/api/alpr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: imageSrc })
      });
      
      const data = await response.json();
      if (response.ok) { 
        setScanResult(data); 
        fetchServicePassport(data.licensePlate);
        fetchScanHistory(); // Refresh DB history table
      } 
      else { setError(data.error); }
    } catch (err) {
      setError("Server connection failed. Please ensure Spring Boot is running.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualLookup = async (e) => {
    e.preventDefault();
    if (!manualPlate.trim()) return;
    setError(null);

    try {
      const response = await fetch('/api/alpr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: 'MANUAL', manualPlate: manualPlate.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setScanResult(data);
        fetchServicePassport(data.licensePlate);
        fetchScanHistory();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Manual lookup failed.");
    }
    setManualPlate('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header"><h1>👁 Automated Gate Scanner & History</h1><div className="live-indicator"><div className="live-dot"></div> ALPR Active</div></div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Webcam & Scanner */}
        <div className="data-card" style={{ padding: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#ffd700' }}>Live Optical Feed (All Plates)</h3>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', display: 'block' }} />
          </div>
          
          <button onClick={captureAndScan} className="primary" style={{ width: '100%', marginTop: '15px', padding: '14px', fontSize: '1.05em' }} disabled={isScanning}>
            {isScanning ? 'Processing Telemetry...' : 'Engage Gate Scanner'}
          </button>

          {/* Manual Plate Fallback Search */}
          <form onSubmit={handleManualLookup} style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <input 
              placeholder="Scan or type any plate (e.g. DL-01-AB-9999)" 
              value={manualPlate} 
              onChange={e => setManualPlate(e.target.value)} 
              style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5', borderRadius: '8px' }} 
            />
            <button type="submit" style={{ padding: '10px 16px', background: '#d4af37', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Scan / Lookup
            </button>
          </form>

          {scanResult && (
            <div style={{ marginTop: '15px', padding: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#10b981' }}>Scanned Plate: {scanResult.licensePlate}</h4>
              <p style={{ margin: '2px 0', color: '#e2e8f0', fontSize: '13px' }}>Owner: {scanResult.ownerName}</p>
              <p style={{ margin: '2px 0', color: '#e2e8f0', fontSize: '13px' }}>Status: {scanResult.status}</p>
              <span className="badge healthy" style={{marginTop:'8px', display:'inline-block'}}>Gate Logged</span>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '15px', padding: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#ef4444' }}>Scan Error</h4>
              <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px' }}>{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Database-Backed Scanner History */}
        <div className="data-card" style={{ padding: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#ffd700' }}>📋 Scanner History (All Scans)</h3>
          {scannerHistory.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', marginTop: '20px' }}>No plates scanned yet.</p>
          ) : (
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
                    <th style={{ padding: '8px', color: '#ffd700' }}>Plate</th>
                    <th style={{ padding: '8px', color: '#ffd700' }}>Time</th>
                    <th style={{ padding: '8px', color: '#ffd700' }}>Status</th>
                    <th style={{ padding: '8px', color: '#ffd700' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scannerHistory.map((hist) => (
                    <tr key={hist.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#fff' }}>{hist.licensePlate}</td>
                      <td style={{ padding: '8px', color: '#aaa' }}>{hist.scanTime}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: hist.status === 'AUTHORIZED' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: hist.status === 'AUTHORIZED' ? '#10b981' : '#ef4444' }}>
                          {hist.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <button 
                          onClick={() => fetchServicePassport(hist.licensePlate)}
                          style={{ background: '#d4af37', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                        >
                          Passport
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* --- DIGITAL SERVICE PASSPORT TIMELINE WIDGET --- */}
      {scannedPlate && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#121212', border: '1px solid #d4af37', borderRadius: '8px' }}>
          <h3 style={{ color: '#d4af37', marginBottom: '15px' }}>📜 Digital Service Passport: {scannedPlate}</h3>
          {serviceHistory.length === 0 ? (
            <p style={{ color: '#888' }}>No recorded service history found for this vehicle. Unregistered visitor logs are active!</p>
          ) : (
            <div style={{ borderLeft: '2px solid #d4af37', paddingLeft: '20px', marginLeft: '10px' }}>
              {serviceHistory.map((item, index) => (
                <div key={index} style={{ position: 'relative', marginBottom: '20px' }}>
                  <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: '#d4af37', boxShadow: '0 0 8px #d4af37' }} />
                  <span style={{ fontSize: '12px', color: '#d4af37' }}>{item.serviceDate}</span>
                  <h4 style={{ color: '#fff', margin: '4px 0' }}>{item.serviceType}</h4>
                  <p style={{ color: '#ccc', fontSize: '14px', margin: '0' }}>{item.description}</p>
                  <span style={{ fontSize: '12px', color: '#00ffcc' }}>Cost: ₹{item.cost}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Inventory = ({ token }) => {
  const [parts, setParts] = React.useState([]);
  const [name, setName] = React.useState('');
  const [stock, setStock] = React.useState('');
  const [price, setPrice] = React.useState('');

  const fetchParts = async () => {
    const res = await fetch('/api/inventory', { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) setParts(await res.json());
  };
  React.useEffect(() => { fetchParts(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ partName: name, stockLevel: parseInt(stock), warningLevel: 5, price: parseFloat(price) })
    });
    setName(''); setStock(''); setPrice(''); fetchParts();
  };

  return (
    <div>
      <div className="page-header"><h1>📦 Smart Parts Vault</h1></div>
      <div className="data-card">
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input placeholder="Part Name (e.g. Brake Pads)" value={name} onChange={e => setName(e.target.value)} required style={{flex: 2, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5'}} />
          <input type="number" placeholder="Stock Level" value={stock} onChange={e => setStock(e.target.value)} required style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5'}} />
          <input type="number" placeholder="Price (₹)" value={price} step="0.01" onChange={e => setPrice(e.target.value)} required style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5'}} />
          <button type="submit" className="primary" style={{padding: '12px 24px'}}>Add to Vault</button>
        </form>

        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
              <th style={{padding: '16px', color: '#ffd700'}}>Part Name</th>
              <th style={{padding: '16px', color: '#ffd700'}}>Stock</th>
              <th style={{padding: '16px', color: '#ffd700'}}>Price</th>
              <th style={{padding: '16px', color: '#ffd700'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {parts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{padding: '16px'}}>{p.partName}</td>
                <td style={{padding: '16px', fontWeight: 'bold'}}>{p.stockLevel}</td>
                <td style={{padding: '16px'}}>₹{p.price.toFixed(2)}</td>
                <td style={{padding: '16px'}}>
                  {p.stockLevel <= p.warningLevel ? (
                    <span style={{background: '#ef4444', color: '#fff', padding: '6px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: 'bold'}}>LOW STOCK</span>
                  ) : (
                    <span style={{background: 'rgba(212, 175, 55, 0.2)', color: '#ffd700', padding: '6px 12px', borderRadius: '50px', fontSize: '12px'}}>OPTIMAL</span>
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
