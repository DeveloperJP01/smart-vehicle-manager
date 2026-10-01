#!/bin/bash

# 1. Remove the duplicate URL mapping from AutoSenseController
cat << 'EOF' > src/main/java/com/vehicle/service/controller/AutoSenseController.java
package com.vehicle.service.controller;
import com.vehicle.service.model.*; import com.vehicle.service.repository.*;
import org.springframework.beans.factory.annotation.Autowired; import org.springframework.web.bind.annotation.*;
import java.util.*; import java.util.stream.Collectors;
@RestController @RequestMapping("/api")
public class AutoSenseController {
    @Autowired private VehicleRepository vehicleRepo; @Autowired private ServiceTicketRepository ticketRepo;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        List<Vehicle> vehicles = vehicleRepo.findAll();
        List<ServiceTicket> tickets = ticketRepo.findAll();
        long fleetSize = vehicles.size();
        long activeServices = tickets.stream().filter(t -> !t.getStatus().equalsIgnoreCase("COMPLETED")).count();
        double completedBilling = tickets.stream().filter(t -> t.getStatus().equalsIgnoreCase("COMPLETED") && t.getEstimatedCost() != null).mapToDouble(ServiceTicket::getEstimatedCost).sum();
        
        long criticalAlerts = vehicles.stream().filter(v -> {
            int oilDiff = v.getCurrentOdometer() - v.getLastOilOdometer();
            int brakeDiff = v.getCurrentOdometer() - v.getLastBrakeOdometer();
            return oilDiff >= 5000 || brakeDiff >= 20000;
        }).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("fleetSize", fleetSize); stats.put("activeServices", activeServices);
        stats.put("criticalAlerts", criticalAlerts); stats.put("completedBilling", completedBilling);
        return stats;
    }

    @GetMapping("/diagnostics")
    public List<Map<String, Object>> getDiagnostics() {
        return vehicleRepo.findAll().stream().map(v -> {
            Map<String, Object> health = new HashMap<>();
            health.put("vehicle", v);
            List<String> alerts = new ArrayList<>();
            String status = "OPTIMAL";
            
            int oilDiff = v.getCurrentOdometer() - v.getLastOilOdometer();
            if (oilDiff >= 5000) { alerts.add("Engine oil overdue"); status = "CRITICAL"; }
            else if (oilDiff >= 4200) { alerts.add("Engine oil warning"); if(status.equals("OPTIMAL")) status = "WARNING"; }
            
            int brakeDiff = v.getCurrentOdometer() - v.getLastBrakeOdometer();
            if (brakeDiff >= 20000) { alerts.add("Brake service overdue"); status = "CRITICAL"; }
            else if (brakeDiff >= 18000) { alerts.add("Brake pads warning"); if(status.equals("OPTIMAL")) status = "WARNING"; }
            
            int tireDiff = v.getCurrentOdometer() - v.getLastTireOdometer();
            if (tireDiff >= 10000) { alerts.add("Tire rotation needed"); if(status.equals("OPTIMAL")) status = "WARNING"; }
            
            health.put("status", status); health.put("alerts", alerts);
            return health;
        }).collect(Collectors.toList());
    }
}
EOF

# 2. Safely merge the AutoSense odometer reset logic into the original controller
cat << 'EOF' > src/main/java/com/vehicle/service/controller/ServiceTicketController.java
package com.vehicle.service.controller;
import com.vehicle.service.dto.TicketRequest; import com.vehicle.service.model.*; import com.vehicle.service.repository.*;
import org.springframework.beans.factory.annotation.Autowired; import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
import java.io.IOException; import java.util.List;
@RestController @RequestMapping("/api")
public class ServiceTicketController {
    @Autowired private ServiceTicketRepository ticketRepo; @Autowired private UserRepository userRepo;
    @Autowired private VehicleRepository vehicleRepo; @Autowired private MechanicRepository mechanicRepo;

    @GetMapping("/users") public List<User> getAllUsers() { return userRepo.findAll(); }
    @GetMapping("/vehicles") public List<Vehicle> getAllVehicles() { return vehicleRepo.findAll(); }
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

# 3. Inject presentation demo data (2 critical alerts out of 3 vehicles)
cat << 'EOF' > src/main/java/com/vehicle/service/DataSeeder.java
package com.vehicle.service;
import com.vehicle.service.model.*; import com.vehicle.service.repository.*;
import org.springframework.boot.CommandLineRunner; import org.springframework.stereotype.Component;
@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository uRepo; private final VehicleRepository vRepo; private final MechanicRepository mRepo; private final ServiceTicketRepository tRepo;
    public DataSeeder(UserRepository u, VehicleRepository v, MechanicRepository m, ServiceTicketRepository t) { this.uRepo = u; this.vRepo = v; this.mRepo = m; this.tRepo = t; }
    @Override
    public void run(String... args) {
        if (uRepo.count() == 0) {
            User u1 = new User(); u1.setFullName("Jayesh Pawar"); u1.setEmail("jayesh@example.com"); u1.setPhone("555-0192"); uRepo.save(u1);
            
            Vehicle v1 = new Vehicle(); v1.setMakeAndModel("Yamaha FZ-X 150"); v1.setLicensePlate("MH-12-AB-1234"); v1.setColor("Matte Copper"); 
            v1.setCurrentOdometer(5400); v1.setLastOilOdometer(0); v1.setLastBrakeOdometer(0); v1.setLastTireOdometer(0); v1.setOwner(u1); vRepo.save(v1);

            Vehicle v2 = new Vehicle(); v2.setMakeAndModel("Honda City VTEC"); v2.setLicensePlate("GJ-20-DF-3121"); v2.setColor("White"); 
            v2.setCurrentOdometer(22500); v2.setLastOilOdometer(20000); v2.setLastBrakeOdometer(0); v2.setLastTireOdometer(15000); v2.setOwner(u1); vRepo.save(v2);
            
            Vehicle v3 = new Vehicle(); v3.setMakeAndModel("Tata Nexon EV"); v3.setLicensePlate("MH-15-EV-9999"); v3.setColor("Teal"); 
            v3.setCurrentOdometer(12000); v3.setLastOilOdometer(12000); v3.setLastBrakeOdometer(12000); v3.setLastTireOdometer(12000); v3.setOwner(u1); vRepo.save(v3);

            Mechanic m1 = new Mechanic(); m1.setName("Raj"); m1.setSpecialization("Custom Fabrication"); mRepo.save(m1);
            
            ServiceTicket t1 = new ServiceTicket(); t1.setCustomer(u1); t1.setVehicle(v1); t1.setAssignedMechanic(m1);
            t1.setServiceType("Engine Oil Change & Filter"); t1.setStatus("In-Progress"); t1.setEstimatedCost(1200.0);
            t1.setAppointmentDate(java.time.LocalDate.now()); tRepo.save(t1);
        }
    }
}
EOF

echo "✅ Spring Boot crash fixed and demo data loaded!"