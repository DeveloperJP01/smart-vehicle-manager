package com.vehicle.service.controller;
import com.vehicle.service.model.*;
import com.vehicle.service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/registry")
public class RegistryController {
    @Autowired private MechanicRepository mechanicRepo;
    @Autowired private MerchantRepository merchantRepo;

    @GetMapping("/mechanics") public List<Mechanic> getMechanics() { return mechanicRepo.findAll(); }
    @PostMapping("/mechanics") public Mechanic addMechanic(@RequestBody Mechanic m) { return mechanicRepo.save(m); }
    @DeleteMapping("/mechanics/{id}") public ResponseEntity<?> deleteMechanic(@PathVariable Long id) {
        mechanicRepo.deleteById(id); return ResponseEntity.ok().build();
    }

    @GetMapping("/merchants") public List<Merchant> getMerchants() { return merchantRepo.findAll(); }
    @PostMapping("/merchants") public Merchant addMerchant(@RequestBody Merchant m) { return merchantRepo.save(m); }
    @DeleteMapping("/merchants/{id}") public ResponseEntity<?> deleteMerchant(@PathVariable Long id) {
        merchantRepo.deleteById(id); return ResponseEntity.ok().build();
    }
}
