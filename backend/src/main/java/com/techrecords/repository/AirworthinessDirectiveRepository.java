package com.techrecords.repository;

import com.techrecords.entity.AirworthinessDirective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AirworthinessDirectiveRepository extends JpaRepository<AirworthinessDirective, Long> {

    @Query("SELECT a FROM AirworthinessDirective a WHERE a.appliesToType IS NULL OR a.appliesToType = :type")
    List<AirworthinessDirective> findApplicableTo(@Param("type") String aircraftType);
}
