#!/bin/bash

# 1. Add the missing Email and Phone methods to the User model
cat << 'EOF' > src/main/java/com/vehicle/service/model/User.java
package com.vehicle.service.model;
import jakarta.persistence.*;
@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String fullName; private String email; private String phone;
    
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; } public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
}
EOF

# 2. Split the repositories into proper public Java files
cat << 'EOF' > src/main/java/com/vehicle/service/repository/UserRepository.java
package com.vehicle.service.repository;
import com.vehicle.service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository public interface UserRepository extends JpaRepository<User, Long> {}
EOF

cat << 'EOF' > src/main/java/com/vehicle/service/repository/VehicleRepository.java
package com.vehicle.service.repository;
import com.vehicle.service.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository public interface VehicleRepository extends JpaRepository<Vehicle, Long> {}
EOF

cat << 'EOF' > src/main/java/com/vehicle/service/repository/MechanicRepository.java
package com.vehicle.service.repository;
import com.vehicle.service.model.Mechanic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository public interface MechanicRepository extends JpaRepository<Mechanic, Long> {}
EOF

cat << 'EOF' > src/main/java/com/vehicle/service/repository/ServiceTicketRepository.java
package com.vehicle.service.repository;
import com.vehicle.service.model.ServiceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, Long> {}
EOF

# 3. Delete the old grouped file
rm src/main/java/com/vehicle/service/repository/Repositories.java

echo "✅ Java files successfully patched!"