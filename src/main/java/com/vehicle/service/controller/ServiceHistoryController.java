package com.vehicle.service.controller;

import com.vehicle.service.model.ServiceHistory;
import com.vehicle.service.repository.ServiceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/service-history")
public class ServiceHistoryController {

    @Autowired
    private ServiceHistoryRepository repository;

    @GetMapping("/{licensePlate}")
    public List<ServiceHistory> getHistory(@PathVariable String licensePlate) {
        return repository.findByLicensePlateIgnoreCase(licensePlate);
    }
}