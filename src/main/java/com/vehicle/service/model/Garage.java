package com.vehicle.service.model;
import jakarta.persistence.*;

@Entity
@Table(name = "garages")
public class Garage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    private String phone;
    private String address;
    private String gstin;
    private String branchName;
    private String email;

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; } public void setAddress(String address) { this.address = address; }
    public String getGstin() { return gstin; } public void setGstin(String gstin) { this.gstin = gstin; }
    public String getBranchName() { return branchName; } public void setBranchName(String branchName) { this.branchName = branchName; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
}
