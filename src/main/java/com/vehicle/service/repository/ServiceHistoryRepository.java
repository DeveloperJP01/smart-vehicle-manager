package com.vehicle.service.repository;

import com.vehicle.service.model.ServiceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceHistoryRepository extends JpaRepository<ServiceHistory, Long> {
    List<ServiceHistory> findByLicensePlateIgnoreCase(String licensePlate);
}