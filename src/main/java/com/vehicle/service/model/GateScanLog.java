package com.vehicle.service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "gate_scan_logs")
public class GateScanLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String licensePlate;
    private String ownerName;
    private String scanTime;
    private String status;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    
    public String getScanTime() { return scanTime; }
    public void setScanTime(String scanTime) { this.scanTime = scanTime; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}