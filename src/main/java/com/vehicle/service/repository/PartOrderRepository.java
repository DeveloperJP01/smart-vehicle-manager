package com.vehicle.service.repository;
import com.vehicle.service.model.PartOrder;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PartOrderRepository extends JpaRepository<PartOrder, Long> {}
