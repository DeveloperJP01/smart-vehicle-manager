package com.vehicle.service.controller;

import com.vehicle.service.model.ServiceHistory;
import com.vehicle.service.model.ServiceTicket;
import com.vehicle.service.repository.ServiceHistoryRepository;
import com.vehicle.service.repository.ServiceTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/service-history")
public class ServiceHistoryController {

    @Autowired
    private ServiceHistoryRepository repository;

    @Autowired
    private ServiceTicketRepository ticketRepository;

    @GetMapping("/{licensePlate}")
    public List<ServiceHistory> getHistory(@PathVariable String licensePlate) {
        final String cleanInput = licensePlate.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        List<ServiceHistory> historyList = new ArrayList<>();
        List<ServiceHistory> allHistory = repository.findAll();
        for (ServiceHistory sh : allHistory) {
            if (sh.getLicensePlate() != null && sh.getLicensePlate().replaceAll("[^a-zA-Z0-9]", "").equalsIgnoreCase(cleanInput)) {
                historyList.add(sh);
            }
        }
        
        // Also fetch any tickets from ServiceTickets table
        List<ServiceTicket> tickets = ticketRepository.findAll();
        for (ServiceTicket t : tickets) {
            if (t.getVehicle() != null && t.getVehicle().getLicensePlate() != null
                    && t.getVehicle().getLicensePlate().replaceAll("[^a-zA-Z0-9]", "").equalsIgnoreCase(cleanInput)) {
                ServiceHistory sh = new ServiceHistory();
                sh.setId(t.getId() + 100000L);
                sh.setLicensePlate(t.getVehicle().getLicensePlate());
                sh.setServiceType(t.getServiceType() != null ? t.getServiceType() : "General Service");
                sh.setServiceDate(t.getAppointmentDate());
                sh.setCost(t.getEstimatedCost() != null ? t.getEstimatedCost() : 0.0);
                sh.setDescription("Status: " + t.getStatus() + (t.getAftermarketMods() != null && !t.getAftermarketMods().isEmpty() ? " | Mods: " + t.getAftermarketMods() : ""));
                historyList.add(sh);
            }
        }
        return historyList;
    }
}