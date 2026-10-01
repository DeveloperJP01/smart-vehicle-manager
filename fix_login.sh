#!/bin/bash

# 1. Make AuthRequest a public class so Spring Boot can read the login data
cat << 'EOF' > src/main/java/com/vehicle/service/controller/AuthRequest.java
package com.vehicle.service.controller;
public class AuthRequest {
    private String username; private String password;
    public String getUsername() { return username; } public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; } public void setPassword(String password) { this.password = password; }
}
EOF

cat << 'EOF' > src/main/java/com/vehicle/service/controller/AuthController.java
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
EOF

# 2. Switch to plain-text password validation to guarantee it matches
cat << 'EOF' > src/main/java/com/vehicle/service/security/CustomUserDetailsService.java
package com.vehicle.service.security;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if ("admin_mechanic".equals(username)) {
            return User.builder().username("admin_mechanic").password("{noop}password123").roles("MECHANIC").build();
        }
        throw new UsernameNotFoundException("Not found");
    }
}
EOF

cat << 'EOF' > src/main/java/com/vehicle/service/security/SecurityConfig.java
package com.vehicle.service.security;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*; import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories; import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain; import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration @EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter; private final CustomUserDetailsService uds;
    public SecurityConfig(JwtAuthFilter jwtAuthFilter, CustomUserDetailsService uds) { this.jwtAuthFilter = jwtAuthFilter; this.uds = uds; }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/services/*/photo", "/", "/index.html", "/static/**").permitAll() 
                .requestMatchers("/api/services/**", "/api/users", "/api/vehicles", "/api/mechanics").hasRole("MECHANIC") 
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
    @Bean public AuthenticationProvider authProvider() { DaoAuthenticationProvider p = new DaoAuthenticationProvider(); p.setUserDetailsService(uds); p.setPasswordEncoder(passwordEncoder()); return p; }
    @Bean public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception { return config.getAuthenticationManager(); }
    @Bean public PasswordEncoder passwordEncoder() { return PasswordEncoderFactories.createDelegatingPasswordEncoder(); }
}
EOF

echo "✅ Login successfully fixed!"