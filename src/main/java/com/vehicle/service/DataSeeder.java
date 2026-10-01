package com.vehicle.service;
import org.springframework.boot.CommandLineRunner; import org.springframework.stereotype.Component;
@Component
public class DataSeeder implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // Database starts completely clean with zero demo records
    }
}
