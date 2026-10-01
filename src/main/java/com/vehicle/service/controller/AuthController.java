package com.vehicle.service.controller;
import com.vehicle.service.security.JwtService;
import org.springframework.security.authentication.*; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager am; private final JwtService jwtService;
    public AuthController(AuthenticationManager am, JwtService jwtService) { this.am = am; this.jwtService = jwtService; }
    @PostMapping("/login") public String login(@RequestBody AuthRequest req) {
        am.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        return jwtService.generateToken(req.getUsername());
    }
}
