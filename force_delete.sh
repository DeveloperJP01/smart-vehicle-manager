#!/bin/bash

# Update ServiceTicketController to handle cascading deletes manually
cat << 'EOF' > src/main/java/com/vehicle/service/controller/ServiceTicketController.java
package com.vehicle.service.controller;
import com.vehicle.service.dto.*; import com.vehicle.service.model.*; import com.vehicle.service.repository.*;
import org.springframework.beans.factory.annotation.Autowired; import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
import java.io.IOException; import java.util.List; import java.util.stream.Collectors;

@RestController @RequestMapping("/api")
public class ServiceTicketController {
    @Autowired private ServiceTicketRepository ticketRepo; @Autowired private UserRepository userRepo;
    @Autowired private VehicleRepository vehicleRepo; @Autowired private MechanicRepository mechanicRepo;

    @GetMapping("/users") public List<User> getAllUsers() { return userRepo.findAll(); }
    @PostMapping("/users") public User createUser(@RequestBody User user) { return userRepo.save(user); }
    
    @DeleteMapping("/users/{id}") public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try { 
            // 1. Find all vehicles owned by this driver
            List<Vehicle> vehicles = vehicleRepo.findAll().stream().filter(v -> v.getOwner().getId().equals(id)).collect(Collectors.toList());
            for (Vehicle v : vehicles) {
                // 2. Delete all tickets for each vehicle
                List<ServiceTicket> tickets = ticketRepo.findAll().stream().filter(t -> t.getVehicle().getId().equals(v.getId())).collect(Collectors.toList());
                ticketRepo.deleteAll(tickets);
            }
            // 3. Delete the vehicles, then the driver
            vehicleRepo.deleteAll(vehicles);
            userRepo.deleteById(id); 
            return ResponseEntity.ok().build(); 
        } 
        catch (Exception e) { return ResponseEntity.badRequest().body("Failed to delete driver."); }
    }
    
    @GetMapping("/vehicles") public List<Vehicle> getAllVehicles() { return vehicleRepo.findAll(); }
    @PostMapping("/vehicles") public Vehicle createVehicle(@RequestBody VehicleRequest req) {
        Vehicle v = new Vehicle(); v.setMakeAndModel(req.getMakeAndModel()); v.setLicensePlate(req.getLicensePlate()); v.setColor(req.getColor());
        int odo = req.getCurrentOdometer() != null ? req.getCurrentOdometer() : 0;
        v.setCurrentOdometer(odo); v.setLastOilOdometer(odo); v.setLastBrakeOdometer(odo); v.setLastTireOdometer(odo);
        v.setOwner(userRepo.findById(req.getOwnerId()).orElseThrow());
        return vehicleRepo.save(v);
    }
    
    @DeleteMapping("/vehicles/{id}") public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try { 
            // 1. Delete all service tickets associated with this vehicle first
            List<ServiceTicket> tickets = ticketRepo.findAll().stream().filter(t -> t.getVehicle().getId().equals(id)).collect(Collectors.toList());
            ticketRepo.deleteAll(tickets);
            // 2. Delete the vehicle safely
            vehicleRepo.deleteById(id); 
            return ResponseEntity.ok().build(); 
        } 
        catch (Exception e) { return ResponseEntity.badRequest().body("Failed to delete vehicle."); }
    }
    
    @GetMapping("/mechanics") public List<Mechanic> getAllMechanics() { return mechanicRepo.findAll(); }
    @GetMapping("/services") public List<ServiceTicket> getAllTickets() { return ticketRepo.findAll(); }

    @PostMapping(value = "/services", consumes = {"multipart/form-data"})
    public ServiceTicket createTicket(@ModelAttribute TicketRequest req) throws IOException {
        ServiceTicket ticket = new ServiceTicket();
        ticket.setCustomer(userRepo.findById(req.getCustomerId()).orElseThrow());
        ticket.setVehicle(vehicleRepo.findById(req.getVehicleId()).orElseThrow());
        if (req.getMechanicId() != null) ticket.setAssignedMechanic(mechanicRepo.findById(req.getMechanicId()).orElse(null));
        ticket.setServiceType(req.getServiceType()); ticket.setAppointmentDate(req.getAppointmentDate());
        ticket.setAftermarketMods(req.getAftermarketMods()); ticket.setStatus("Pending");
        ticket.setEstimatedCost(Math.round((Math.random() * 4000 + 1000) * 100.0) / 100.0);
        if (req.getReferencePhoto() != null && !req.getReferencePhoto().isEmpty()) ticket.setReferencePhoto(req.getReferencePhoto().getBytes());
        return ticketRepo.save(ticket);
    }

    @PutMapping("/services/{id}/status")
    public ServiceTicket updateStatus(@PathVariable Long id, @RequestBody String status) {
        ServiceTicket ticket = ticketRepo.findById(id).orElseThrow();
        ticket.setStatus(status); 
        if (status.equalsIgnoreCase("Completed")) {
            Vehicle v = ticket.getVehicle();
            String type = ticket.getServiceType().toLowerCase();
            if (type.contains("oil") || type.contains("engine")) v.setLastOilOdometer(v.getCurrentOdometer());
            if (type.contains("brake")) v.setLastBrakeOdometer(v.getCurrentOdometer());
            if (type.contains("tire")) v.setLastTireOdometer(v.getCurrentOdometer());
            vehicleRepo.save(v);
        }
        return ticketRepo.save(ticket);
    }

    @GetMapping("/services/{id}/photo")
    public ResponseEntity<byte[]> getTicketPhoto(@PathVariable Long id) {
        ServiceTicket ticket = ticketRepo.findById(id).orElseThrow();
        if (ticket.getReferencePhoto() == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"photo_" + id + ".jpg\"")
            .contentType(MediaType.IMAGE_JPEG).body(ticket.getReferencePhoto());
    }
}
EOF

echo "✅ Cascading delete functionality successfully implemented!"