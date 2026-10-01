package com.vehicle.service.repository;
import com.vehicle.service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository public interface UserRepository extends JpaRepository<User, Long> {}
