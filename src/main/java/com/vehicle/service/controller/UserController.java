package com.vehicle.service.controller;

import com.vehicle.service.model.User;
import com.vehicle.service.repository.ServiceTicketRepository;
import com.vehicle.service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceTicketRepository ticketRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addUser(@RequestBody User newUser) {
        if (userRepository.findByUsername(newUser.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        if (newUser.getRole() == null || newUser.getRole().isEmpty()) {
            newUser.setRole("USER"); 
        }
        userRepository.save(newUser);
        return ResponseEntity.ok(Map.of("message", "User created successfully"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        if ("admin".equalsIgnoreCase(user.getUsername()) || "ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("error", "SECURITY ALERT: You cannot delete the Master Admin account."));
        }
        
        ticketRepo.unassignMechanic(id);
        ticketRepo.unassignCustomer(id);

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User access revoked."));
    }
}