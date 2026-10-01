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
