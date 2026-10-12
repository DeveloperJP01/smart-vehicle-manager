package com.vehicle.service.dto;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
public class TicketRequest {
    private Long customerId; private Long vehicleId; private Long mechanicId;
    private String serviceType; private Double serviceCharges; private LocalDate appointmentDate; private String appointmentTime; private String aftermarketMods;
    private MultipartFile referencePhoto;
    public Long getCustomerId() { return customerId; } public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getVehicleId() { return vehicleId; } public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public Long getMechanicId() { return mechanicId; } public void setMechanicId(Long mechanicId) { this.mechanicId = mechanicId; }
    public String getServiceType() { return serviceType; } public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public Double getServiceCharges() { return serviceCharges; } public void setServiceCharges(Double serviceCharges) { this.serviceCharges = serviceCharges; }
    public LocalDate getAppointmentDate() { return appointmentDate; } public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getAppointmentTime() { return appointmentTime; } public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }
    public String getAftermarketMods() { return aftermarketMods; } public void setAftermarketMods(String aftermarketMods) { this.aftermarketMods = aftermarketMods; }
    public MultipartFile getReferencePhoto() { return referencePhoto; } public void setReferencePhoto(MultipartFile referencePhoto) { this.referencePhoto = referencePhoto; }
}
