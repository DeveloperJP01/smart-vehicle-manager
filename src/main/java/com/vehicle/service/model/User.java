package com.vehicle.service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role; // "OWNER", "MANAGER", "EMPLOYEE"

    // Employee specific fields
    private String post;
    private Double salary;
    private String address;

    @Lob @Column(columnDefinition = "LONGBLOB") private byte[] aadharCard;
    @Lob @Column(columnDefinition = "LONGBLOB") private byte[] panCard;
    @Lob @Column(columnDefinition = "LONGBLOB") private byte[] resume;
    @Lob @Column(columnDefinition = "LONGBLOB") private byte[] photo;
    @Lob @Column(columnDefinition = "LONGBLOB") private byte[] bankPassbook;
    @Lob @Column(columnDefinition = "LONGBLOB") private byte[] experienceLetter;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPost() { return post; }
    public void setPost(String post) { this.post = post; }

    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public byte[] getAadharCard() { return aadharCard; } public void setAadharCard(byte[] aadharCard) { this.aadharCard = aadharCard; }
    public byte[] getPanCard() { return panCard; } public void setPanCard(byte[] panCard) { this.panCard = panCard; }
    public byte[] getResume() { return resume; } public void setResume(byte[] resume) { this.resume = resume; }
    public byte[] getPhoto() { return photo; } public void setPhoto(byte[] photo) { this.photo = photo; }
    public byte[] getBankPassbook() { return bankPassbook; } public void setBankPassbook(byte[] bankPassbook) { this.bankPassbook = bankPassbook; }
    public byte[] getExperienceLetter() { return experienceLetter; } public void setExperienceLetter(byte[] experienceLetter) { this.experienceLetter = experienceLetter; }
}