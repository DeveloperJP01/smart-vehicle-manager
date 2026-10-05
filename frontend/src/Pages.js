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
  const [formData, setFormData] = React.useState({ ownerName: '', ownerPhone: '', makeAndModel: '', licensePlate: '', color: '', chassisNumber: '', engineNumber: '', currentOdometer: '' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/vehicles', { headers: { 'Authorization': 'Bearer ' + token } });
      if(res.ok) setVehicles(await res.json());
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
        setFormData({ ownerName: '', ownerPhone: '', makeAndModel: '', licensePlate: '', color: '', chassisNumber: '', engineNumber: '', currentOdometer: '' });
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
      <div className="page-header"><h1>🚘 Vehicles Dashboard</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        
        <div className="data-card" style={{ padding: '20px' }}>
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px', fontSize:'1.1em'}}>Register Vehicle</h2>
          <form onSubmit={handleSubmit} style={{padding:0, gap:'12px', display:'flex', flexDirection:'column'}}>
            <div className="input-group"><label>Owner Name</label><input placeholder="e.g. Rahul Sharma" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>Owner Phone</label><input placeholder="e.g. 9876543210" value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>Make & Model</label><input placeholder="e.g. Yamaha FZ-X" value={formData.makeAndModel} onChange={e => setFormData({...formData, makeAndModel: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>License Plate</label><input placeholder="e.g. MH-15-AB-1234" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>Color</label><input placeholder="e.g. Matt Copper" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>Chassis Number (Optional)</label><input placeholder="e.g. VGS123456" value={formData.chassisNumber} onChange={e => setFormData({...formData, chassisNumber: e.target.value})} style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
            <div className="input-group"><label>Engine Number (Optional)</label><input placeholder="e.g. ENG98765" value={formData.engineNumber} onChange={e => setFormData({...formData, engineNumber: e.target.value})} style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}} /></div>
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
                <th style={{padding:'12px', color:'#ffd700'}}>Chassis / Engine</th>
                <th style={{padding:'12px', color:'#ffd700'}}>Owner Name</th>
                <th style={{padding:'12px', color:'#ffd700'}}>Phone</th>
                <th style={{padding:'12px', color:'#ffd700'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? <tr><td colSpan="6" style={{padding:'20px', textAlign:'center', color:'#888'}}>No vehicles registered yet.</td></tr> : null}
              {vehicles.map(v => (
                <tr key={v.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'12px', fontWeight:'bold'}}>{v.licensePlate}</td>
                  <td style={{padding:'12px'}}>{v.makeAndModel} ({v.color})</td>
                  <td style={{padding:'12px'}}>{v.chassisNumber || 'N/A'} <br/> {v.engineNumber || 'N/A'}</td>
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
  const [alerts, setAlerts] = React.useState([]);
  const [inventoryAlerts, setInventoryAlerts] = React.useState([]);

  React.useEffect(() => { 
    fetch('/api/diagnostics', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setAlerts(data.filter(d => d.alerts.length > 0))); 
    
    fetch('/api/inventory', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setInventoryAlerts(data.filter(p => p.stockLevel < 10)));
  }, [token]);

  return (
    <div>
      <div className="page-header"><h1>⚠️ Alerts Log</h1></div>
      
      {inventoryAlerts.length > 0 && (
        <div className="data-card" style={{ marginBottom: '24px', border: '1px solid #ef4444' }}>
          <h2 style={{marginTop: 0, color: '#ef4444'}}>Low Stock Alerts</h2>
          <table>
            <thead><tr><th>Part Name</th><th>Serial #</th><th>Current Stock</th><th>Action</th></tr></thead>
            <tbody>
              {inventoryAlerts.map((p, i) => (
                <tr key={i}>
                  <td>{p.partName}</td>
                  <td>{p.serialNumber}</td>
                  <td style={{color: '#ef4444', fontWeight: 'bold'}}>{p.stockLevel}</td>
                  <td><span className="badge critical">RESTOCK REQUIRED</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="data-card">
        <h2 style={{marginTop: 0}}>Diagnostic Alerts</h2>
        <table>
          <thead><tr><th>Vehicle</th><th>Severity</th><th>Alert Details</th></tr></thead>
          <tbody>
            {alerts.length === 0 && <tr><td colSpan="3" style={{textAlign: 'center', color: '#888', padding: '20px'}}>No diagnostic alerts active.</td></tr>}
            {alerts.map((a, i) => (
              <tr key={i}>
                <td>{a.vehicle.licensePlate}</td>
                <td><span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span></td>
                <td>{a.alerts.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export const Maintenance = ({ token, userRole }) => {
  const [vehicles, setVehicles] = React.useState([]); 
  const [tickets, setTickets] = React.useState([]);
  const [parts, setParts] = React.useState([]);
  const [mechanics, setMechanics] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  
  const [searchTicket, setSearchTicket] = React.useState('');
  const [searchPart, setSearchPart] = React.useState('');
  const [partQuantity, setPartQuantity] = React.useState(1);
  const [aftermarketMods, setAftermarketMods] = React.useState('');
  
  const [formData, setFormData] = React.useState({ 
    vehicleSearch: '', mechanicName: '', serviceType: '', appointmentDate: '', appointmentTime: '', referencePhoto: null 
  });

  const fetchAllData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    const [vRes, tRes, pRes, mRes, uRes] = await Promise.all([ 
      fetch('/api/vehicles', { headers }), 
      fetch('/api/services', { headers }),
      fetch('/api/inventory', { headers }),
      fetch('/api/registry/mechanics', { headers }),
      fetch('/api/users', { headers })
    ]);
    if(vRes.ok) setVehicles(await vRes.json()); 
    if(tRes.ok) setTickets(await tRes.json());
    if(pRes.ok) setParts(await pRes.json());
    if(mRes.ok) setMechanics(await mRes.json());
    if(uRes.ok) setUsers(await uRes.json());
  };

  React.useEffect(() => { fetchAllData(); }, [token]);

  const generatePDF = (ticket) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Service Ticket Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
            .info-section { margin-top: 20px; line-height: 1.6; }
            .label { font-weight: bold; width: 150px; display: inline-block; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>AutoSense Service Invoice</h1>
          <div class="info-section">
            <div><span class="label">Ticket ID:</span>#${ticket.id}</div>
            <div><span class="label">Date/Time:</span>${ticket.appointmentDate} ${ticket.appointmentTime || ''}</div>
            <div><span class="label">Owner:</span>${ticket.customer?.username || ticket.customer?.ownerName || ticket.vehicle?.ownerName || 'Unknown'}</div>
            <div><span class="label">Vehicle:</span>${ticket.vehicle?.makeAndModel} (${ticket.vehicle?.licensePlate})</div>
            <div><span class="label">Odometer:</span>${ticket.vehicle?.currentOdometer || 0} km</div>
            <div><span class="label">Mechanic:</span>${ticket.assignedMechanic?.name || 'Unassigned'}</div>
            <div><span class="label">Service Type:</span>${ticket.serviceType}</div>
            <div><span class="label">Mods:</span>${ticket.aftermarketMods || 'None'}</div>
            <div><span class="label">Total Cost:</span>Rs. ${ticket.estimatedCost || 0}</div>
            <div style="margin-top: 20px; padding: 10px; background: #fff3cd; border: 1px solid #ffeeba;">
              <span class="label">Next Service Due:</span> 
              ${(ticket.vehicle?.currentOdometer || 0) + 5000} km (Recommended)
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const selectedMech = mechanics.find(m => m.name === formData.mechanicName);
    const mechId = selectedMech ? selectedMech.id : '';
    
    const selectedVehicle = vehicles.find(v => v.licensePlate === formData.vehicleSearch);
    if (!selectedVehicle) {
      alert("Please select a valid vehicle from the list.");
      return;
    }

    const payload = new FormData();
    payload.append("vehicleId", selectedVehicle.id);
    if (mechId) payload.append("mechanicId", mechId);
    payload.append("serviceType", formData.serviceType);
    payload.append("appointmentDate", formData.appointmentDate);
    if(formData.appointmentTime) payload.append("appointmentTime", formData.appointmentTime);

    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: payload
    });
    if(res.ok) {
      const createdTicket = await res.json();
      alert("Service ticket successfully created!");
      generatePDF(createdTicket);
      setFormData({ vehicleSearch: '', mechanicName: '', serviceType: '', appointmentDate: '', appointmentTime: '', referencePhoto: null });
      fetchAllData();
    } else {
      alert("Error creating ticket");
    }
  };

  const handleAttachPart = async (e) => {
    e.preventDefault();
    const t = tickets.find(t => `TKT-${t.id} - ${t.vehicle?.licensePlate}` === searchTicket);
    const p = parts.find(part => `${part.partName} (${part.serialNumber})` === searchPart);

    if (!t) {
      alert("Please select a valid ticket from the list.");
      return;
    }

    // First update the aftermarket mods if provided
    if (aftermarketMods) {
      await fetch(`/api/services/${t.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ aftermarketMods: aftermarketMods })
      });
    }

    if (p) {
      const res = await fetch(`/api/inventory/${p.id}/use?quantity=${partQuantity}&ticketId=${t.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }
    }

    alert("Active Job updated successfully!");
    fetchAllData(); 
    setSearchPart('');
    setAftermarketMods('');
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchAllData();
  };

  const handleCompleteTicket = async (id) => {
    if (!window.confirm("Mark ticket as Completed?")) return;
    await fetch(`/api/services/${id}/status`, { 
      method: 'PUT', 
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'text/plain' },
      body: "Completed"
    });
    fetchAllData();
  };

  const handleEditTicket = async (t) => {
    const newServiceType = window.prompt("Edit Service Type:", t.serviceType);
    if (newServiceType) {
      await fetch(`/api/services/${t.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: newServiceType })
      });
      fetchAllData();
    }
  };

  return (
    <div>
      <div className="page-header"><h1>🔧 Maintenance Operations</h1></div>
      
      <div className="data-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{marginTop: 0, marginBottom: '20px', color: '#ffd700'}}>Service Bay & Inventory Control</h2>
        
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{marginTop: 0, color: '#e8dcc5'}}>Schedule New Service Ticket</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

              <input list="vehicleList" placeholder="Search & Select Vehicle (License Plate)" value={formData.vehicleSearch} onChange={e => setFormData({...formData, vehicleSearch: e.target.value})} required style={{padding: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffd700', borderRadius: '12px'}} />
              <datalist id="vehicleList">
                {vehicles.map(v => <option key={v.id} value={v.licensePlate}>{v.makeAndModel}</option>)}
              </datalist>

              <input list="mechanicList" placeholder="Search & Select Mechanic" value={formData.mechanicName} onChange={e => setFormData({...formData, mechanicName: e.target.value})} style={{padding: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffd700', borderRadius: '12px'}} />
              <datalist id="mechanicList">
                {mechanics.map(m => <option key={m.id} value={m.name} />)}
              </datalist>

              <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} required style={{padding: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffd700', borderRadius: '12px'}}>
                <option value="">-- Select Service Type --</option>
                <option value="Minor service">Minor service (Rs 468)</option>
                <option value="Half service">Half service (Rs 1075)</option>
                <option value="Major service">Major service (Rs 1652)</option>
                <option value="Full Service">Full Service (Rs 2375)</option>
              </select>
              
              <div style={{display: 'flex', gap: '8px'}}>
                <input type="date" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5', borderRadius: '12px'}} />
                <input type="time" placeholder="Time (Optional)" value={formData.appointmentTime} onChange={e => setFormData({...formData, appointmentTime: e.target.value})} style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5', borderRadius: '12px'}} />
              </div>
              
              <button type="submit" className="primary" style={{gridColumn: 'span 2', padding: '12px', marginTop: '8px'}}>Create Service Ticket & Print PDF</button>
            </form>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{marginTop: 0, color: '#e8dcc5'}}>Attach Parts to Active Job</h3>
            <form onSubmit={handleAttachPart} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              <input list="activeTickets" placeholder="Search & Select Active Ticket" value={searchTicket} onChange={e => setSearchTicket(e.target.value)} required style={{padding: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffd700', borderRadius: '12px'}} />
              <datalist id="activeTickets">
                {tickets.filter(t => t.status !== 'Completed').map(t => (
                  <option key={t.id} value={`TKT-${t.id} - ${t.vehicle?.licensePlate}`}>{t.serviceType}</option>
                ))}
              </datalist>

              <input placeholder="Aftermarket Mods (if any)" value={aftermarketMods} onChange={e => setAftermarketMods(e.target.value)} style={{padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5', borderRadius: '12px'}} />

              <div style={{display: 'flex', gap: '8px', gridColumn: 'span 2'}}>
                <input list="vaultParts" placeholder="Search & Select Part from Vault (Optional)" value={searchPart} onChange={e => setSearchPart(e.target.value)} style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #d4af37', color: '#ffd700', borderRadius: '12px'}} />
                <datalist id="vaultParts">
                  {parts.filter(p => p.stockLevel > 0).map(p => (
                    <option key={p.id} value={`${p.partName} (${p.serialNumber})`}>{p.stockLevel} in stock</option>
                  ))}
                </datalist>

                <input type="number" min="1" value={partQuantity} onChange={e => setPartQuantity(parseInt(e.target.value))} style={{width: '70px', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid #d4af37', color: '#e8dcc5', borderRadius: '12px'}} />
                <button type="submit" className="primary" style={{padding: '12px 24px'}}>Update Job</button>
              </div>

            </form>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{marginTop: 0, color: '#e8dcc5'}}>Active Service Queue</h3>
            {tickets.length === 0 ? (
                <p style={{ color: 'gray', fontStyle: 'italic' }}>No active service tickets found.</p>
            ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
                      <th style={{padding: '12px', color: '#ffd700'}}>ID</th>
                      <th style={{padding: '12px', color: '#ffd700'}}>Vehicle</th>
                      <th style={{padding: '12px', color: '#ffd700'}}>Mechanic</th>
                      <th style={{padding: '12px', color: '#ffd700'}}>Status</th>
                      <th style={{padding: '12px', color: '#ffd700'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{padding: '12px', color: '#fff'}}>#{t.id}</td>
                        <td style={{padding: '12px', color: '#ccc'}}>{t.vehicle?.licensePlate}<br/><small>{t.serviceType}</small></td>
                        <td style={{padding: '12px', color: '#ccc'}}>{t.assignedMechanic?.name || 'Unassigned'}</td>
                        <td style={{padding: '12px'}}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em', background: t.status === 'Completed' ? '#065f46' : '#92400e', color: '#fff' }}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{padding: '12px', display: 'flex', gap: '5px'}}>
                          {t.status !== 'Completed' && <button onClick={() => handleCompleteTicket(t.id)} style={{background: '#059669', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Complete</button>}
                          <button onClick={() => handleEditTicket(t)} style={{background: '#d97706', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Edit</button>
                          <button onClick={() => generatePDF(t)} style={{background: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>PDF</button>
                          {userRole === 'Owner' && <button onClick={() => handleDeleteTicket(t.id)} style={{background: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Delete</button>}
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
  const [vehicles, setVehicles] = React.useState([]);
  const [searchVehicle, setSearchVehicle] = React.useState('');

  const generatePDF = (ticket) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Service Ticket Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
            .info-section { margin-top: 20px; line-height: 1.6; }
            .label { font-weight: bold; width: 150px; display: inline-block; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>AutoSense Service Invoice</h1>
          <div class="info-section">
            <div><span class="label">Ticket ID:</span>#${ticket.id}</div>
            <div><span class="label">Date/Time:</span>${ticket.appointmentDate} ${ticket.appointmentTime || ''}</div>
            <div><span class="label">Owner:</span>${ticket.customer?.username || ticket.customer?.ownerName || ticket.vehicle?.ownerName || 'Unknown'}</div>
            <div><span class="label">Vehicle:</span>${ticket.vehicle?.makeAndModel} (${ticket.vehicle?.licensePlate})</div>
            <div><span class="label">Odometer:</span>${ticket.vehicle?.currentOdometer || 0} km</div>
            <div><span class="label">Mechanic:</span>${ticket.assignedMechanic?.name || 'Unassigned'}</div>
            <div><span class="label">Service Type:</span>${ticket.serviceType}</div>
            <div><span class="label">Total Cost:</span>Rs. ${ticket.estimatedCost || 0}</div>
            <div style="margin-top: 20px; padding: 10px; background: #fff3cd; border: 1px solid #ffeeba;">
              <span class="label">Next Service Due:</span> 
              ${(ticket.vehicle?.currentOdometer || 0) + 5000} km (Recommended)
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  React.useEffect(() => { 
    if(token) {
      fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setTickets(Array.isArray(data) ? data : []))
        .catch(console.error); 
      fetch('/api/vehicles', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setVehicles(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [token]);

  const filteredTickets = searchVehicle ? tickets.filter(t => t.vehicle?.licensePlate === searchVehicle) : tickets;

  return (
    <div>
      <div className="page-header"><h1>📊 Financial & Service Reports</h1></div>
      <div className="data-card">
        <h2 style={{color: '#ffd700', marginTop: 0}}>Service History Report</h2>
        
        <div style={{marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center'}}>
          <label style={{color: '#e8dcc5'}}>Search & Select Vehicle:</label>
          <input list="vehicleSearchList" value={searchVehicle} onChange={e => setSearchVehicle(e.target.value)} placeholder="Enter License Plate" style={{padding: '10px', borderRadius: '6px', border: '1px solid #d4af37', background: 'rgba(0,0,0,0.5)', color: '#fff', width: '250px'}} />
          <datalist id="vehicleSearchList">
            {vehicles.map(v => <option key={v.id} value={v.licensePlate} />)}
          </datalist>
          {searchVehicle && <button onClick={() => setSearchVehicle('')} style={{padding: '8px 12px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '6px'}}>Clear</button>}
        </div>

        <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '1px solid rgba(212,175,55,0.4)'}}>
              <th style={{padding: '12px', color: '#ffd700'}}>Ticket ID</th>
              <th style={{padding: '12px', color: '#ffd700'}}>Date</th>
              <th style={{padding: '12px', color: '#ffd700'}}>Type</th>
              <th style={{padding: '12px', color: '#ffd700'}}>Vehicle</th>
              <th style={{padding: '12px', color: '#ffd700'}}>Status</th>
              <th style={{padding: '12px', color: '#ffd700'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 && <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center', color: '#888'}}>No service records found.</td></tr>}
            {filteredTickets.map(t => (
              <tr key={t.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                <td style={{padding: '12px'}}>#{t.id}</td>
                <td style={{padding: '12px'}}>{t.appointmentDate}</td>
                <td style={{padding: '12px'}}>{t.serviceType}</td>
                <td style={{padding: '12px'}}>{t.vehicle?.licensePlate}</td>
                <td style={{padding: '12px'}}>{t.status}</td>
                <td style={{padding: '12px'}}>
                  <button onClick={() => generatePDF(t)} className="primary" style={{padding: '6px 12px', fontSize: '12px'}}>Show PDF</button>
                </td>
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
  const [merchants, setMerchants] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [vaultSearch, setVaultSearch] = React.useState('');
  
  const [newItem, setNewItem] = React.useState({ partName: '', serialNumber: '', stockLevel: '', price: '', location: '' });
  const [order, setOrder] = React.useState({ merchant: { id: '' }, partName: '', serialNumber: '', quantity: 1 });

  const fetchData = async () => {
    const resP = await fetch('/api/inventory', { headers: { 'Authorization': `Bearer ${token}` } });
    if(resP.ok) setParts(await resP.json());
    const resM = await fetch('/api/registry/merchants', { headers: { 'Authorization': `Bearer ${token}` } });
    if(resM.ok) setMerchants(await resM.json());
    const resO = await fetch('/api/inventory/orders', { headers: { 'Authorization': `Bearer ${token}` } });
    if(resO.ok) setOrders(await resO.json());
  };

  React.useEffect(() => { fetchData(); }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newItem)
    });
    setNewItem({ partName: '', serialNumber: '', stockLevel: '', price: '', location: '' });
    fetchData();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/inventory/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchData();
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    await fetch('/api/inventory/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(order)
    });
    alert("Order placed successfully.");
    setOrder({ merchant: { id: '' }, partName: '', serialNumber: '', quantity: 1 });
    fetchData();
  };

  const filteredParts = parts.filter(p => 
    p.partName.toLowerCase().includes(vaultSearch.toLowerCase()) || 
    (p.serialNumber && p.serialNumber.toLowerCase().includes(vaultSearch.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header"><h1>📦 Parts Vault</h1></div>
      <div className="data-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <h2 style={{marginTop: 0, marginBottom: '20px'}}>Add New Part to Vault</h2>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
          <input placeholder="Part Name (e.g. Brake Pads)" value={newItem.partName} onChange={e => setNewItem({...newItem, partName: e.target.value})} required style={{padding: '10px'}} />
          <input placeholder="Serial Number" value={newItem.serialNumber} onChange={e => setNewItem({...newItem, serialNumber: e.target.value})} required style={{padding: '10px'}} />
          <input type="number" placeholder="Initial Stock" value={newItem.stockLevel} onChange={e => setNewItem({...newItem, stockLevel: parseInt(e.target.value) || ''})} required style={{padding: '10px'}} />
          <input type="number" step="0.01" placeholder="Price (Rs)" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || ''})} required style={{padding: '10px'}} />
          <input placeholder="Location (e.g. Aisle 4)" value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} required style={{padding: '10px', gridColumn: 'span 2'}} />
          <button type="submit" className="primary" style={{gridColumn: 'span 2', padding: '12px'}}>Add to Vault</button>
        </form>

        <h2 style={{marginTop: 0, marginBottom: '20px'}}>Order Parts from Merchant</h2>
        <form onSubmit={handleOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '30px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px' }}>
          <select value={order.merchant.id} onChange={e => setOrder({...order, merchant: { id: e.target.value }})} required style={{padding: '10px'}}>
            <option value="">Select Merchant</option>
            {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <input placeholder="Part Name" value={order.partName} onChange={e => setOrder({...order, partName: e.target.value})} required style={{padding: '10px'}} />
          <input placeholder="Serial Number" value={order.serialNumber} onChange={e => setOrder({...order, serialNumber: e.target.value})} required style={{padding: '10px'}} />
          <div style={{display: 'flex', gap: '8px'}}>
            <input type="number" min="1" placeholder="Qty" value={order.quantity} onChange={e => setOrder({...order, quantity: parseInt(e.target.value)})} required style={{padding: '10px', width: '80px'}} />
            <button type="submit" className="primary" style={{flex: 1}}>Order</button>
          </div>
        </form>
        
        {orders.length > 0 && (
          <div style={{marginBottom: '30px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px'}}>
            <h3 style={{marginTop: 0}}>Order History</h3>
            <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
              {orders.map(o => (
                <li key={o.id} style={{padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                  Ordered <strong>{o.quantity}x {o.partName} (Serial: {o.serialNumber})</strong> from {o.merchant?.name} on {new Date(o.orderDate).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
            <h2 style={{margin: 0}}>Current Vault Stock</h2>
            <input placeholder="Search Part by Name or Serial..." value={vaultSearch} onChange={e => setVaultSearch(e.target.value)} style={{padding: '8px', borderRadius: '6px', border: '1px solid #d4af37', background: 'rgba(0,0,0,0.5)', color: '#fff', width: '250px'}} />
        </div>
        
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <th style={{padding: '12px'}}>Part Name</th>
              <th style={{padding: '12px'}}>Serial #</th>
              <th style={{padding: '12px'}}>Stock</th>
              <th style={{padding: '12px'}}>Price</th>
              <th style={{padding: '12px'}}>Location</th>
              <th style={{padding: '12px'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredParts.length === 0 && <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center', color: '#888'}}>No parts match your search.</td></tr>}
            {filteredParts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{padding: '12px', color: '#fff'}}>{p.partName}</td>
                <td style={{padding: '12px', color: '#ccc', fontFamily: 'monospace'}}>{p.serialNumber || 'N/A'}</td>
                <td style={{padding: '12px', color: p.stockLevel < 10 ? '#ef4444' : '#10b981', fontWeight: 'bold'}}>
                  {p.stockLevel} {p.stockLevel < 10 && <span style={{marginLeft: '8px', fontSize: '0.8em', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px'}}>LOW STOCK</span>}
                </td>
                <td style={{padding: '12px', color: '#ffd700'}}>Rs. {p.price.toFixed(2)}</td>
                <td style={{padding: '12px', color: '#9ca3af'}}>{p.location || 'N/A'}</td>
                <td style={{padding: '12px'}}>
                  <button onClick={() => handleDelete(p.id)} style={{background: 'darkred', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export const Registry = ({ token, userRole }) => {
  const [mechanics, setMechanics] = React.useState([]);
  const [merchants, setMerchants] = React.useState([]);
  const [usersList, setUsersList] = React.useState([]);

  const [mechForm, setMechForm] = React.useState({ name: '', mobile: '' });
  const [merchForm, setMerchForm] = React.useState({ name: '', email: '', mobile: '', address: '', site: '' });
  const [userForm, setUserForm] = React.useState({ username: '', password: '', role: 'Employee', fullName: '' });

  const fetchData = async () => {
    try {
      const res1 = await fetch('/api/registry/mechanics', { headers: { 'Authorization': `Bearer ${token}` } });
      if(res1.ok) setMechanics(await res1.json());
      const res2 = await fetch('/api/registry/merchants', { headers: { 'Authorization': `Bearer ${token}` } });
      if(res2.ok) setMerchants(await res2.json());
      const res3 = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if(res3.ok) setUsersList(await res3.json());
    } catch(e) { console.error(e); }
  };

  React.useEffect(() => { fetchData(); }, [token]);

  const handleAddMechanic = async (e) => {
    e.preventDefault();
    await fetch('/api/registry/mechanics', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(mechForm) });
    setMechForm({ name: '', mobile: '' });
    fetchData();
  };

  const handleDeleteMechanic = async (id) => {
    if(!window.confirm("Delete mechanic?")) return;
    await fetch(`/api/registry/mechanics/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchData();
  };

  const handleAddMerchant = async (e) => {
    e.preventDefault();
    await fetch('/api/registry/merchants', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(merchForm) });
    setMerchForm({ name: '', email: '', mobile: '', address: '', site: '' });
    fetchData();
  };

  const handleDeleteMerchant = async (id) => {
    if(!window.confirm("Delete merchant?")) return;
    await fetch(`/api/registry/merchants/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchData();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (userRole === 'Manager' && userForm.role === 'Owner') {
      alert("Managers cannot create Owner level users.");
      return;
    }
    await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(userForm) });
    setUserForm({ username: '', password: '', role: 'Employee', fullName: '' });
    fetchData();
  };

  const handleDeleteUser = async (targetUser) => {
    if (userRole === 'Manager' && targetUser.role === 'Owner') {
      alert("Managers cannot delete Owner level users.");
      return;
    }
    if(!window.confirm(`Delete user ${targetUser.username}?`)) return;
    await fetch(`/api/users/${targetUser.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchData();
  };

  return (
    <div>
      <div className="page-header"><h1>📋 Registry & Access Control</h1></div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Mechanics */}
        <div className="data-card">
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px'}}>Mechanics Registry</h2>
          <form onSubmit={handleAddMechanic} style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
            <input placeholder="Name" value={mechForm.name} onChange={e=>setMechForm({...mechForm, name: e.target.value})} required style={{flex:1, padding:'8px'}} />
            <input placeholder="Mobile" value={mechForm.mobile} onChange={e=>setMechForm({...mechForm, mobile: e.target.value})} required style={{flex:1, padding:'8px'}} />
            <button type="submit" className="primary" style={{padding:'8px 16px'}}>Add</button>
          </form>
          <table style={{width:'100%', textAlign:'left', borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.2)'}}><th>Name</th><th>Mobile</th><th>Action</th></tr></thead>
            <tbody>
              {mechanics.map(m => (
                <tr key={m.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'8px'}}>{m.name}</td>
                  <td style={{padding:'8px'}}>{m.mobile}</td>
                  <td style={{padding:'8px'}}><button onClick={()=>handleDeleteMechanic(m.id)} style={{background:'darkred', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px'}}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Merchants */}
        <div className="data-card">
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px'}}>Merchants Registry</h2>
          <form onSubmit={handleAddMerchant} style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px'}}>
            <div style={{display:'flex', gap:'10px'}}>
              <input placeholder="Name" value={merchForm.name} onChange={e=>setMerchForm({...merchForm, name: e.target.value})} required style={{flex:1, padding:'8px'}} />
              <input placeholder="Email" type="email" value={merchForm.email} onChange={e=>setMerchForm({...merchForm, email: e.target.value})} required style={{flex:1, padding:'8px'}} />
            </div>
            <div style={{display:'flex', gap:'10px'}}>
              <input placeholder="Mobile" value={merchForm.mobile} onChange={e=>setMerchForm({...merchForm, mobile: e.target.value})} required style={{flex:1, padding:'8px'}} />
              <input placeholder="Address" value={merchForm.address} onChange={e=>setMerchForm({...merchForm, address: e.target.value})} required style={{flex:2, padding:'8px'}} />
            </div>
            <div style={{display:'flex', gap:'10px'}}>
              <input placeholder="Site (Optional)" value={merchForm.site} onChange={e=>setMerchForm({...merchForm, site: e.target.value})} style={{flex:2, padding:'8px'}} />
              <button type="submit" className="primary" style={{flex:1, padding:'8px 16px'}}>Add Merchant</button>
            </div>
          </form>
          <table style={{width:'100%', textAlign:'left', borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.2)'}}><th>Name</th><th>Email / Mobile</th><th>Address</th><th>Action</th></tr></thead>
            <tbody>
              {merchants.map(m => (
                <tr key={m.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'8px'}}>{m.name}<br/><small><a href={m.site} target="_blank" rel="noreferrer" style={{color:'#d4af37'}}>{m.site}</a></small></td>
                  <td style={{padding:'8px'}}>{m.email}<br/>{m.mobile}</td>
                  <td style={{padding:'8px'}}>{m.address}</td>
                  <td style={{padding:'8px'}}><button onClick={()=>handleDeleteMerchant(m.id)} style={{background:'darkred', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px'}}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Users (Employees) */}
        <div className="data-card" style={{gridColumn: 'span 2'}}>
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px'}}>User Access Management</h2>
          <form onSubmit={handleAddUser} style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
            <input placeholder="Full Name" value={userForm.fullName} onChange={e=>setUserForm({...userForm, fullName: e.target.value})} required style={{flex:1, padding:'8px'}} />
            <input placeholder="Username" value={userForm.username} onChange={e=>setUserForm({...userForm, username: e.target.value})} required style={{flex:1, padding:'8px'}} />
            <input type="password" placeholder="Password" value={userForm.password} onChange={e=>setUserForm({...userForm, password: e.target.value})} required style={{flex:1, padding:'8px'}} />
            <select value={userForm.role} onChange={e=>setUserForm({...userForm, role: e.target.value})} style={{flex:1, padding:'8px'}}>
              <option value="Employee">Employee (Limited)</option>
              <option value="Manager">Manager</option>
              <option value="Owner">Owner (Full Access)</option>
            </select>
            <button type="submit" className="primary" style={{padding:'8px 16px'}}>Create User</button>
          </form>
          <table style={{width:'100%', textAlign:'left', borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.2)'}}><th>Full Name</th><th>Username</th><th>Role Level</th><th>Action</th></tr></thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'8px'}}>{u.fullName || 'N/A'}</td>
                  <td style={{padding:'8px'}}>{u.username}</td>
                  <td style={{padding:'8px'}}><span className="badge" style={{background: u.role==='Owner'?'#dc2626':u.role==='Manager'?'#d97706':'#059669', color:'white'}}>{u.role || 'Employee'}</span></td>
                  <td style={{padding:'8px'}}>
                    <button onClick={()=>handleDeleteUser(u)} style={{background:'darkred', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', opacity: (userRole === 'Manager' && u.role === 'Owner') ? 0.5 : 1}} disabled={userRole === 'Manager' && u.role === 'Owner'}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
