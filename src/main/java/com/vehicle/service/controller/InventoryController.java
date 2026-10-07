package com.vehicle.service.controller;

import com.vehicle.service.model.*;
import com.vehicle.service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    
    @Autowired private InventoryRepository repo;
    @Autowired private PartOrderRepository orderRepo;
    @Autowired private MerchantRepository merchantRepo;

    @GetMapping
    public List<InventoryItem> getAll() { 
        return repo.findAll(); 
    }

    @PostMapping
    public InventoryItem addPart(@RequestBody InventoryItem item) { 
        return repo.save(item); 
    }

    @Autowired private ServiceTicketRepository ticketRepo;

    @PostMapping("/{id}/use")
    public ResponseEntity<?> usePart(@PathVariable Long id, @RequestParam int quantity, @RequestParam(required = false) Long ticketId) {
        InventoryItem item = repo.findById(id).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();
        if (item.getStockLevel() < quantity) {
            return ResponseEntity.badRequest().body(Map.of("error", "Not enough stock left in the Vault!"));
        }
        item.setStockLevel(item.getStockLevel() - quantity);
        repo.save(item);

        if (ticketId != null) {
            ServiceTicket ticket = ticketRepo.findById(ticketId).orElse(null);
            if (ticket != null) {
                ticket.setEstimatedCost((ticket.getEstimatedCost() == null ? 0 : ticket.getEstimatedCost()) + (item.getPrice() * quantity));
                ticketRepo.save(ticket);
            }
        }
        return ResponseEntity.ok(Map.of("message", "Part attached to service and deducted from vault."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePart(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders")
    public List<PartOrder> getOrders() {
        return orderRepo.findAll();
    }

    
    @PostMapping("/orders")
    public ResponseEntity<?> orderParts(@RequestBody PartOrder order) {
        order.setOrderDate(LocalDateTime.now());
        if (order.getStatus() == null) order.setStatus("Pending");
        if (order.getGeneration() == null) order.setGeneration("Manual");
        if (order.getMerchant() != null && order.getMerchant().getId() != null) {
            order.setMerchant(merchantRepo.findById(order.getMerchant().getId()).orElse(null));
        }
        orderRepo.save(order);
        return ResponseEntity.ok(Map.of("message", "Order placed with merchant successfully."));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        PartOrder order = orderRepo.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        
        if ("Canceled".equals(status)) {
            // Check 24 hour limit
            if (order.getOrderDate().plusHours(24).isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot cancel order after 24 hours."));
            }
            order.setStatus("Canceled");
        } else if ("Completed".equals(status)) {
            order.setStatus("Completed");
            // Increment stock
            InventoryItem item = repo.findBySerialNumber(order.getSerialNumber());
            if (item != null) {
                item.setStockLevel(item.getStockLevel() + order.getQuantity());
                repo.save(item);
            }
        }
        orderRepo.save(order);
        return ResponseEntity.ok(Map.of("message", "Order status updated."));
    }
}
