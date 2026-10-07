package com.vehicle.service.model;
import jakarta.persistence.*;
@Entity @Table(name = "vehicles")
public class Vehicle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String vehicleType;
    private String makeAndModel; private String licensePlate; private String color;
    private String chassisNumber; private String engineNumber;
    private Integer currentOdometer = 0; private Integer lastOilOdometer = 0; 
    private Integer lastBrakeOdometer = 0; private Integer lastTireOdometer = 0;
    private String ownerName;
    private String ownerPhone;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getMakeAndModel() { return makeAndModel; } public void setMakeAndModel(String makeAndModel) { this.makeAndModel = makeAndModel; }
    public String getLicensePlate() { return licensePlate; } public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public String getColor() { return color; } public void setColor(String color) { this.color = color; }
    public String getChassisNumber() { return chassisNumber; } public void setChassisNumber(String chassisNumber) { this.chassisNumber = chassisNumber; }
    public String getEngineNumber() { return engineNumber; } public void setEngineNumber(String engineNumber) { this.engineNumber = engineNumber; }
    public Integer getCurrentOdometer() { return currentOdometer; } public void setCurrentOdometer(Integer currentOdometer) { this.currentOdometer = currentOdometer; }
    public Integer getLastOilOdometer() { return lastOilOdometer; } public void setLastOilOdometer(Integer lastOilOdometer) { this.lastOilOdometer = lastOilOdometer; }
    public Integer getLastBrakeOdometer() { return lastBrakeOdometer; } public void setLastBrakeOdometer(Integer lastBrakeOdometer) { this.lastBrakeOdometer = lastBrakeOdometer; }
    public Integer getLastTireOdometer() { return lastTireOdometer; } public void setLastTireOdometer(Integer lastTireOdometer) { this.lastTireOdometer = lastTireOdometer; }
    public String getOwnerName() { return ownerName; } public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getOwnerPhone() { return ownerPhone; } public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }
}
