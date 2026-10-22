package com.techrecords.repository;

import com.techrecords.entity.TaskTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, Long> {

    /**
     * Returns templates that apply to a given aircraft type, plus global templates
     * (where applies_to_type is null).
     */
    @Query("SELECT t FROM TaskTemplate t WHERE t.appliesToType IS NULL OR t.appliesToType = :type")
    List<TaskTemplate> findApplicableTo(@Param("type") String aircraftType);
}
