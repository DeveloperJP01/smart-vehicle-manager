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
