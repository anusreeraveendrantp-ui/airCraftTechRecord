package com.techrecords.repository;

import com.techrecords.entity.AdCompliance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdComplianceRepository extends JpaRepository<AdCompliance, Long> {
    List<AdCompliance> findByAircraftId(Long aircraftId);
    Optional<AdCompliance> findByAircraftIdAndAdId(Long aircraftId, Long adId);
}
