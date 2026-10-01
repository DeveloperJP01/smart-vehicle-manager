#!/bin/bash

# 1. Create a DTO (Data Transfer Object) to handle the incoming Vehicle data
cat << 'EOF' > src/main/java/com/vehicle/service/dto/VehicleRequest.java
package com.vehicle.service.dto;
public class VehicleRequest {
    private String makeAndModel; private String licensePlate; private String color;
    private Integer currentOdometer; private Long ownerId;
    public String getMakeAndModel() { return makeAndModel; } public void setMakeAndModel(String m) { this.makeAndModel = m; }
    public String getLicensePlate() { return licensePlate; } public void setLicensePlate(String l) { this.licensePlate = l; }
    public String getColor() { return color; } public void setColor(String c) { this.color = c; }
    public Integer getCurrentOdometer() { return currentOdometer; } public void setCurrentOdometer(Integer o) { this.currentOdometer = o; }
    public Long getOwnerId() { return ownerId; } public void setOwnerId(Long id) { this.ownerId = id; }
}
EOF

# 2. Add POST endpoints to the Controller for creating Users and Vehicles
cat << 'EOF' > src/main/java/com/vehicle/service/controller/ServiceTicketController.java
package com.vehicle.service.controller;
import com.vehicle.service.dto.*; import com.vehicle.service.model.*; import com.vehicle.service.repository.*;
import org.springframework.beans.factory.annotation.Autowired; import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
import java.io.IOException; import java.util.List;
@RestController @RequestMapping("/api")
public class ServiceTicketController {
    @Autowired private ServiceTicketRepository ticketRepo; @Autowired private UserRepository userRepo;
    @Autowired private VehicleRepository vehicleRepo; @Autowired private MechanicRepository mechanicRepo;

    @GetMapping("/users") public List<User> getAllUsers() { return userRepo.findAll(); }
    @PostMapping("/users") public User createUser(@RequestBody User user) { return userRepo.save(user); }
    
    @GetMapping("/vehicles") public List<Vehicle> getAllVehicles() { return vehicleRepo.findAll(); }
    @PostMapping("/vehicles") public Vehicle createVehicle(@RequestBody VehicleRequest req) {
        Vehicle v = new Vehicle(); v.setMakeAndModel(req.getMakeAndModel()); v.setLicensePlate(req.getLicensePlate()); v.setColor(req.getColor());
        int odo = req.getCurrentOdometer() != null ? req.getCurrentOdometer() : 0;
        v.setCurrentOdometer(odo); v.setLastOilOdometer(odo); v.setLastBrakeOdometer(odo); v.setLastTireOdometer(odo);
        v.setOwner(userRepo.findById(req.getOwnerId()).orElseThrow());
        return vehicleRepo.save(v);
    }
    
    @GetMapping("/mechanics") public List<Mechanic> getAllMechanics() { return mechanicRepo.findAll(); }
    @GetMapping("/services") public List<ServiceTicket> getAllTickets() { return ticketRepo.findAll(); }

    @PostMapping(value = "/services", consumes = {"multipart/form-data"})
    public ServiceTicket createTicket(@ModelAttribute TicketRequest req) throws IOException {
        ServiceTicket ticket = new ServiceTicket();
        ticket.setCustomer(userRepo.findById(req.getCustomerId()).orElseThrow());
        ticket.setVehicle(vehicleRepo.findById(req.getVehicleId()).orElseThrow());
        if (req.getMechanicId() != null) ticket.setAssignedMechanic(mechanicRepo.findById(req.getMechanicId()).orElse(null));
        ticket.setServiceType(req.getServiceType()); ticket.setAppointmentDate(req.getAppointmentDate());
        ticket.setAftermarketMods(req.getAftermarketMods()); ticket.setStatus("Pending");
        ticket.setEstimatedCost(Math.round((Math.random() * 4000 + 1000) * 100.0) / 100.0);
        if (req.getReferencePhoto() != null && !req.getReferencePhoto().isEmpty()) ticket.setReferencePhoto(req.getReferencePhoto().getBytes());
        return ticketRepo.save(ticket);
    }

    @PutMapping("/services/{id}/status")
    public ServiceTicket updateStatus(@PathVariable Long id, @RequestBody String status) {
        ServiceTicket ticket = ticketRepo.findById(id).orElseThrow();
        ticket.setStatus(status); 
        if (status.equalsIgnoreCase("Completed")) {
            Vehicle v = ticket.getVehicle();
            String type = ticket.getServiceType().toLowerCase();
            if (type.contains("oil") || type.contains("engine")) v.setLastOilOdometer(v.getCurrentOdometer());
            if (type.contains("brake")) v.setLastBrakeOdometer(v.getCurrentOdometer());
            if (type.contains("tire")) v.setLastTireOdometer(v.getCurrentOdometer());
            vehicleRepo.save(v);
        }
        return ticketRepo.save(ticket);
    }

