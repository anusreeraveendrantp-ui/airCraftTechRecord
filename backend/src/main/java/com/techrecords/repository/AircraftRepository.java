package com.techrecords.repository;

import com.techrecords.entity.Aircraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AircraftRepository extends JpaRepository<Aircraft, Long> {
    Optional<Aircraft> findByRegistration(String registration);
    boolean existsByRegistration(String registration);
}
