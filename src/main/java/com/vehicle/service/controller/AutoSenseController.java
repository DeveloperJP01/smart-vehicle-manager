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
