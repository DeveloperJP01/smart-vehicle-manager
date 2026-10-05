package com.vehicle.service.repository;
import com.vehicle.service.model.Mechanic;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MechanicRepository extends JpaRepository<Mechanic, Long> {}
