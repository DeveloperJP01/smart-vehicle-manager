package com.vehicle.service.security;

import com.vehicle.service.model.User;
import com.vehicle.service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Fetch the user directly from the MySQL database
        User dbUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Pass the real database credentials to Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(dbUser.getUsername())
                .password(dbUser.getPassword())
                .roles(dbUser.getRole() != null ? dbUser.getRole().trim().toUpperCase() : "EMPLOYEE") 
                .build();
    }
}