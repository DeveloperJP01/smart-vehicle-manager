package com.vehicle.service.repository;

import com.vehicle.service.model.GateScanLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GateScanLogRepository extends JpaRepository<GateScanLog, Long> {
    List<GateScanLog> findAllByOrderByIdDesc();
}