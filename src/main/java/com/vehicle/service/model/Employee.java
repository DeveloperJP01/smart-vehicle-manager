package com.vehicle.service.model;
import jakarta.persistence.*;

@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String post;
    private Double salary;
    private String phone;
    private String email;
    private String address;

    @Lob private byte[] aadharCard;
    @Lob private byte[] panCard;
    @Lob private byte[] resume;
    @Lob private byte[] photo;
    @Lob private byte[] bankPassbook;
    @Lob private byte[] experienceLetter;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPost() { return post; }
    public void setPost(String post) { this.post = post; }
    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public byte[] getAadharCard() { return aadharCard; }
    public void setAadharCard(byte[] aadharCard) { this.aadharCard = aadharCard; }
    public byte[] getPanCard() { return panCard; }
    public void setPanCard(byte[] panCard) { this.panCard = panCard; }
    public byte[] getResume() { return resume; }
    public void setResume(byte[] resume) { this.resume = resume; }
    public byte[] getPhoto() { return photo; }
    public void setPhoto(byte[] photo) { this.photo = photo; }
    public byte[] getBankPassbook() { return bankPassbook; }
    public void setBankPassbook(byte[] bankPassbook) { this.bankPassbook = bankPassbook; }
    public byte[] getExperienceLetter() { return experienceLetter; }
    public void setExperienceLetter(byte[] experienceLetter) { this.experienceLetter = experienceLetter; }
}
