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
