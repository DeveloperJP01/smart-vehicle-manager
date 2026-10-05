package com.vehicle.service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory")
public class InventoryItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String partName;
    private String serialNumber;
    private String location;
    private int stockLevel;
    private int warningLevel;
    private double price;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public int getStockLevel() { return stockLevel; }
    public void setStockLevel(int stockLevel) { this.stockLevel = stockLevel; }
    public int getWarningLevel() { return warningLevel; }
    public void setWarningLevel(int warningLevel) { this.warningLevel = warningLevel; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}