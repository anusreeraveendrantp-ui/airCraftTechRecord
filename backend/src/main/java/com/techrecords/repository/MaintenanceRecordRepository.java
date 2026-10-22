package com.techrecords.repository;

import com.techrecords.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {

    List<MaintenanceRecord> findByAircraftIdOrderByPerformedDateDesc(Long aircraftId);

    /** Most recent record for a given aircraft + task template combination */
    Optional<MaintenanceRecord> findTopByAircraftIdAndTemplateIdOrderByPerformedDateDesc(
            Long aircraftId, Long templateId);
}
