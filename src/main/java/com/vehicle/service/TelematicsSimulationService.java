package com.vehicle.service;

import com.vehicle.service.model.Vehicle;
import com.vehicle.service.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class TelematicsSimulationService {

    @Autowired
    private VehicleRepository vehicleRepository;

    private final Random random = new Random();

    // Strategy 2: Predictive Mileage Estimation
    // Runs every 10 seconds to visually simulate a car driving over a month
    @Scheduled(fixedRate = 10000)
    public void simulatePredictiveMileage() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        for (Vehicle v : vehicles) {
            // For Strategy 2 (Predictive), we pretend we've calculated their daily average is ~50km.
            // To make the demonstration visible in real-time, we add 1 to 3 km every 10 seconds.
            int increment = random.nextInt(3) + 1;
            
            // Only simulate if the car has some initial odometer reading (e.g. not a completely blank new entry)
            if (v.getCurrentOdometer() != null && v.getCurrentOdometer() > 0) {
                v.setCurrentOdometer(v.getCurrentOdometer() + increment);
                vehicleRepository.save(v);
            }
        }
    }
}
