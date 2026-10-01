#!/bin/bash

# 1. Modify application.properties to drop and recreate tables on every restart (clears old data)
cat << 'EOF' > src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/vehicle_service_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root123
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
EOF

# 2. Empty out the DataSeeder so no demo cars are ever injected again
cat << 'EOF' > src/main/java/com/vehicle/service/DataSeeder.java
package com.vehicle.service;
import org.springframework.boot.CommandLineRunner; import org.springframework.stereotype.Component;
@Component
public class DataSeeder implements CommandLineRunner {
    @Override
    public void run(String... args) {
        // Database starts completely clean with zero demo records
    }
}
EOF

echo "✅ Clean slate configured!"