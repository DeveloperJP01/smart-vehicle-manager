package com.vehicle.service.controller;
import com.vehicle.service.dto.*; import com.vehicle.service.model.*; import com.vehicle.service.repository.*;
import org.springframework.beans.factory.annotation.Autowired; import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
import java.io.IOException; import java.util.List; import java.util.stream.Collectors;

@RestController @RequestMapping("/api")
public class ServiceTicketController {
    @Autowired private ServiceTicketRepository ticketRepo; @Autowired private UserRepository userRepo;
    @Autowired private VehicleRepository vehicleRepo;

    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/users") public List<User> getAllUsers() { return userRepo.findAll(); }
    
    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(passwordEncoder.encode("password123"));
        }
        return userRepo.save(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User req) {
        return userRepo.findById(id).map(u -> {
            if (req.getUsername() != null && !req.getUsername().isEmpty()) u.setUsername(req.getUsername());
            if (req.getPassword() != null && !req.getPassword().trim().isEmpty()) {
                u.setPassword(passwordEncoder.encode(req.getPassword()));
            }
            if (req.getRole() != null) u.setRole(req.getRole());
            if (req.getFullName() != null) u.setFullName(req.getFullName());
            if (req.getSecurityQuestion() != null) u.setSecurityQuestion(req.getSecurityQuestion());
            if (req.getSecurityAnswer() != null) u.setSecurityAnswer(req.getSecurityAnswer());
            return ResponseEntity.ok(userRepo.save(u));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try { 
            User user = userRepo.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            if ("admin".equalsIgnoreCase(user.getUsername())) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "SECURITY ALERT: You cannot delete the Master Admin account."));
            }

            // Disassociate user from all service tickets (both as assigned mechanic and customer)
            ticketRepo.unassignMechanic(id);
            ticketRepo.unassignCustomer(id);

            userRepo.delete(user); 
            return ResponseEntity.ok(java.util.Map.of("message", "User deleted successfully.")); 
        } 
        catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }
    
    @GetMapping("/vehicles") public List<Vehicle> getAllVehicles() { return vehicleRepo.findAll(); }
    @PostMapping("/vehicles") public Vehicle createVehicle(@RequestBody Vehicle req) {
        req.setId(null); // Ensure a new vehicle is created
        int odo = req.getCurrentOdometer() != null ? req.getCurrentOdometer() : 0;
        req.setCurrentOdometer(odo); req.setLastOilOdometer(odo); req.setLastBrakeOdometer(odo); req.setLastTireOdometer(odo);
        return vehicleRepo.save(req);
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle req) {
        return vehicleRepo.findById(id).map(v -> {
            v.setMakeAndModel(req.getMakeAndModel());
            v.setLicensePlate(req.getLicensePlate());
            v.setOwnerName(req.getOwnerName());
            v.setOwnerPhone(req.getOwnerPhone());
            v.setColor(req.getColor());
            v.setVehicleType(req.getVehicleType());
            v.setChassisNumber(req.getChassisNumber());
            v.setEngineNumber(req.getEngineNumber());
            if (req.getCurrentOdometer() != null) v.setCurrentOdometer(req.getCurrentOdometer());
            return ResponseEntity.ok(vehicleRepo.save(v));
        }).orElse(ResponseEntity.notFound().build());
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
    
    @GetMapping("/services") public List<ServiceTicket> getAllTickets() { return ticketRepo.findAll(); }

    @PostMapping(value = "/services", consumes = {"multipart/form-data"})
    public ServiceTicket createTicket(@ModelAttribute TicketRequest req) throws IOException {
        ServiceTicket ticket = new ServiceTicket();
        Vehicle vehicle = vehicleRepo.findById(req.getVehicleId()).orElseThrow();
        ticket.setVehicle(vehicle);
        
        if (req.getCustomerId() != null) {
            ticket.setCustomer(userRepo.findById(req.getCustomerId()).orElseThrow());
        }

        if (req.getMechanicId() != null) {
            ticket.setAssignedMechanic(userRepo.findById(req.getMechanicId()).orElse(null));
        }

        ticket.setServiceType(req.getServiceType()); ticket.setAppointmentDate(req.getAppointmentDate());
        ticket.setAppointmentTime(req.getAppointmentTime());
        ticket.setAftermarketMods(req.getAftermarketMods()); ticket.setStatus("Pending");
        ticket.setPaymentStatus("UNPAID");
        
        double cost = 0.0;
        if (req.getServiceCharges() != null && req.getServiceCharges() > 0) {
            cost = req.getServiceCharges();
        } else if ("Minor service".equalsIgnoreCase(req.getServiceType())) cost = 4800.0;
        else if ("Half service".equalsIgnoreCase(req.getServiceType())) cost = 12500.0;
        else if ("Major service".equalsIgnoreCase(req.getServiceType())) cost = 24000.0;
        else if ("Full Service".equalsIgnoreCase(req.getServiceType())) cost = 38500.0;
        else cost = Math.round((Math.random() * 15000 + 5000) * 100.0) / 100.0; // fallback

        ticket.setServiceCost(cost);
        ticket.setPartsCost(0.0);
        ticket.setEstimatedCost(cost);
        if (req.getReferencePhoto() != null && !req.getReferencePhoto().isEmpty()) ticket.setReferencePhoto(req.getReferencePhoto().getBytes());
        return ticketRepo.save(ticket);
    }

    @PutMapping("/services/{id}/pay")
    public ServiceTicket markAsPaid(@PathVariable Long id) {
        ServiceTicket ticket = ticketRepo.findById(id).orElseThrow();
        ticket.setPaymentStatus("PAID");
        ticket.setStatus("Completed");
        Vehicle v = ticket.getVehicle();
        if (v != null) {
            String type = ticket.getServiceType() != null ? ticket.getServiceType().toLowerCase() : "";
            if (type.contains("oil") || type.contains("engine")) v.setLastOilOdometer(v.getCurrentOdometer());
            if (type.contains("brake")) v.setLastBrakeOdometer(v.getCurrentOdometer());
            if (type.contains("tire")) v.setLastTireOdometer(v.getCurrentOdometer());
            vehicleRepo.save(v);
        }
        return ticketRepo.save(ticket);
    }

    @PutMapping("/services/{id}/payment-status")
    public ServiceTicket updatePaymentStatus(@PathVariable Long id, @RequestBody String paymentStatus) {
        ServiceTicket ticket = ticketRepo.findById(id).orElseThrow();
        String cleaned = paymentStatus.replace("\"", "").trim();
        ticket.setPaymentStatus(cleaned);
        if ("PAID".equalsIgnoreCase(cleaned)) {
            ticket.setStatus("Completed");
        }
        return ticketRepo.save(ticket);
    }

    @PutMapping("/services/{id}/status")
    public ServiceTicket updateStatus(@PathVariable Long id, @RequestBody String status) {
        ServiceTicket ticket = ticketRepo.findById(id).orElseThrow();
        ticket.setStatus(status); 
        if (status.equalsIgnoreCase("Completed")) {
            Vehicle v = ticket.getVehicle();
            if (v != null) {
                String type = ticket.getServiceType() != null ? ticket.getServiceType().toLowerCase() : "";
                if (type.contains("oil") || type.contains("engine")) v.setLastOilOdometer(v.getCurrentOdometer());
                if (type.contains("brake")) v.setLastBrakeOdometer(v.getCurrentOdometer());
                if (type.contains("tire")) v.setLastTireOdometer(v.getCurrentOdometer());
                vehicleRepo.save(v);
            }
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

    @PutMapping("/services/{id}")
    public ServiceTicket updateTicket(@PathVariable Long id, @RequestBody TicketRequest req) {
        ServiceTicket ticket = ticketRepo.findById(id).orElseThrow();
        if (req.getServiceType() != null) ticket.setServiceType(req.getServiceType());
        if (req.getAppointmentDate() != null) ticket.setAppointmentDate(req.getAppointmentDate());
        if (req.getAppointmentTime() != null) ticket.setAppointmentTime(req.getAppointmentTime());
        if (req.getAftermarketMods() != null) ticket.setAftermarketMods(req.getAftermarketMods());
        return ticketRepo.save(ticket);
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id) {
        ticketRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
