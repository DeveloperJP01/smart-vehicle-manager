package com.vehicle.service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.vehicle.service.model.Vehicle;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByLicensePlate(String licensePlate);
}
