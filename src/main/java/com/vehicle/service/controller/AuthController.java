package com.vehicle.service.controller;
import com.vehicle.service.security.JwtService;
import org.springframework.security.authentication.*; 
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager am; 
    private final JwtService jwtService;
    private final com.vehicle.service.repository.UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager am, JwtService jwtService, com.vehicle.service.repository.UserRepository userRepo, PasswordEncoder passwordEncoder) { 
        this.am = am; 
        this.jwtService = jwtService; 
        this.userRepo = userRepo; 
        this.passwordEncoder = passwordEncoder;
    }
    
    @PostMapping("/login") public String login(@RequestBody AuthRequest req) {
        am.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        return jwtService.generateToken(req.getUsername());
    }

    @GetMapping("/me") public ResponseEntity<?> getMe(java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        com.vehicle.service.model.User u = userRepo.findByUsername(principal.getName()).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("username", u.getUsername(), "role", u.getRole() != null ? u.getRole() : "Employee"));
    }

    @PostMapping("/security-question")
    public ResponseEntity<?> getSecurityQuestion(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required."));
        }
        com.vehicle.service.model.User u = userRepo.findByUsername(username.trim()).orElse(null);
        if (u == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found with this username."));
        }
        if (u.getSecurityQuestion() == null || u.getSecurityQuestion().trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "No security question configured for this account. Please contact an administrator."));
        }
        return ResponseEntity.ok(Map.of("question", u.getSecurityQuestion()));
    }

    @PostMapping("/verify-security-answer")
    public ResponseEntity<?> verifySecurityAnswer(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String answer = body.get("answer");
        if (username == null || answer == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and answer are required."));
        }
        com.vehicle.service.model.User u = userRepo.findByUsername(username.trim()).orElse(null);
        if (u == null || u.getSecurityAnswer() == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User or security answer not found."));
        }
        if (u.getSecurityAnswer().trim().equalsIgnoreCase(answer.trim())) {
            return ResponseEntity.ok(Map.of("verified", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Incorrect security answer. Please try again."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String answer = body.get("answer");
        String newPassword = body.get("newPassword");
        if (username == null || answer == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required."));
        }
        com.vehicle.service.model.User u = userRepo.findByUsername(username.trim()).orElse(null);
        if (u == null || u.getSecurityAnswer() == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found."));
        }
        if (!u.getSecurityAnswer().trim().equalsIgnoreCase(answer.trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Security verification failed."));
        }
        u.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully! You can now log in with your new password."));
    }
}
