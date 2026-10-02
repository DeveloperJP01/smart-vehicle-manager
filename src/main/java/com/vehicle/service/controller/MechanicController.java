package com.vehicle.service.controller;

import com.vehicle.service.model.Mechanic;
import com.vehicle.service.repository.MechanicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mechanics")
public class MechanicController {

    @Autowired
    private MechanicRepository mechanicRepository;

    @GetMapping
    public List<Mechanic> getAll() {
        return mechanicRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addMechanic(@RequestBody Mechanic mechanic) {
        try {
            if(mechanic.getName() == null || mechanic.getName().isEmpty()) {
                return ResponseEntity.badRequest().body("Mechanic name is required");
            }
            Mechanic saved = mechanicRepository.save(mechanic);
            return ResponseEntity.ok(saved);
        } catch(Exception e) {
            return ResponseEntity.internalServerError().body("Error saving mechanic: " + e.getMessage());
        }
    }
}
