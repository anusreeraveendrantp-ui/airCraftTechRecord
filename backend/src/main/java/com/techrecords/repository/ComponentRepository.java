package com.techrecords.repository;

import com.techrecords.entity.Component;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComponentRepository extends JpaRepository<Component, Long> {
    List<Component> findByAircraftId(Long aircraftId);
}
