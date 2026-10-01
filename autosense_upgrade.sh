#!/bin/bash

# 1. Update Vehicle Model with Odometer Tracking
cat << 'EOF' > src/main/java/com/vehicle/service/model/Vehicle.java
package com.vehicle.service.model;
import jakarta.persistence.*;
@Entity @Table(name = "vehicles")
public class Vehicle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String makeAndModel; private String licensePlate; private String color;
    private Integer currentOdometer = 0; private Integer lastOilOdometer = 0; 
    private Integer lastBrakeOdometer = 0; private Integer lastTireOdometer = 0;
    @ManyToOne @JoinColumn(name = "user_id", nullable = false) private User owner;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getMakeAndModel() { return makeAndModel; } public void setMakeAndModel(String makeAndModel) { this.makeAndModel = makeAndModel; }
    public String getLicensePlate() { return licensePlate; } public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public String getColor() { return color; } public void setColor(String color) { this.color = color; }
    public Integer getCurrentOdometer() { return currentOdometer; } public void setCurrentOdometer(Integer currentOdometer) { this.currentOdometer = currentOdometer; }
    public Integer getLastOilOdometer() { return lastOilOdometer; } public void setLastOilOdometer(Integer lastOilOdometer) { this.lastOilOdometer = lastOilOdometer; }
    public Integer getLastBrakeOdometer() { return lastBrakeOdometer; } public void setLastBrakeOdometer(Integer lastBrakeOdometer) { this.lastBrakeOdometer = lastBrakeOdometer; }
    public Integer getLastTireOdometer() { return lastTireOdometer; } public void setLastTireOdometer(Integer lastTireOdometer) { this.lastTireOdometer = lastTireOdometer; }
    public User getOwner() { return owner; } public void setOwner(User owner) { this.owner = owner; }
}
EOF

# 2. Update ServiceTicket Model with Priority and Cost
cat << 'EOF' > src/main/java/com/vehicle/service/model/ServiceTicket.java
package com.vehicle.service.model;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name = "service_tickets")
public class ServiceTicket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "user_id", nullable = false) private User customer;
    @ManyToOne @JoinColumn(name = "vehicle_id", nullable = false) private Vehicle vehicle;
    @ManyToOne @JoinColumn(name = "mechanic_id") private Mechanic assignedMechanic;
    private String serviceType; private LocalDate appointmentDate; private String status;
    private String priority; private Double estimatedCost;
    @Column(length = 500) private String aftermarketMods;
    @Lob @Column(columnDefinition = "LONGBLOB") private byte[] referencePhoto;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getCustomer() { return customer; } public void setCustomer(User customer) { this.customer = customer; }
    public Vehicle getVehicle() { return vehicle; } public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
    public Mechanic getAssignedMechanic() { return assignedMechanic; } public void setAssignedMechanic(Mechanic assignedMechanic) { this.assignedMechanic = assignedMechanic; }
    public String getServiceType() { return serviceType; } public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public LocalDate getAppointmentDate() { return appointmentDate; } public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; } public void setPriority(String priority) { this.priority = priority; }
    public Double getEstimatedCost() { return estimatedCost; } public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }
    public String getAftermarketMods() { return aftermarketMods; } public void setAftermarketMods(String aftermarketMods) { this.aftermarketMods = aftermarketMods; }
    public byte[] getReferencePhoto() { return referencePhoto; } public void setReferencePhoto(byte[] referencePhoto) { this.referencePhoto = referencePhoto; }
}
EOF

# 3. Create Diagnostic and Dashboard Endpoints
cat << 'EOF' > src/main/java/com/vehicle/service/controller/AutoSenseController.java
package com.vehicle.service.controller;
import com.vehicle.service.model.*; import com.vehicle.service.repository.*;
import org.springframework.beans.factory.annotation.Autowired; import org.springframework.web.bind.annotation.*;
import java.util.*; import java.util.stream.Collectors;
@RestController @RequestMapping("/api")
public class AutoSenseController {
    @Autowired private VehicleRepository vehicleRepo; @Autowired private ServiceTicketRepository ticketRepo;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        List<Vehicle> vehicles = vehicleRepo.findAll();
        List<ServiceTicket> tickets = ticketRepo.findAll();
        long fleetSize = vehicles.size();
        long activeServices = tickets.stream().filter(t -> !t.getStatus().equals("COMPLETED")).count();
        double completedBilling = tickets.stream().filter(t -> t.getStatus().equals("COMPLETED") && t.getEstimatedCost() != null).mapToDouble(ServiceTicket::getEstimatedCost).sum();
        
