package com.vehicle.service.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "part_orders")
public class PartOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "merchant_id") private Merchant merchant;
    private String partName;
    private String serialNumber;
    private int quantity;
    private LocalDateTime orderDate;
    private String status; // "Pending", "Completed", "Canceled"
    private String generation; // "Manual", "Automated"
    
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Merchant getMerchant() { return merchant; } public void setMerchant(Merchant merchant) { this.merchant = merchant; }
    public String getPartName() { return partName; } public void setPartName(String partName) { this.partName = partName; }
    public String getSerialNumber() { return serialNumber; } public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public int getQuantity() { return quantity; } public void setQuantity(int quantity) { this.quantity = quantity; }
    public LocalDateTime getOrderDate() { return orderDate; } public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public String getGeneration() { return generation; } public void setGeneration(String generation) { this.generation = generation; }
}
