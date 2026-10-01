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
