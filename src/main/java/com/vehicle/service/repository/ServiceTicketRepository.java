package com.vehicle.service.repository;
import com.vehicle.service.model.ServiceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, Long> {}
