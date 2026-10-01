package com.vehicle.service.model;
import jakarta.persistence.*;
@Entity @Table(name = "mechanics")
public class Mechanic {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name; private String specialization;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public String getSpecialization() { return specialization; } public void setSpecialization(String specialization) { this.specialization = specialization; }
}