        long criticalAlerts = vehicles.stream().filter(v -> {
            int oilDiff = v.getCurrentOdometer() - v.getLastOilOdometer();
            int brakeDiff = v.getCurrentOdometer() - v.getLastBrakeOdometer();
            return oilDiff >= 5000 || brakeDiff >= 20000;
        }).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("fleetSize", fleetSize); stats.put("activeServices", activeServices);
        stats.put("criticalAlerts", criticalAlerts); stats.put("completedBilling", completedBilling);
        return stats;
    }

    @GetMapping("/diagnostics")
    public List<Map<String, Object>> getDiagnostics() {
        return vehicleRepo.findAll().stream().map(v -> {
            Map<String, Object> health = new HashMap<>();
            health.put("vehicle", v);
            List<String> alerts = new ArrayList<>();
            String status = "OPTIMAL";
            
            int oilDiff = v.getCurrentOdometer() - v.getLastOilOdometer();
            if (oilDiff >= 5000) { alerts.add("Engine oil overdue"); status = "CRITICAL"; }
            else if (oilDiff >= 4200) { alerts.add("Engine oil warning"); if(status.equals("OPTIMAL")) status = "WARNING"; }
            
            int brakeDiff = v.getCurrentOdometer() - v.getLastBrakeOdometer();
            if (brakeDiff >= 20000) { alerts.add("Brake service overdue"); status = "CRITICAL"; }
            else if (brakeDiff >= 18000) { alerts.add("Brake pads warning"); if(status.equals("OPTIMAL")) status = "WARNING"; }
            
            int tireDiff = v.getCurrentOdometer() - v.getLastTireOdometer();
            if (tireDiff >= 10000) { alerts.add("Tire rotation needed"); if(status.equals("OPTIMAL")) status = "WARNING"; }
            
            health.put("status", status); health.put("alerts", alerts);
            return health;
        }).collect(Collectors.toList());
    }

    @PutMapping("/services/{id}/status")
    public ServiceTicket updateStatus(@PathVariable Long id, @RequestBody String status) {
        ServiceTicket ticket = ticketRepo.findById(id).orElseThrow();
        ticket.setStatus(status);
        if (status.equals("COMPLETED")) {
            Vehicle v = ticket.getVehicle();
            String type = ticket.getServiceType().toLowerCase();
            if (type.contains("oil")) v.setLastOilOdometer(v.getCurrentOdometer());
            if (type.contains("brake")) v.setLastBrakeOdometer(v.getCurrentOdometer());
            if (type.contains("tire")) v.setLastTireOdometer(v.getCurrentOdometer());
            vehicleRepo.save(v);
        }
        return ticketRepo.save(ticket);
    }
}
EOF

# 4. Update React Dashboard to include KPI Cards and Smart Health
cat << 'EOF' > frontend/src/Dashboard.js
import React, { useState, useEffect } from 'react';

function Dashboard({ token }) {
  const [stats, setStats] = useState({ fleetSize: 0, activeServices: 0, criticalAlerts: 0, completedBilling: 0 });
  const [diagnostics, setDiagnostics] = useState([]);
  
  useEffect(() => {
    const fetchAutoSenseData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [statRes, diagRes] = await Promise.all([ fetch('/api/dashboard', { headers }), fetch('/api/diagnostics', { headers }) ]);
      if(statRes.ok) setStats(await statRes.json());
      if(diagRes.ok) setDiagnostics(await diagRes.json());
    };
    fetchAutoSenseData();
  }, [token]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.9em', textTransform: 'uppercase' }}>Vehicles Fleet</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#fff' }}>{stats.fleetSize}</div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #fbbf24' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.9em', textTransform: 'uppercase' }}>Active Work Orders</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#fff' }}>{stats.activeServices}</div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.9em', textTransform: 'uppercase' }}>Critical Alerts</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#ef4444' }}>{stats.criticalAlerts}</div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.9em', textTransform: 'uppercase' }}>Completed Billing</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#10b981' }}>₹{stats.completedBilling.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <h2>Smart Health Overview</h2>
        <table>
          <thead><tr><th>Vehicle</th><th>Odometer</th><th>Status</th><th>Active Alerts</th></tr></thead>
          <tbody>
            {diagnostics.map((d, i) => (
              <tr key={i}>
                <td>{d.vehicle.licensePlate}<br/><span style={{fontSize:'0.85em', color:'#9ca3af'}}>{d.vehicle.makeAndModel}</span></td>
                <td>{d.vehicle.currentOdometer} km</td>
                <td><span className={`status ${d.status.toLowerCase() === 'optimal' ? 'completed' : d.status.toLowerCase() === 'warning' ? 'pending' : 'critical'}`} style={d.status === 'CRITICAL' ? {background:'rgba(239, 68, 68, 0.15)', color:'#ef4444', border:'1px solid rgba(239, 68, 68, 0.3)'} : {}}>{d.status}</span></td>
                <td style={{color: '#9ca3af', fontSize: '0.9em'}}>{d.alerts.length > 0 ? d.alerts.join(', ') : 'All systems normal'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Dashboard;
EOF

# 5. Rebuild and Deploy
echo "📦 Compiling AutoSense Engine..."
cd frontend
npm run build --silent
cd ..
cp -r frontend/build/* src/main/resources/static/
echo "✅ AutoSense Implementation Complete!"