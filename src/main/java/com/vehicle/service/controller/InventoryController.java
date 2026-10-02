package com.vehicle.service.controller;

import com.vehicle.service.model.InventoryItem;
import com.vehicle.service.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    
    @Autowired 
    private InventoryRepository repo;

    @GetMapping
    public List<InventoryItem> getAll() { 
        return repo.findAll(); 
    }

    @PostMapping
    public InventoryItem addPart(@RequestBody InventoryItem item) { 
        return repo.save(item); 
    }

    // NEW: Deduct parts when used in Maintenance
    @PostMapping("/{id}/use")
    public ResponseEntity<?> usePart(@PathVariable Long id, @RequestParam int quantity) {
        InventoryItem item = repo.findById(id).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();
        
        if (item.getStockLevel() < quantity) {
            return ResponseEntity.badRequest().body(Map.of("error", "Not enough stock left in the Vault!"));
        }
        
        // Deduct the quantity and save
        item.setStockLevel(item.getStockLevel() - quantity);
        repo.save(item);
        return ResponseEntity.ok(Map.of("message", "Part attached to service and deducted from vault."));
    }
}