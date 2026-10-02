package com.vehicle.service.controller;

import com.vehicle.service.model.Driver;
import com.vehicle.service.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {
    @Autowired
    private DriverRepository driverRepository;

    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    @PostMapping
    public Driver addDriver(@RequestBody Driver driver) {
        return driverRepository.save(driver);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDriver(@PathVariable Long id) {
        if (driverRepository.existsById(id)) {
            driverRepository.deleteById(id);
            return ResponseEntity.ok().body("Driver deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}
