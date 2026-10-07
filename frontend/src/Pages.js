import Webcam from "react-webcam";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const Overview = ({ token }) => {
  const [stats, setStats] = useState({ fleetSize: 0, activeServices: 0, criticalAlerts: 0, completedBilling: 0 });
  const [vehiclesCount, setVehiclesCount] = React.useState(0);
  const [alertsCount, setAlertsCount] = React.useState(0);
  const [tickets, setTickets] = React.useState([]);

  useEffect(() => { 
    fetch('/api/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }).then(async r => { const t=await r.text(); try { return t?JSON.parse(t):null; } catch(e) { return null; } }).then(data => { if(data) setStats(data); });
    fetch('/api/vehicles', { headers: { 'Authorization': `Bearer ${token}` } }).then(async r => { const t=await r.text(); try { return t?JSON.parse(t):[]; } catch(e) { return []; } }).then(v => setVehiclesCount(v?.length || 0));
    fetch('/api/diagnostics', { headers: { 'Authorization': `Bearer ${token}` } }).then(async r => { const t=await r.text(); try { return t?JSON.parse(t):[]; } catch(e) { return []; } }).then(data => setAlertsCount(data?.filter(d => d.alerts?.length > 0)?.length || 0));
    fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } }).then(async r => { const t=await r.text(); try { return t?JSON.parse(t):[]; } catch(e) { return []; } }).then(setTickets);
  }, [token]);
  
  const performanceData = [
    { name: 'Jan', completed: 40, pending: 5 },
    { name: 'Feb', completed: 45, pending: 8 },
    { name: 'Mar', completed: 42, pending: 4 },
    { name: 'Apr', completed: 50, pending: 10 },
    { name: 'May', completed: 55, pending: 12 },
    { name: 'Jun', completed: 60, pending: 6 },
    { name: 'Jul', completed: stats?.completedBilling > 0 ? 15 : 65, pending: stats?.activeServices || 8 },
  ];

  const scheduledServices = tickets?.filter(t => t.status !== 'Completed') || [];

  return (
    <div>
      <div className="page-header"><h1>Overview</h1></div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-icon total">🚗</div><div className="kpi-data"><span className="kpi-val">{vehiclesCount}</span><span className="kpi-label">Total Vehicles</span></div></div>
        <div className="kpi-card"><div className="kpi-icon warning">⚠️</div><div className="kpi-data"><span className="kpi-val">{stats?.activeServices || 0}</span><span className="kpi-label">Active Orders</span></div></div>
        <div className="kpi-card"><div className="kpi-icon critical">🚨</div><div className="kpi-data"><span className="kpi-val">{alertsCount}</span><span className="kpi-label">Critical Alerts</span></div></div>
        <div className="kpi-card"><div className="kpi-icon healthy">✅</div><div className="kpi-data"><span className="kpi-val">Rs. {(stats?.completedBilling || 0).toFixed(2)}</span><span className="kpi-label">Revenue</span></div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        <div className="data-card" style={{ height: '400px', padding: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Garage Performance</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" stroke="#52525b" />
              <YAxis stroke="#52525b" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d8' }} />
              <Legend />
              <Bar dataKey="completed" fill="var(--maroon)" name="Completed Services" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="var(--dark-grey)" name="Pending Services" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="data-card" style={{ height: '400px', padding: '20px', overflowY: 'auto' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--mid-grey)', paddingBottom: '10px' }}>Today's Scheduled Services</h3>
          {scheduledServices.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--dark-grey)' }}>No services scheduled for today.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {scheduledServices.map(t => (
                <li key={t.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--light-grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ fontSize: '1.1em' }}>{t.vehicle?.licensePlate || 'Unknown Vehicle'}</strong>
                  <span style={{ color: 'var(--black)', fontSize: '0.9em' }}>{t.serviceType || 'General Service'}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', color: 'var(--maroon)' }}>
                    <span>{new Date(t.appointmentDate).toLocaleDateString()} {t.appointmentTime}</span>
                    <span style={{ fontWeight: 'bold' }}>{t.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
export const Vehicles = ({ token }) => {
  const [vehicles, setVehicles] = React.useState([]);
  const [formData, setFormData] = React.useState({ ownerName: '', ownerPhone: '', vehicleType: '', makeAndModel: '', licensePlate: '', color: '', chassisNumber: '', engineNumber: '', currentOdometer: '' });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/vehicles', { headers: { 'Authorization': 'Bearer ' + token } });
      if(res.ok) setVehicles(await res.json());
    } catch(e) { console.error(e); }
  };
  React.useEffect(() => { fetchData(); }, [token]);
  React.useEffect(() => {
    try {
      const hashParts = window.location.hash.split('?');
      if (hashParts.length > 1) {
        const params = new URLSearchParams(hashParts[1]);
        const plate = params.get('plate');
        if (plate) {
          setFormData(prev => ({...prev, licensePlate: plate}));
        }
      }
    } catch(e) {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, currentOdometer: Number(formData.currentOdometer) };
      const res = await fetch('/api/vehicles', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(payload) });
      if(res.ok) {
        fetchData();
        setFormData({ ownerName: '', ownerPhone: '', vehicleType: '', makeAndModel: '', licensePlate: '', color: '', chassisNumber: '', engineNumber: '', currentOdometer: '' });
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
            <div className="input-group"><label>Owner Name</label><input placeholder="e.g. Rahul Sharma" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24'}} /></div>
            <div className="input-group"><label>Owner Phone</label><input placeholder="e.g. 9876543210" value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24'}} /></div>
            <div className="input-group"><label>Vehicle Type</label><select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24', color:'#fff'}}><option value="" style={{color:'#000'}}>-- Select Type --</option><option value="Motorbike" style={{color:'#000'}}>Motorbike</option><option value="Scooter" style={{color:'#000'}}>Scooter</option><option value="Car" style={{color:'#000'}}>Car</option><option value="Heavy Vehicle" style={{color:'#000'}}>Heavy Vehicle</option></select></div>
            <div className="input-group"><label>Make & Model</label><input placeholder="e.g. Yamaha FZ-X" value={formData.makeAndModel} onChange={e => setFormData({...formData, makeAndModel: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24'}} /></div>
            <div className="input-group"><label>License Plate</label><input placeholder="e.g. MH-15-AB-1234" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24'}} /></div>
            <div className="input-group"><label>Color</label><input placeholder="e.g. Matt Copper" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24'}} /></div>
            <div className="input-group"><label>Chassis Number (Optional)</label><input placeholder="e.g. VGS123456" value={formData.chassisNumber} onChange={e => setFormData({...formData, chassisNumber: e.target.value})} style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24'}} /></div>
            <div className="input-group"><label>Engine Number (Optional)</label><input placeholder="e.g. ENG98765" value={formData.engineNumber} onChange={e => setFormData({...formData, engineNumber: e.target.value})} style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24'}} /></div>
            <div className="input-group"><label>Current Odometer</label><input type="number" placeholder="e.g. 15000" value={formData.currentOdometer} onChange={e => setFormData({...formData, currentOdometer: e.target.value})} required style={{padding:'10px', borderRadius:'6px', border:'1px solid #333', background:'#1a1a24'}} /></div>
            <button type="submit" className="primary" style={{marginTop:'10px', padding:'12px'}}>Register Vehicle</button>
          </form>
        </div>

        <div className="data-card">
          <h2 style={{marginTop:0, marginBottom:'20px'}}>Registered Vehicles Directory</h2>
          <table style={{width:'100%', textAlign:'left', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(212, 175, 55, 0.4)'}}>
                <th style={{padding:'12px'}}>License Plate</th>
                <th style={{padding:'12px'}}>Type</th>
                <th style={{padding:'12px'}}>Model & Color</th>
                <th style={{padding:'12px'}}>Chassis / Engine</th>
                <th style={{padding:'12px'}}>Owner Name</th>
                <th style={{padding:'12px'}}>Phone</th>
                <th style={{padding:'12px'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles?.length === 0 ? <tr><td colSpan="6" style={{padding:'20px', textAlign:'center'}}>No vehicles registered yet.</td></tr> : null}
              {vehicles?.map(v => (
                <tr key={v.id} style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'12px', fontWeight:'bold'}}>{v.licensePlate}</td>
                  <td style={{padding:'12px'}}>{v.vehicleType || 'N/A'}</td>
                  <td style={{padding:'12px'}}>{v.makeAndModel} ({v.color})</td>
                  <td style={{padding:'12px'}}>{v.chassisNumber || 'N/A'} <br/> {v.engineNumber || 'N/A'}</td>
                  <td style={{padding:'12px'}}>{v.ownerName || "N/A"}</td>
                  <td style={{padding:'12px'}}>{v.ownerPhone || "N/A"}</td>
                  <td style={{padding:'12px'}}><button onClick={() => handleDelete(v.id)} style={{border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}>Delete</button></td>
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
  const critical = diagnostics?.filter(d => d.status === 'CRITICAL')?.length || 0; const warning = diagnostics?.filter(d => d.status === 'WARNING')?.length || 0; const healthy = diagnostics?.filter(d => d.status === 'OPTIMAL')?.length || 0;
  return (
    <div>
      <div className="page-header"><h1>🩺 Smart Health</h1><div className="live-indicator"><div className="live-dot"></div> Live</div></div>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-icon critical">🚨</div><div className="kpi-data"><span className="kpi-val">{critical}</span><span className="kpi-label">Critical</span></div></div>
        <div className="kpi-card"><div className="kpi-icon warning">⚠️</div><div className="kpi-data"><span className="kpi-val">{warning}</span><span className="kpi-label">Warning</span></div></div>
        <div className="kpi-card"><div className="kpi-icon healthy">✅</div><div className="kpi-data"><span className="kpi-val">{healthy}</span><span className="kpi-label">Healthy</span></div></div>
        <div className="kpi-card"><div className="kpi-icon total">🚗</div><div className="kpi-data"><span className="kpi-val">{diagnostics?.length || 0}</span><span className="kpi-label">Total</span></div></div>
      </div>
      <div className="data-card">
        {diagnostics?.map((d, i) => (
          <div className="health-row" key={i}>
            <div className="vehicle-thumb">🚙</div><div><div className="v-plate">{d.vehicle?.licensePlate}</div><div className="v-model">{d.vehicle?.makeAndModel} ({d.vehicle?.color})</div></div>
            <div><span className={`badge ${d.status === 'OPTIMAL' ? 'healthy' : d.status.toLowerCase()}`}>{d.status === 'OPTIMAL' ? 'Healthy' : d.status}</span></div>
            <ul className="alert-list">{d.alerts?.length === 0 ? <li><span className="alert-dot" ></span> All normal</li> : d.alerts?.map((a, j) => <li key={j}><span className={`alert-dot ${d.status}`}></span> {a}</li>)}</ul>
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
      .then(data => setAlerts(data?.filter(d => d.alerts?.length > 0))); 
    
    fetch('/api/inventory', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setInventoryAlerts(data?.filter(p => p.stockLevel < 10)));
  }, [token]);

  return (
    <div>
      <div className="page-header"><h1>⚠️ Alerts Log</h1></div>
      
      
        <div className="data-card" style={{ marginBottom: '24px', border: '1px solid #ef4444' }}>
          <h2 style={{marginTop: 0}}>Low Stock Alerts</h2>
          <table>
            <thead><tr><th>Part Name</th><th>Serial #</th><th>Current Stock</th><th>Action</th></tr></thead>
            <tbody>
            {(!inventoryAlerts || inventoryAlerts.length === 0) && <tr><td colSpan="4" style={{textAlign:"center", padding:"20px"}}>No low stock alerts.</td></tr>}
                {inventoryAlerts?.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>No low stock alerts.</td></tr>}
            {inventoryAlerts?.map((p, i) => (
                <tr key={i}>
                  <td>{p.partName}</td>
                  <td>{p.serialNumber}</td>
                  <td style={{fontWeight: 'bold'}}>{p.stockLevel}</td>
                  <td><span className="badge critical">RESTOCK REQUIRED</span></td>
                </tr>
              ))}
          </tbody></table>
          </div>

        <div className="data-card">
        <h2 style={{marginTop: 0}}>Diagnostic Alerts</h2>
        <table>
          <thead><tr><th>Vehicle</th><th>Severity</th><th>Alert Details</th></tr></thead>
          <tbody>
            {alerts?.length === 0 && <tr><td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>No diagnostic alerts active.</td></tr>}
            {alerts?.map((a, i) => (
              <tr key={i}>
                <td>{a.vehicle?.licensePlate}</td>
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
    const [mechanicId, setMechanicId] = React.useState('');
    const [mechanicSearch, setMechanicSearch] = React.useState('');
  
  const [formData, setFormData] = React.useState({ 
    vehicleSearch: '', serviceType: '', appointmentDate: '', appointmentTime: '', referencePhoto: null 
  });

  const fetchAllData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    const [vRes, tRes, pRes, uRes, eRes] = await Promise.all([ fetch('/api/vehicles', { headers }), fetch('/api/services', { headers }), fetch('/api/inventory', { headers }), fetch('/api/users', { headers }), fetch('/api/registry/employees', { headers }) ]);
    if(vRes.ok) setVehicles(await vRes.json()); 
    if(tRes.ok) setTickets(await tRes.json());
    if(pRes.ok) setParts(await pRes.json());
      if(eRes.ok) { const allEmps = await eRes.json(); setMechanics(allEmps.filter(e => e.post?.toLowerCase().includes("mechanic"))); }
        if(uRes.ok) { const allUsers = await uRes.json(); setUsers(allUsers); }
      if(arguments[0]?.[4]?.ok) setMechanics(await arguments[0][4].json());
  };

  React.useEffect(() => { fetchAllData(); }, [token]);
  const handleCreateTicket = async (e) => {
    e.preventDefault();
        
    const selectedVehicle = vehicles?.find(v => v.licensePlate === formData.vehicleSearch);
    if (!selectedVehicle) {
      alert("Please select a valid vehicle from the list.");
      return;
    }

    if (!selectedVehicle) { alert("Please select a valid vehicle."); return; }
      const payload = new FormData();
    payload.append("vehicleId", selectedVehicle?.id);
        payload.append("serviceType", formData.serviceType);
    payload.append("appointmentDate", formData.appointmentDate);
      if(mechanicId) {
        const foundMech = mechanics?.find(m => `${m.name} - ${m.post}` === mechanicId);
        if(foundMech) payload.append("mechanicId", foundMech.id);
      }
    if(formData.appointmentTime) payload.append("appointmentTime", formData.appointmentTime);

    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: payload
    });
    if(res.ok) {
      const createdTicket = await res.json();
      alert("Service ticket successfully created!");
      setFormData({ vehicleSearch: '', serviceType: '', appointmentDate: '', appointmentTime: '', referencePhoto: null });
      fetchAllData();
    } else {
      alert("Error creating ticket");
    }
  };

  const handleAttachPart = async (e) => {
    e.preventDefault();
    const t = tickets?.find(t => `TKT-${t.id} - ${t.vehicle?.licensePlate}` === searchTicket);
    const p = parts?.find(part => `${part.partName} (${part.serialNumber})` === searchPart);

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
        <h2 style={{marginTop: 0, marginBottom: '20px'}}>Service Bay & Inventory Control</h2>
        
        <div style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{marginTop: 0}}>Schedule New Service Ticket</h3>
            <form onSubmit={handleCreateTicket} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Vehicle Select */}
              <div style={{display:"flex", flexDirection:"column"}}>
                <strong style={{marginBottom:"6px", fontSize:"13px", color:"var(--text-grey)"}}>Vehicle (License Plate) <span style={{color:'var(--maroon)'}}>*</span></strong>
                <input list="vehicleList" placeholder="Search & Select Vehicle" value={formData.vehicleSearch} onChange={e => setFormData({...formData, vehicleSearch: e.target.value})} required style={{padding: '12px', border: '1px solid #d4af37', borderRadius: '8px', background:'rgba(255,255,255,0.05)', color:'#fff'}} />
                <datalist id="vehicleList">
                  {vehicles?.map(v => <option key={v.id} value={v.licensePlate}>{v.makeAndModel}</option>)}
                </datalist>
              </div>

              {/* Service Type */}
              <div style={{display:"flex", flexDirection:"column"}}>
                <strong style={{marginBottom:"6px", fontSize:"13px", color:"var(--text-grey)"}}>Service Type <span style={{color:'var(--maroon)'}}>*</span></strong>
                <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} required style={{padding: '12px', border: '1px solid #d4af37', borderRadius: '8px', background:'rgba(255,255,255,0.05)', color:'#fff'}}>
                  <option value="" style={{color: '#000'}}>-- Select Service Type --</option>
                  <option value="Minor service" style={{color: '#000'}}>Minor service (Rs 468)</option>
                  <option value="Half service" style={{color: '#000'}}>Half service (Rs 1075)</option>
                  <option value="Major service" style={{color: '#000'}}>Major service (Rs 1652)</option>
                  <option value="Full Service" style={{color: '#000'}}>Full Service (Rs 2375)</option>
                </select>
              </div>
              
              {/* Mechanic */}
              <div style={{display:"flex", flexDirection:"column", gridColumn: 'span 2'}}>
                <strong style={{marginBottom:"6px", fontSize:"13px", color:"var(--text-grey)"}}>Mechanic Assignment</strong>
                <input list="mechanicList" placeholder="Search and select mechanic" value={mechanicId} onChange={e => setMechanicId(e.target.value)} style={{padding: '12px', border: '1px solid #d4af37', borderRadius: '8px', background:'rgba(255,255,255,0.05)', color:'#fff'}} />
                <datalist id="mechanicList">
                  {mechanics?.map(m => <option key={m.id} value={`${m.name} - ${m.post}`} />)}
                </datalist>
              </div>

              {/* Date */}
              <div style={{display:"flex", flexDirection:"column"}}>
                <strong style={{marginBottom:"6px", fontSize:"13px", color:"var(--text-grey)"}}>Appointment Date <span style={{color:'var(--maroon)'}}>*</span></strong>
                <input type="date" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required style={{padding: '12px', border: '1px solid #d4af37', borderRadius: '8px', background:'rgba(255,255,255,0.05)', color:'#fff', colorScheme: 'dark'}} />
              </div>

              {/* Time */}
              <div style={{display:"flex", flexDirection:"column"}}>
                <strong style={{marginBottom:"6px", fontSize:"13px", color:"var(--text-grey)"}}>Appointment Time</strong>
                <input type="time" value={formData.appointmentTime} onChange={e => setFormData({...formData, appointmentTime: e.target.value})} style={{padding: '12px', border: '1px solid #d4af37', borderRadius: '8px', background:'rgba(255,255,255,0.05)', color:'#fff', colorScheme: 'dark'}} />
              </div>
              
              <button type="submit" className="primary" style={{gridColumn: 'span 2', padding: '14px', marginTop: '10px', fontSize:'15px', fontWeight:'bold', letterSpacing:'1px', textTransform:'uppercase'}}>Create Service Ticket</button>
            </form>
        </div>

        <div style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{marginTop: 0}}>Attach Parts to Active Job</h3>
            <form onSubmit={handleAttachPart} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              <input list="activeTickets" placeholder="Search & Select Active Ticket" value={searchTicket} onChange={e => setSearchTicket(e.target.value)} required style={{padding: '12px', border: '1px solid #d4af37', borderRadius: '12px'}} />
              <datalist id="activeTickets">
                {tickets?.filter(t => t.status !== 'Completed')?.map(t => (
                  <option key={t.id} value={`TKT-${t.id} - ${t.vehicle?.licensePlate}`}>{t.serviceType}</option>
                ))}
              </datalist>

              <input placeholder="Aftermarket Mods (if any)" value={aftermarketMods} onChange={e => setAftermarketMods(e.target.value)} style={{padding: '12px', border: '1px solid #d4af37', borderRadius: '12px'}} />

              <div style={{display: 'flex', gap: '8px', gridColumn: 'span 2'}}>
                <input list="vaultParts" placeholder="Search & Select Part from Vault (Optional)" value={searchPart} onChange={e => setSearchPart(e.target.value)} style={{flex: 1, padding: '12px', border: '1px solid #d4af37', borderRadius: '12px'}} />
                <datalist id="vaultParts">
                  {parts?.filter(p => p.stockLevel > 0)?.map(p => (
                    <option key={p.id} value={`${p.partName} (${p.serialNumber})`}>{p.stockLevel} in stock</option>
                  ))}
                </datalist>

                <input type="number" min="1" value={partQuantity} onChange={e => setPartQuantity(parseInt(e.target.value))} style={{width: '70px', padding: '12px', border: '1px solid #d4af37', borderRadius: '12px'}} />
                <button type="submit" className="primary" style={{padding: '12px 24px'}}>Update Job</button>
              </div>

            </form>
        </div>

        <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h3 style={{marginTop: 0}}>Active Service Queue</h3>
            {tickets?.length === 0 ? (
                <p style={{ color: 'gray', fontStyle: 'italic' }}>No active service tickets found.</p>
            ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
                      <th style={{padding: '12px'}}>ID</th>
                      <th style={{padding: '12px'}}>Vehicle</th>
                      
                      <th style={{padding: '12px'}}>Status</th>
                      <th style={{padding: '12px'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets?.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{padding: '12px'}}>#{t.id}</td>
                        <td style={{padding: '12px'}}>{t.vehicle?.licensePlate}<br/><small>{t.serviceType}</small></td>
                        
                        <td style={{padding: '12px'}}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em', background: t.status === 'Completed' ? '#065f46' : '#92400e'}}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{padding: '12px', display: 'flex', gap: '5px'}}>
                          {t.status !== 'Completed' && <button onClick={() => handleCompleteTicket(t.id)} style={{background: '#059669', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Complete</button>}
                          <button onClick={() => handleEditTicket(t)} style={{background: '#d97706', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Edit</button>
                          {userRole === 'OWNER' && <button onClick={() => handleDeleteTicket(t.id)} style={{background: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Delete</button>}
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
export const Reports = ({ token, userRole }) => {
  const [orderFilter, setOrderFilter] = React.useState({ date: '', serial: '' });
  const [tickets, setTickets] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
    const [orders, setOrders] = React.useState([]);
  const [searchVehicle, setSearchVehicle] = React.useState('');
  const generatePDF = (ticket) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Service Invoice - Premium Auto Services</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #1a1a1a; 
              background: #ffffff;
            }
            .header-banner {
              border-bottom: 3px solid #800000;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .garage-details h1 {
              margin: 0;
              color: #000000;
              font-size: 28px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .garage-details p {
              margin: 5px 0;
              font-size: 13px;
              color: #555;
            }
            .invoice-title {
              text-align: right;
            }
            .invoice-title h2 {
              margin: 0;
              font-size: 24px;
              color: #800000;
              font-weight: 800;
            }
            .invoice-title p {
              margin: 5px 0;
              font-size: 14px;
              font-weight: 600;
            }
            
            .flex-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              gap: 20px;
            }
            .box {
              flex: 1;
              background: #fcfcfc;
              border: 1px solid #e4e4e7;
              border-radius: 8px;
              padding: 20px;
            }
            .box h3 {
              margin-top: 0;
              border-bottom: 1px solid #e4e4e7;
              padding-bottom: 10px;
              font-size: 16px;
              color: #000000;
              text-transform: uppercase;
            }
            .row {
              display: flex;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .label {
              font-weight: 600;
              width: 140px;
              color: #444;
            }
            .value {
              font-weight: 400;
              color: #000;
            }

            .service-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              margin-bottom: 30px;
            }
            .service-table th {
              background: #800000;
              color: #ffffff;
              text-align: left;
              padding: 12px 15px;
              font-size: 14px;
              text-transform: uppercase;
            }
            .service-table td {
              border-bottom: 1px solid #e4e4e7;
              padding: 15px;
              font-size: 14px;
              vertical-align: top;
            }
            .total-row {
              font-weight: 800;
              font-size: 18px;
            }
            
            .footer {
              margin-top: 50px;
              border-top: 1px solid #e4e4e7;
              padding-top: 20px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 60px;
            }
            .sig-line {
              width: 200px;
              border-top: 1px solid #000;
              text-align: center;
              padding-top: 5px;
              font-size: 13px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="garage-details">
              <h1>Premium Auto Services</h1>
              <p>123 Industrial Estate, Block 4</p>
              <p>Motor City, TX 78000</p>
              <p>Phone: +1 (555) 019-2837 | Email: service@premiumauto.com</p>
              <p>GSTIN: 29ABCDE1234F2Z5</p>
            </div>
            <div class="invoice-title">
              <h2>INVOICE / RECEIPT</h2>
              <p>Ticket No: #${ticket.id}</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
              <p>Status: ${ticket.status}</p>
            </div>
          </div>

          <div class="flex-row">
            <div class="box">
              <h3>Customer Details</h3>
              <div class="row"><div class="label">Name:</div><div class="value">${ticket.customer?.fullName || ticket.customer?.username || ticket.customer?.ownerName || ticket.vehicle?.ownerName || 'Walk-in Customer'}</div></div>
              <div class="row"><div class="label">Contact:</div><div class="value">${ticket.customer?.phone || ticket.vehicle?.ownerPhone || 'N/A'}</div></div>
            </div>
            
            <div class="box">
              <h3>Vehicle Information</h3>
              <div class="row"><div class="label">Make & Model:</div><div class="value">${ticket.vehicle?.makeAndModel || 'Unknown'}</div></div>
              <div class="row"><div class="label">License Plate:</div><div class="value">${ticket.vehicle?.licensePlate || 'Unknown'}</div></div>
              <div class="row"><div class="label">VIN/Chassis:</div><div class="value">${ticket.vehicle?.chassisNumber || 'N/A'}</div></div>
              <div class="row"><div class="label">Odometer:</div><div class="value">${ticket.vehicle?.currentOdometer || 0} km</div></div>
            </div>
          </div>

          <div class="box" style="margin-bottom: 30px;">
            <h3>Service Authorization</h3>
            <div class="row"><div class="label">Mechanic Name:</div><div class="value">N/A (Managed via Team Assignment)</div></div>
            <div class="row"><div class="label">Appointment:</div><div class="value">${ticket.appointmentDate || 'N/A'} ${ticket.appointmentTime || ''}</div></div>
            <div class="row"><div class="label">Modifications:</div><div class="value">${ticket.aftermarketMods || 'None Reported'}</div></div>
          </div>

          <table class="service-table">
            <thead>
              <tr>
                <th>Description of Work / Parts</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${ticket.serviceType || 'General Service'}</strong><br/>
                  <span style="color: #555; font-size: 13px; line-height: 1.5; display: inline-block; margin-top: 8px;">
                    ${ticket.partsUsedDescription ? ticket.partsUsedDescription.replace(/\n/g, '<br/>') : 'Standard maintenance procedures applied. Fluids and standard consumables checked and replaced as per schedule.'}
                  </span>
                </td>
                <td style="text-align: right;">Rs. ${ticket.estimatedCost ? ticket.estimatedCost.toFixed(2) : '0.00'}</td>
              </tr>
              <tr>
                <td style="text-align: right; padding-top: 30px; font-weight: 600;">Subtotal</td>
                <td style="text-align: right; padding-top: 30px;">Rs. ${ticket.estimatedCost ? (ticket.estimatedCost * 0.82).toFixed(2) : '0.00'}</td>
              </tr>
              <tr>
                <td style="text-align: right; font-weight: 600;">Taxes & Fees (18%)</td>
                <td style="text-align: right;">Rs. ${ticket.estimatedCost ? (ticket.estimatedCost * 0.18).toFixed(2) : '0.00'}</td>
              </tr>
              <tr>
                <td style="text-align: right;" class="total-row">Total Amount</td>
                <td style="text-align: right; color: #800000;" class="total-row">Rs. ${ticket.estimatedCost ? ticket.estimatedCost.toFixed(2) : '0.00'}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-line">Customer Signature</div>
            <div class="sig-line">Authorized Signatory</div>
          </div>

          <div class="footer">
            Thank you for trusting Premium Auto Services. Next recommended service at ${(ticket.vehicle?.currentOdometer || 0) + 5000} km.<br/>
            All repairs come with a 6-month limited warranty on parts and labor.
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
        fetch('/api/inventory/orders', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(r => r.json())
          .then(data => setOrders(Array.isArray(data) ? data : []))
          .catch(console.error);
      }
    }, [token]);


  const filteredTickets = searchVehicle ? tickets?.filter(t => t.vehicle?.licensePlate === searchVehicle) : tickets;

  return (
    <div>
      <div className="page-header"><h1>📊 Financial & Service Reports</h1></div>
      <div className="data-card">
        <h2 style={{marginTop: 0}}>Service History Report</h2>
        
        <div style={{marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center'}}>
          <label >Search & Select Vehicle:</label>
          <input list="vehicleSearchList" value={searchVehicle} onChange={e => setSearchVehicle(e.target.value)} placeholder="Enter License Plate" style={{padding: '10px', borderRadius: '6px', border: '1px solid #d4af37', width: '250px'}} />
          <datalist id="vehicleSearchList">
            {vehicles?.map(v => <option key={v.id} value={v.licensePlate} />)}
          </datalist>
          {searchVehicle && <button onClick={() => setSearchVehicle('')} style={{padding: '8px 12px', background: '#333', border: '1px solid #555', borderRadius: '6px'}}>Clear</button>}
        </div>

        <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{borderBottom: '1px solid rgba(212,175,55,0.4)'}}>
              <th style={{padding: '12px'}}>Ticket ID</th>
              <th style={{padding: '12px'}}>Date</th>
              <th style={{padding: '12px'}}>Type</th>
              <th style={{padding: '12px'}}>Vehicle</th>
              <th style={{padding: '12px'}}>Status</th>
              <th style={{padding: '12px'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets?.length === 0 && <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center'}}>No service records found.</td></tr>}
            {filteredTickets?.map(t => (
              <tr key={t.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                <td style={{padding: '12px'}}>#{t.id}</td>
                <td style={{padding: '12px'}}>{t.appointmentDate}</td>
                <td style={{padding: '12px'}}>{t.serviceType}</td>
                <td style={{padding: '12px'}}>{t.vehicle?.licensePlate}</td>
                <td style={{padding: '12px'}}>{t.status}</td>
                <td style={{padding: '12px'}}>
                  {t.status === 'Completed' && <button onClick={() => generatePDF(t)} className="primary" style={{padding: '6px 12px', fontSize: '12px'}}>Show PDF</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      
        
          <div className="data-card" style={{ marginTop: '24px' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h2 style={{marginTop: 0}}>Completed & Canceled Orders History</h2>
              <div style={{display: 'flex', gap: '10px'}}>
                <input type="date" value={orderFilter.date} onChange={e=>setOrderFilter({...orderFilter, date: e.target.value})} style={{padding: '5px'}} />
                <input placeholder="Filter by Serial Number" value={orderFilter.serial} onChange={e=>setOrderFilter({...orderFilter, serial: e.target.value})} style={{padding: '5px'}} />
              </div>
            </div>
            <table>
              <thead><tr><th>Date</th><th>Part</th><th>Vendor</th><th>Qty</th><th>Status</th><th>Generation</th></tr></thead>
              <tbody>
                {orders?.filter(o => (o.status === 'Completed' || o.status === 'Canceled') && 
                  (orderFilter.date === '' || new Date(o.orderDate).toISOString().split('T')[0] === orderFilter.date) &&
                  (orderFilter.serial === '' || o.serialNumber?.includes(orderFilter.serial))
                )?.map(o => (
                  <tr key={o.id}>
                    <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                    <td>{o.partName} (SN: {o.serialNumber})</td>
                    <td>{o.merchantName || o.merchant?.name || 'N/A'}</td>
                    <td>{o.quantity}</td>
                    <td><span className="badge" style={{background: o.status === 'Canceled' ? 'var(--maroon)' : 'var(--black)'}}>{o.status}</span></td>
                    <td><span className="badge" style={{background: 'var(--mid-grey)'}}>{o.generation || 'Manual'}</span></td>
                  </tr>
                ))}
                {orders?.filter(o => (o.status === 'Completed' || o.status === 'Canceled'))?.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No past orders found.</td></tr>}
              </tbody>
            </table>
          </div>

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
        <div style={{position: 'absolute', top: '20%', left: '30%', width: '350px', height: '250px', border: '2px dashed #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2em'}}>Authorized Zone Alpha</div>
        
        {/* Mock Vehicle Trackers */}
        <div style={{position: 'absolute', top: '35%', left: '40%', fontSize: '24px'}}>🚙<span style={{fontSize: '12px', marginLeft: '8px'}}>MH-15-AB-1234</span></div>
        <div style={{position: 'absolute', top: '55%', left: '60%', fontSize: '24px'}}>🚚<span style={{fontSize: '12px', marginLeft: '8px'}}>DL-01-XYZ</span></div>
        <div style={{position: 'absolute', top: '75%', left: '20%', fontSize: '24px'}}>🚛
          <span style={{fontSize: '12px', marginLeft: '8px'}}>KA-09-CD-99</span>
          <div style={{position:'absolute', top: '-25px', left: '10px', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'}}>⚠ Out of bounds!</div>
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

  const exportGateLogs = () => {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    // Filter
    const filteredLogs = scannerHistory.filter(hist => {
      const scanDate = new Date(hist.scanTime);
      return scanDate >= fifteenDaysAgo;
    });

    if (filteredLogs.length === 0) {
      alert("No logs found for the last 15 days.");
      return;
    }

    // CSV Header
    let csv = 'ID,License Plate,Scan Time,Status\n';
    
    // Rows
    filteredLogs.forEach(hist => {
      csv += `${hist.id},"${hist.licensePlate}","${hist.scanTime}","${hist.status}"\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate_logs_15_days_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header"><h1>👁 Automated Gate Scanner & History</h1><div className="live-indicator"><div className="live-dot"></div> ALPR Active</div></div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Left Column: Webcam & Scanner */}
        <div className="data-card" style={{ padding: '20px' }}>
          <h3 style={{ marginTop: 0}}>Live Optical Feed (All Plates)</h3>
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
              style={{ flex: 1, padding: '10px', border: '1px solid #d4af37', borderRadius: '8px' }} 
            />
            <button type="submit" style={{ padding: '10px 16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Scan / Lookup
            </button>
          </form>

          {scanResult && (
              <div style={{ marginTop: '15px', padding: '14px', border: `1px solid ${scanResult.status === 'UNAUTHORIZED' ? '#ef4444' : '#10b981'}`, borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 6px 0'}}>Scanned Plate: {scanResult.licensePlate}</h4>
                <p style={{ margin: '2px 0', fontSize: '13px' }}>Owner: {scanResult.ownerName}</p>
                <p style={{ margin: '2px 0', fontSize: '13px' }}>Status: {scanResult.status}</p>
                {scanResult.status === 'UNAUTHORIZED' ? (
                  <button onClick={() => window.location.hash = '#/vehicles?plate=' + scanResult.licensePlate} style={{marginTop:'10px', width:'100%', padding:'10px', background:'#ef4444', color:'#fff', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', textTransform:'uppercase'}}>Register & Service</button>
                ) : (
                  <span className="badge healthy" style={{marginTop:'8px', display:'inline-block'}}>Gate Logged</span>
                )}
              </div>
            )}

          {error && (
            <div style={{ marginTop: '15px', padding: '14px', border: '1px solid #ef4444', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 6px 0'}}>Scan Error</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Database-Backed Scanner History */}
        <div className="data-card" style={{ padding: '20px' }}>
          <h3 style={{ marginTop: 0}}>📋 Scanner History (All Scans)</h3>
          {scannerHistory?.length === 0 ? (
            <p style={{ fontStyle: 'italic', marginTop: '20px' }}>No plates scanned yet.</p>
          ) : (
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
                    <th style={{ padding: '8px'}}>Plate</th>
                    <th style={{ padding: '8px'}}>Time</th>
                    <th style={{ padding: '8px'}}>Status</th>
                    <th style={{ padding: '8px'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scannerHistory?.map((hist) => (
                    <tr key={hist.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold'}}>{hist.licensePlate}</td>
                      <td style={{ padding: '8px'}}>{hist.scanTime}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: hist.status === 'AUTHORIZED' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: hist.status === 'AUTHORIZED' ? '#10b981' : '#ef4444' }}>
                          {hist.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <button 
                          onClick={() => fetchServicePassport(hist.licensePlate)}
                          style={{ border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
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
          <h3 style={{ marginBottom: '15px' }}>📜 Digital Service Passport: {scannedPlate}</h3>
          {serviceHistory?.length === 0 ? (
            <p >No recorded service history found for this vehicle. Unregistered visitor logs are active!</p>
          ) : (
            <div style={{ borderLeft: '2px solid #d4af37', paddingLeft: '20px', marginLeft: '10px' }}>
              {serviceHistory?.map((item, index) => (
                <div key={index} style={{ position: 'relative', marginBottom: '20px' }}>
                  <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', boxShadow: '0 0 8px #d4af37' }} />
                  <span style={{ fontSize: '12px'}}>{item.serviceDate}</span>
                  <h4 style={{ margin: '4px 0' }}>{item.serviceType}</h4>
                  <p style={{ fontSize: '14px', margin: '0' }}>{item.description}</p>
                  <span style={{ fontSize: '12px'}}>Cost: ₹{item.cost}</span>
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
    const [mechanics, setMechanics] = React.useState([]);
  const [merchants, setMerchants] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);
  const [empForm, setEmpForm] = React.useState({ name: '', post: '', salary: '', phone: '', email: '', address: '', aadharCard: null, panCard: null, resume: null, photo: null, bankPassbook: null, experienceLetter: null });
  const [orders, setOrders] = React.useState([]);
  const [vaultSearch, setVaultSearch] = React.useState('');
  
  const [newItem, setNewItem] = React.useState({ partName: '', serialNumber: '', stockLevel: '', price: '', location: '' });
  const [order, setOrder] = React.useState({ merchantName: '', partName: '', serialNumber: '', quantity: 1 });
    const [autoOrder, setAutoOrder] = React.useState({ partId: '', merchantId: '', autoOrderQuantity: 20 });

  const fetchData = async () => {
    const resP = await fetch('/api/inventory', { headers: { 'Authorization': `Bearer ${token}` } });
    if(resP.ok) setParts(await resP.json());
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

  
    const handleAutoOrder = async (e) => {
      e.preventDefault();
      if(!autoOrder.partId || !autoOrder.merchantId) return alert('Select part and vendor');
      const part = parts.find(p => p.id == autoOrder.partId);
      const payload = { ...part, autoOrderVendorId: autoOrder.merchantId, autoOrderQuantity: autoOrder.autoOrderQuantity };
      await fetch('/api/inventory/'+part.id, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      alert('Automated order configured successfully!');
      setAutoOrder({ partId: '', merchantId: '', autoOrderQuantity: 20 });
      fetchData();
    };
    const handleCancelOrder = async (id) => {
      await fetch(`/api/inventory/orders/${id}/cancel`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
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
    setOrder({ merchantName: '', partName: '', serialNumber: '', quantity: 1 });
    fetchData();
  };

  const handleOrderStatus = async (id, status) => {
    await fetch(`/api/inventory/orders/${id}/status?status=${status}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
    fetchData();
  };


  const filteredParts = parts?.filter(p => 
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
        <form onSubmit={handleOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '30px', padding: '15px', borderRadius: '12px' }}>
          <input placeholder="Merchant Name" value={order.merchantName || ''} onChange={e => setOrder({...order, merchantName: e.target.value})} required style={{padding: '10px'}} />
          <input placeholder="Part Name" value={order.partName} onChange={e => setOrder({...order, partName: e.target.value})} required style={{padding: '10px'}} />
          <input placeholder="Serial Number" value={order.serialNumber} onChange={e => setOrder({...order, serialNumber: e.target.value})} required style={{padding: '10px'}} />
          <div style={{display: 'flex', gap: '8px'}}>
            <input type="number" min="1" placeholder="Qty" value={order.quantity} onChange={e => setOrder({...order, quantity: parseInt(e.target.value)})} required style={{padding: '10px', width: '80px'}} />
            <button type="submit" className="primary" style={{flex: 1}}>Order</button>
          </div>
        </form>
        
        <div className="data-card" style={{ marginBottom: '24px' }}>
            <h3 style={{marginTop: 0}}>Configure Automated Orders</h3>
            <form onSubmit={handleAutoOrder} style={{ display: 'flex', gap: '10px' }}>
              <select value={autoOrder.partId} onChange={e => setAutoOrder({...autoOrder, partId: e.target.value})} required style={{padding: '10px', flex: 1}}>
                <option value="">Select Part...</option>
                {parts?.map(p => <option key={p.id} value={p.id}>{p.partName} ({p.serialNumber})</option>)}
              </select>
              <select value={autoOrder.merchantId} onChange={e => setAutoOrder({...autoOrder, merchantId: e.target.value})} required style={{padding: '10px', flex: 1}}>
                <option value="">Select Vendor...</option>
                {merchants?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input type="number" value={autoOrder.autoOrderQuantity} onChange={e => setAutoOrder({...autoOrder, autoOrderQuantity: e.target.value})} placeholder="Threshold Qty" required style={{padding: '10px', width: '150px'}} />
              <button type="submit" className="primary" style={{padding: '10px 20px'}}>Set Auto-Order</button>
            </form>
          </div>
          
          
            <div style={{marginBottom: '30px', padding: '15px', borderRadius: '12px'}}>
              <h3 style={{marginTop: 0}}>Current Orders</h3>
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                {orders?.filter(o => o.status === 'Pending').map(o => (
                  <li key={o.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                    <div>
                      Ordered <strong>{o.quantity}x {o.partName} (Serial: {o.serialNumber})</strong> from {o.merchant?.name || o.merchantName} on {new Date(o.orderDate).toLocaleString()}
                      <span className="badge" style={{marginLeft: '10px', background: 'var(--mid-grey)'}}>{o.generation || 'Manual'} Generation</span>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                      {new Date(o.orderDate).getTime() > Date.now() - 24*60*60*1000 && (
                        <button onClick={() => handleOrderStatus(o.id, 'Canceled')} className="badge" style={{background: 'var(--maroon)'}}>Cancel</button>
                      )}
                      <button onClick={() => handleOrderStatus(o.id, 'Completed')} className="badge" style={{background: 'var(--green, green)'}}>Received</button>
                    </div>
                  </li>
                ))}
                {orders?.filter(o => o.status === 'Pending').length === 0 && <li>No current orders.</li>}
              </ul>
            </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
            <h2 style={{margin: 0}}>Current Vault Stock</h2>
            <input placeholder="Search Part by Name or Serial..." value={vaultSearch} onChange={e => setVaultSearch(e.target.value)} style={{padding: '8px', borderRadius: '6px', border: '1px solid #d4af37', width: '250px'}} />
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
            {filteredParts?.length === 0 && <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center'}}>No parts match your search.</td></tr>}
            {filteredParts?.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{padding: '12px'}}>{p.partName}</td>
                <td style={{padding: '12px', fontFamily: 'monospace'}}>{p.serialNumber || 'N/A'}</td>
                <td style={{padding: '12px', color: p.stockLevel < 10 ? '#ef4444' : '#10b981', fontWeight: 'bold'}}>
                  {p.stockLevel} {p.stockLevel < 10 && <span style={{marginLeft: '8px', fontSize: '0.8em', padding: '2px 6px', borderRadius: '4px'}}>LOW STOCK</span>}
                </td>
                <td style={{padding: '12px'}}>Rs. {p.price.toFixed(2)}</td>
                <td style={{padding: '12px'}}>{p.location || 'N/A'}</td>
                <td style={{padding: '12px'}}>
                  <button onClick={() => handleDelete(p.id)} style={{padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Delete</button>
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
    const [merchants, setMerchants] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);
  const [empForm, setEmpForm] = React.useState({ name: '', post: '', salary: '', phone: '', email: '', address: '', aadharCard: null, panCard: null, resume: null, photo: null, bankPassbook: null, experienceLetter: null });
  const [usersList, setUsersList] = React.useState([]);
    const [garageForm, setGarageForm] = React.useState({ isEditing: false, name: 'Premium Auto Services', branchName: '', gstin: '', address: '123 Main St, Cityville', phone: '555-0199', email: 'contact@premiumauto.com' });
    const handleSaveGarage = async (e) => { e.preventDefault(); await fetch('/api/registry/garages', {method:'POST', headers:{'Content-Type':'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify(garageForm)}); setGarageForm({...garageForm, isEditing: false}); alert('Garage settings updated successfully!'); };


    const [merchForm, setMerchForm] = React.useState({ name: '', email: '', phoneNumber: '', address: '', site: '' });
  const [userForm, setUserForm] = React.useState({ username: '', password: '', role: 'EMPLOYEE', fullName: '', post: '', salary: '', phone: '', email: '', address: '' });

  const fetchData = async () => {
      try {
        const resMerch = await fetch('/api/registry/merchants', { headers: { 'Authorization': `Bearer ${token}` } });
        if(resMerch.ok) setMerchants(await resMerch.json());
        const resEmp = await fetch('/api/registry/employees', { headers: { 'Authorization': `Bearer ${token}` } });
        if(resEmp.ok) setEmployees(await resEmp.json());
        const res3 = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if(res3.ok) setUsersList(await res3.json());
      } catch(e) { console.error(e); }
    };

  React.useEffect(() => { fetchData(); }, [token]);
  
  

  
  
  

    const handleAddMerchant = async (e) => {
      e.preventDefault();
      await fetch('/api/registry/merchants', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(merchForm) });
      setMerchForm({ name: '', email: '', phoneNumber: '', address: '', site: '' });
      fetchData();
    };
    const handleDeleteMerchant = async (id) => {
      await fetch(`/api/registry/merchants/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
    };
  
    const handleAddEmployee = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('name', empForm.name);
      formData.append('post', empForm.post);
      formData.append('salary', empForm.salary);
      formData.append('phone', empForm.phone);
      formData.append('email', empForm.email);
      formData.append('address', empForm.address);
      if(empForm.aadharCard) formData.append('aadharCard', empForm.aadharCard);
      if(empForm.panCard) formData.append('panCard', empForm.panCard);
      if(empForm.resume) formData.append('resume', empForm.resume);
      if(empForm.photo) formData.append('photo', empForm.photo);
      if(empForm.bankPassbook) formData.append('bankPassbook', empForm.bankPassbook);
      if(empForm.experienceLetter) formData.append('experienceLetter', empForm.experienceLetter);
      await fetch('/api/registry/employees', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      setEmpForm({ name: '', post: '', salary: '', phone: '', email: '', address: '', aadharCard: null, panCard: null, resume: null, photo: null, bankPassbook: null, experienceLetter: null });
      fetchData();
    };
    const handleDeleteEmployee = async (id) => {
      await fetch(`/api/registry/employees/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
    };
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (userRole?.toUpperCase() === 'MANAGER' && userForm.role === 'OWNER') {
      alert("Managers cannot create Owner level users.");
      return;
    }
    // Convert to JSON
    const payload = {
        username: userForm.username,
        password: userForm.password,
        role: userForm.role,
        fullName: userForm.fullName
    };
    await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
    setUserForm({ username: '', password: '', role: 'EMPLOYEE', fullName: '' });
    fetchData();
  };


  const handleDeleteUser = async (targetUser) => {
    if (userRole?.toUpperCase() === 'MANAGER' && targetUser.role === 'OWNER') {
      alert("Managers cannot delete Owner level users.");
      return;
    }
    if(!window.confirm(`Delete user ${targetUser.username}?`)) return;
    await fetch(`/api/users/${targetUser.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchData();
  };

  return (
      <div>
        <div className="page-header"><h1>Registry</h1></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          
            {/* Garage Details Registry */}
            <div className="data-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--mid-grey)', paddingBottom:'10px'}}>
                <h2 style={{marginTop:0, marginBottom:0}}>Garage Details Registry</h2>
                <button onClick={() => setGarageForm({...garageForm, isEditing: !garageForm.isEditing})} className="badge" style={{background: 'var(--text-grey)'}}>{garageForm.isEditing ? 'Cancel' : 'Edit'}</button>
              </div>
              {garageForm.isEditing ? (
                <form onSubmit={handleSaveGarage} style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'10px'}}>
                  <input placeholder="Garage Name" value={garageForm.name} onChange={e=>setGarageForm({...garageForm, name: e.target.value})} required style={{padding:'8px'}} />
                  <input placeholder="Branch Name" value={garageForm.branchName || ''} onChange={e=>setGarageForm({...garageForm, branchName: e.target.value})} required style={{padding:'8px'}} />
                  <input placeholder="Address" value={garageForm.address} onChange={e=>setGarageForm({...garageForm, address: e.target.value})} required style={{padding:'8px'}} />
                  <input placeholder="Phone" value={garageForm.phone} onChange={e=>setGarageForm({...garageForm, phone: e.target.value})} required style={{padding:'8px'}} />
                  <input placeholder="Email" type="email" value={garageForm.email} onChange={e=>setGarageForm({...garageForm, email: e.target.value})} required style={{padding:'8px'}} />
                  <input placeholder="GSTIN" value={garageForm.gstin || ''} onChange={e=>setGarageForm({...garageForm, gstin: e.target.value})} required style={{padding:'8px'}} />
                  <button type="submit" className="primary" style={{padding:'8px 16px', marginTop: '10px'}}>Save Details</button>
                </form>
              ) : (
                <div style={{marginTop:'10px', lineHeight:'1.8'}}>
                  <p><strong>Name:</strong> {garageForm.name}</p>
                  <p><strong>Branch:</strong> {garageForm.branchName || 'N/A'}</p>
                  <p><strong>Address:</strong> {garageForm.address}</p>
                  <p><strong>Phone:</strong> {garageForm.phone}</p>
                  <p><strong>Email:</strong> {garageForm.email}</p>
                  <p><strong>GSTIN:</strong> {garageForm.gstin || 'N/A'}</p>
                  </div>
              )}
              </div>

              {/* Vendor Registry */}
              <div className="data-card">
                <h2 style={{marginTop:0, borderBottom:'1px solid var(--mid-grey)', paddingBottom:'10px'}}>Vendor Registry</h2>
                <form onSubmit={handleAddMerchant} style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px'}}>
                  <div style={{display:'flex', gap:'10px'}}>
                    <input placeholder="Vendor Name" value={merchForm.name} onChange={e=>setMerchForm({...merchForm, name: e.target.value})} required style={{flex:1, padding:'8px'}} />
                    <input placeholder="Contact Phone" value={merchForm.phoneNumber} onChange={e=>setMerchForm({...merchForm, phoneNumber: e.target.value})} required style={{flex:1, padding:'8px'}} />
                  </div>
                  <div style={{display:'flex', gap:'10px'}}>
                    <input placeholder="Email" type="email" value={merchForm.email} onChange={e=>setMerchForm({...merchForm, email: e.target.value})} style={{flex:1, padding:'8px'}} />
                    <input placeholder="Website" value={merchForm.site} onChange={e=>setMerchForm({...merchForm, site: e.target.value})} style={{flex:1, padding:'8px'}} />
                  </div>
                  <div style={{display:'flex', gap:'10px'}}>
                    <input placeholder="Address" value={merchForm.address} onChange={e=>setMerchForm({...merchForm, address: e.target.value})} required style={{flex:1, padding:'8px'}} />
                  </div>
                  <button type="submit" className="primary" style={{padding:'8px 16px', alignSelf:'flex-start'}}>Add Vendor</button>
                </form>
                <ul style={{listStyle:'none', padding:0}}>
                  {merchants?.map(m => (
                    <li key={m.id} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid var(--mid-grey)'}}>
                      <div>
                        <strong>{m.name}</strong><br/>
                        <small style={{color:'var(--text-grey)'}}>{m.phoneNumber} | {m.email} | {m.address}</small>
                      </div>
                      <button onClick={() => handleDeleteMerchant(m.id)} className="badge" style={{background: 'var(--maroon)'}}>Delete</button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Employee Registry */}
              <div className="data-card">
                <h2 style={{marginTop:0, borderBottom:'1px solid var(--mid-grey)', paddingBottom:'10px'}}>Employee Registry</h2>
                <form onSubmit={handleAddEmployee} style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px'}}>
                  <div style={{display:'flex', gap:'10px'}}>
                    <input placeholder="Name" value={empForm.name} onChange={e=>setEmpForm({...empForm, name: e.target.value})} required style={{flex:1, padding:'8px'}} />
                    <input placeholder="Post (e.g. Mechanic)" value={empForm.post} onChange={e=>setEmpForm({...empForm, post: e.target.value})} required style={{flex:1, padding:'8px'}} />
                  </div>
                  <div style={{display:'flex', gap:'10px'}}>
                    <input placeholder="Salary" type="number" value={empForm.salary} onChange={e=>setEmpForm({...empForm, salary: e.target.value})} required style={{flex:1, padding:'8px'}} />
                    <input placeholder="Mobile" value={empForm.phone} onChange={e=>setEmpForm({...empForm, phone: e.target.value})} required style={{flex:1, padding:'8px'}} />
                  </div>
                  <div style={{display:'flex', gap:'10px'}}>
                    <input placeholder="Email" type="email" value={empForm.email} onChange={e=>setEmpForm({...empForm, email: e.target.value})} required style={{flex:1, padding:'8px'}} />
                    <input placeholder="Address" value={empForm.address} onChange={e=>setEmpForm({...empForm, address: e.target.value})} required style={{flex:2, padding:'8px'}} />
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop: '10px'}}>
                    <label style={{fontSize: '0.9em', color: 'var(--text-grey)'}}>Aadhar Card <input type="file" onChange={e=>setEmpForm({...empForm, aadharCard: e.target.files[0]})} style={{marginTop:'4px'}} /></label>
                    <label style={{fontSize: '0.9em', color: 'var(--text-grey)'}}>PAN Card <input type="file" onChange={e=>setEmpForm({...empForm, panCard: e.target.files[0]})} style={{marginTop:'4px'}} /></label>
                    <label style={{fontSize: '0.9em', color: 'var(--text-grey)'}}>Resume <input type="file" onChange={e=>setEmpForm({...empForm, resume: e.target.files[0]})} style={{marginTop:'4px'}} /></label>
                    <label style={{fontSize: '0.9em', color: 'var(--text-grey)'}}>Photo <input type="file" onChange={e=>setEmpForm({...empForm, photo: e.target.files[0]})} style={{marginTop:'4px'}} /></label>
                    <label style={{fontSize: '0.9em', color: 'var(--text-grey)'}}>Bank Passbook <input type="file" onChange={e=>setEmpForm({...empForm, bankPassbook: e.target.files[0]})} style={{marginTop:'4px'}} /></label>
                    <label style={{fontSize: '0.9em', color: 'var(--text-grey)'}}>Experience Letter <input type="file" onChange={e=>setEmpForm({...empForm, experienceLetter: e.target.files[0]})} style={{marginTop:'4px'}} /></label>
                  </div>
                  <button type="submit" className="primary" style={{padding:'8px 16px', alignSelf:'flex-start', marginTop:'10px'}}>Add Employee</button>
                </form>
                <ul style={{listStyle:'none', padding:0}}>
                  {employees?.map(emp => (
                    <li key={emp.id} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid var(--mid-grey)'}}>
                      <div>
                        <strong>{emp.name}</strong> - {emp.post} <br/>
                        <small style={{color: 'var(--text-grey)'}}>Salary: Rs. {emp.salary} | Phone: {emp.phone} | Email: {emp.email}</small><br/>
                        <small style={{color: 'var(--text-grey)'}}>Address: {emp.address}</small>
                      </div>
                      <button onClick={() => handleDeleteEmployee(emp.id)} className="badge" style={{background: 'var(--maroon)'}}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>

            <div className="data-card" style={{gridColumn: '1 / -1'}}>
              <h2 style={{marginTop:0, borderBottom:'1px solid var(--mid-grey)', paddingBottom:'10px'}}>System Users (Login Access)</h2>
              <form onSubmit={handleAddUser} style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <input placeholder="Username" value={userForm.username} onChange={e=>setUserForm({...userForm, username: e.target.value})} required style={{flex:1, padding:'8px'}} />
                <input placeholder="Password" type="password" value={userForm.password} onChange={e=>setUserForm({...userForm, password: e.target.value})} required style={{flex:1, padding:'8px'}} />
                <select value={userForm.role} onChange={e=>setUserForm({...userForm, role: e.target.value})} style={{flex:1, padding:'8px'}}>
                  <option value="OWNER">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
                <input placeholder="Full Name" value={userForm.fullName || ''} onChange={e=>setUserForm({...userForm, fullName: e.target.value})} style={{flex:1, padding:'8px'}} />
                <button type="submit" className="primary" style={{padding:'8px 16px'}}>Add User</button>
              </form>
              <ul style={{listStyle:'none', padding:0}}>
                {usersList?.map(u => (
                  <li key={u.id} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid var(--mid-grey)'}}>
                    <div>
                      <strong>{u.username}</strong> ({u.role}) - {u.fullName || 'No Name'} 
                    </div>
                    <button onClick={() => handleDeleteUser(u)} className="badge" style={{background: 'var(--maroon)'}}>Revoke Access</button>
                  </li>
                ))}
              </ul>
            </div>





          {/* Employee Registry */}
          


        </div>
      </div>
    );
  };


export const Finance = ({ token }) => {
  const [employees, setEmployees] = React.useState([]);
  const [tickets, setTickets] = React.useState([]);
  const [inventory, setInventory] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [timeFilter, setTimeFilter] = React.useState('ALL');
  
  React.useEffect(() => {
    fetch('/api/registry/employees', { headers: { 'Authorization': `Bearer ${token}` } }).then(async r => { const t=await r.text(); try { return t?JSON.parse(t):[]; } catch(e) { return []; } }).then(setEmployees);
    fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } }).then(async r => { const t=await r.text(); try { return t?JSON.parse(t):[]; } catch(e) { return []; } }).then(setTickets);
    fetch('/api/inventory', { headers: { 'Authorization': `Bearer ${token}` } }).then(async r => { const t=await r.text(); try { return t?JSON.parse(t):[]; } catch(e) { return []; } }).then(setInventory);
    fetch('/api/inventory/orders', { headers: { 'Authorization': `Bearer ${token}` } }).then(async r => { const t=await r.text(); try { return t?JSON.parse(t):[]; } catch(e) { return []; } }).then(setOrders);
  }, [token]);

  const isDateInRange = (dateString) => {
    if (timeFilter === 'ALL') return true;
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    if (timeFilter === 'THIS_MONTH') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (timeFilter === 'LAST_MONTH') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    }
    if (timeFilter === 'YTD') return date.getFullYear() === now.getFullYear();
    return true;
  };

  const filteredTickets = tickets?.filter(t => isDateInRange(t.createdAt)) || [];
  const filteredOrders = orders?.filter(o => isDateInRange(o.orderDate)) || [];

  const totalSalary = employees?.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const grossRevenue = filteredTickets.filter(t => t.status === 'Completed').reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
  const pendingReceivables = filteredTickets.filter(t => t.status !== 'Completed' && t.status !== 'Canceled').reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
  
  const partsCost = filteredOrders.filter(o => o.status === 'Completed').reduce((sum, o) => {
    const item = inventory?.find(i => i.serialNumber === o.serialNumber);
    return sum + ((item ? item.price : 0) * o.quantity);
  }, 0);

  const netProfit = grossRevenue - (totalSalary + partsCost);
  const formatInr = (val) => "₹ " + val.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Financial Intelligence</h1>
        <select 
          value={timeFilter} 
          onChange={e => setTimeFilter(e.target.value)} 
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--mid-grey)', background: 'var(--white)', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
        >
          <option value="ALL">All Time</option>
          <option value="THIS_MONTH">This Month</option>
          <option value="LAST_MONTH">Last Month</option>
          <option value="YTD">Year to Date (YTD)</option>
        </select>
      </div>

      <div className="data-card" style={{ padding: '30px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1em', color: 'var(--dark-grey)' }}>Net Profit Estimation</h2>
          <div style={{ fontSize: '3.5em', fontWeight: '800', lineHeight: '1' }}>{formatInr(netProfit)}</div>
        </div>
        <div style={{ textAlign: 'right', paddingLeft: '20px', borderLeft: '2px solid var(--mid-grey)' }}>
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>Gross Revenue: {formatInr(grossRevenue)}</div>
          <div style={{ marginBottom: '8px', fontWeight: '600', color: '#990000' }}>Total Payroll: - {formatInr(totalSalary)}</div>
          <div style={{ fontWeight: '600', color: '#990000' }}>Parts Expenses: - {formatInr(partsCost)}</div>
        </div>
      </div>
      
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{background:'var(--light-grey)', padding:'12px', borderRadius:'8px', fontSize:'1.5em'}}>📈</div>
          <div>
            <div className="kpi-val">{formatInr(grossRevenue)}</div>
            <div className="kpi-label">Gross Revenue</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{background:'var(--light-grey)', padding:'12px', borderRadius:'8px', fontSize:'1.5em'}}>⏳</div>
          <div>
            <div className="kpi-val">{formatInr(pendingReceivables)}</div>
            <div className="kpi-label">Pending Receivables</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{background:'var(--light-grey)', padding:'12px', borderRadius:'8px', fontSize:'1.5em'}}>👥</div>
          <div>
            <div className="kpi-val">{formatInr(totalSalary)}</div>
            <div className="kpi-label">Payroll Expenses</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{background:'var(--light-grey)', padding:'12px', borderRadius:'8px', fontSize:'1.5em'}}>🛒</div>
          <div>
            <div className="kpi-val">{formatInr(partsCost)}</div>
            <div className="kpi-label">Parts Expenses</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="data-card">
          <h2 style={{marginTop:0, borderBottom:'2px solid var(--mid-grey)', paddingBottom:'12px', marginBottom:'16px'}}>Service Ledger</h2>
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95em'}}>
              <thead>
                <tr style={{borderBottom: '2px solid var(--mid-grey)'}}>
                  <th style={{padding: '12px 8px'}}>Date</th>
                  <th style={{padding: '12px 8px'}}>Vehicle</th>
                  <th style={{padding: '12px 8px'}}>Service</th>
                  <th style={{padding: '12px 8px', textAlign: 'right'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.filter(t => t.status === 'Completed').length === 0 && <tr><td colSpan="4" style={{padding:'20px', textAlign:'center'}}>No completed services.</td></tr>}
                {filteredTickets.filter(t => t.status === 'Completed').map(t => (
                  <tr key={t.id} style={{borderBottom: '1px solid var(--mid-grey)'}}>
                    <td style={{padding: '12px 8px'}}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style={{padding: '12px 8px', fontWeight: '600'}}>{t.vehiclePlate}</td>
                    <td style={{padding: '12px 8px'}}>{t.serviceType}</td>
                    <td style={{padding: '12px 8px', fontWeight: '700', textAlign: 'right'}}>+ {formatInr(t.estimatedCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="data-card">
          <h2 style={{marginTop:0, borderBottom:'2px solid var(--mid-grey)', paddingBottom:'12px', marginBottom:'16px'}}>Parts Ledger</h2>
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95em'}}>
              <thead>
                <tr style={{borderBottom: '2px solid var(--mid-grey)'}}>
                  <th style={{padding: '12px 8px'}}>Date</th>
                  <th style={{padding: '12px 8px'}}>Part</th>
                  <th style={{padding: '12px 8px'}}>Qty</th>
                  <th style={{padding: '12px 8px', textAlign: 'right'}}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.filter(o => o.status === 'Completed').length === 0 && <tr><td colSpan="4" style={{padding:'20px', textAlign:'center'}}>No parts ordered.</td></tr>}
                {filteredOrders.filter(o => o.status === 'Completed').map(o => {
                  const item = inventory?.find(i => i.serialNumber === o.serialNumber);
                  const price = item ? item.price : 0;
                  return (
                    <tr key={o.id} style={{borderBottom: '1px solid var(--mid-grey)'}}>
                      <td style={{padding: '12px 8px'}}>{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td style={{padding: '12px 8px', fontWeight: '600'}}>{o.partName}</td>
                      <td style={{padding: '12px 8px'}}>{o.quantity}</td>
                      <td style={{padding: '12px 8px', color: '#990000', fontWeight: '700', textAlign: 'right'}}>- {formatInr(price * o.quantity)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
