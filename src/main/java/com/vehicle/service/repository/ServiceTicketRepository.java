package com.vehicle.service.repository;
import com.vehicle.service.model.ServiceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, Long> {

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE ServiceTicket t SET t.assignedMechanic = null WHERE t.assignedMechanic.id = :userId")
    void unassignMechanic(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE ServiceTicket t SET t.customer = null WHERE t.customer.id = :userId")
    void unassignCustomer(@Param("userId") Long userId);
}

