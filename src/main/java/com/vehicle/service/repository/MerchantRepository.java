package com.vehicle.service.repository;
import com.vehicle.service.model.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MerchantRepository extends JpaRepository<Merchant, Long> {}
