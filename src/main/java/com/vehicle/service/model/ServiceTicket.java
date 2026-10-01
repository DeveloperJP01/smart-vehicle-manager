package com.vehicle.service.model;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity @Table(name = "service_tickets")
public class ServiceTicket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "user_id", nullable = false) private User customer;
    @ManyToOne @JoinColumn(name = "vehicle_id", nullable = false) private Vehicle vehicle;
    @ManyToOne @JoinColumn(name = "mechanic_id") private Mechanic assignedMechanic;
    private String serviceType; private LocalDate appointmentDate; private String status;
    private String priority; private Double estimatedCost;
    @Column(length = 500) private String aftermarketMods;
    @Lob @Column(columnDefinition = "LONGBLOB") private byte[] referencePhoto;
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getCustomer() { return customer; } public void setCustomer(User customer) { this.customer = customer; }
    public Vehicle getVehicle() { return vehicle; } public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
    public Mechanic getAssignedMechanic() { return assignedMechanic; } public void setAssignedMechanic(Mechanic assignedMechanic) { this.assignedMechanic = assignedMechanic; }
    public String getServiceType() { return serviceType; } public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public LocalDate getAppointmentDate() { return appointmentDate; } public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; } public void setPriority(String priority) { this.priority = priority; }
    public Double getEstimatedCost() { return estimatedCost; } public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }
    public String getAftermarketMods() { return aftermarketMods; } public void setAftermarketMods(String aftermarketMods) { this.aftermarketMods = aftermarketMods; }
    public byte[] getReferencePhoto() { return referencePhoto; } public void setReferencePhoto(byte[] referencePhoto) { this.referencePhoto = referencePhoto; }
}
