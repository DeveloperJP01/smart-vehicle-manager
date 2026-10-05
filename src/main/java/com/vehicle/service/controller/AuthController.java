package com.vehicle.service.controller;
import com.vehicle.service.security.JwtService;
import org.springframework.security.authentication.*; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager am; private final JwtService jwtService;
    private final com.vehicle.service.repository.UserRepository userRepo;
    public AuthController(AuthenticationManager am, JwtService jwtService, com.vehicle.service.repository.UserRepository userRepo) { this.am = am; this.jwtService = jwtService; this.userRepo = userRepo; }
    
    @PostMapping("/login") public String login(@RequestBody AuthRequest req) {
        am.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        return jwtService.generateToken(req.getUsername());
    }

    @GetMapping("/me") public org.springframework.http.ResponseEntity<?> getMe(java.security.Principal principal) {
        if (principal == null) return org.springframework.http.ResponseEntity.status(401).build();
        com.vehicle.service.model.User u = userRepo.findByUsername(principal.getName()).orElse(null);
        if (u == null) return org.springframework.http.ResponseEntity.notFound().build();
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("username", u.getUsername(), "role", u.getRole() != null ? u.getRole() : "Employee"));
    }
}