    @GetMapping("/services/{id}/photo")
    public ResponseEntity<byte[]> getTicketPhoto(@PathVariable Long id) {
        ServiceTicket ticket = ticketRepo.findById(id).orElseThrow();
        if (ticket.getReferencePhoto() == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"photo_" + id + ".jpg\"")
            .contentType(MediaType.IMAGE_JPEG).body(ticket.getReferencePhoto());
    }
}
EOF

# 3. Update the Frontend Pages to include the registration forms
cat << 'EOF' > frontend/src/Pages.js
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
    fetch('/api/users', { headers }).then(r => r.json()).then(setUsers);
  };
  useEffect(() => { fetchData(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/vehicles', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({...formData, currentOdometer: Number(formData.currentOdometer)}) });
    setFormData({ makeAndModel: '', licensePlate: '', color: '', currentOdometer: '', ownerId: '' });
    fetchData();
  };

  return (
    <div>
      <div className="page-header"><h1>Vehicles Registry</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="data-card" style={{ padding: '20px' }}>
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px', fontSize:'1.1em'}}>Register Vehicle</h2>
          <form onSubmit={handleSubmit} style={{padding:0, gap:'12px'}}>
            <div className="input-group"><label>Owner / Driver</label><select value={formData.ownerId} onChange={e => setFormData({...formData, ownerId: e.target.value})} required><option value="">Select Owner</option>{users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select></div>
            <div className="input-group"><label>Make & Model</label><input placeholder="e.g. Yamaha FZ-X" value={formData.makeAndModel} onChange={e => setFormData({...formData, makeAndModel: e.target.value})} required /></div>
            <div className="input-group"><label>License Plate</label><input placeholder="e.g. MH-12-AB-1234" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} required /></div>
            <div className="input-group"><label>Color</label><input placeholder="e.g. Matte Copper" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} required /></div>
            <div className="input-group"><label>Current Odometer (km)</label><input type="number" value={formData.currentOdometer} onChange={e => setFormData({...formData, currentOdometer: e.target.value})} required /></div>
            <button type="submit" className="primary" style={{marginTop:'10px'}}>Register Vehicle</button>
          </form>
        </div>
        <div className="data-card">
          <table><thead><tr><th>ID</th><th>License Plate</th><th>Model</th><th>Owner</th><th>Odometer</th></tr></thead>
          <tbody>{vehicles.map(v => <tr key={v.id}><td>#{v.id}</td><td style={{fontWeight:'bold'}}>{v.licensePlate}</td><td>{v.makeAndModel}</td><td>{v.owner?.fullName}</td><td>{v.currentOdometer} km</td></tr>)}</tbody></table>
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
            <div className="vehicle-thumb">🚙</div><div><div className="v-plate">{d.vehicle.licensePlate}</div><div className="v-model">{d.vehicle.makeAndModel}</div></div>
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
    const [uRes, vRes, mRes, tRes] = await Promise.all([ fetch('/api/users', { headers }), fetch('/api/vehicles', { headers }), fetch('/api/mechanics', { headers }), fetch('/api/services', { headers }) ]);
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

  const fetchUsers = () => fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).then(setUsers);
  useEffect(() => { fetchUsers(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
    setFormData({ fullName: '', email: '', phone: '' });
    fetchUsers();
  };

  return (
    <div>
      <div className="page-header"><h1>Drivers / Customers</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="data-card" style={{ padding: '20px' }}>
          <h2 style={{marginTop:0, borderBottom:'1px solid #1e2235', paddingBottom:'10px', fontSize:'1.1em'}}>Register Driver</h2>
          <form onSubmit={handleSubmit} style={{padding:0, gap:'12px'}}>
            <div className="input-group"><label>Full Name</label><input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required /></div>
            <div className="input-group"><label>Email Address</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
            <div className="input-group"><label>Phone Number</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
            <button type="submit" className="primary" style={{marginTop:'10px'}}>Register Driver</button>
          </form>
        </div>
        <div className="data-card">
          <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
          <tbody>{users.map(u => <tr key={u.id}><td>#{u.id}</td><td style={{fontWeight:'bold'}}>{u.fullName}</td><td>{u.email}</td><td>{u.phone}</td></tr>)}</tbody></table>
        </div>
      </div>
    </div>
  );
};

export const Settings = () => ( <div><div className="page-header"><h1>Settings</h1></div><div className="data-card" style={{padding:'20px'}}><h2>Settings</h2></div></div> );
EOF

# Rebuild React Project
echo "📦 Recompiling Application..."
cd frontend
npm run build --silent
cd ..
cp -r frontend/build/* src/main/resources/static/
echo "✅ Registration forms successfully added!"