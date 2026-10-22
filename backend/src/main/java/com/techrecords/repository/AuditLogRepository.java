package com.techrecords.repository;

import com.techrecords.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("""
        SELECT a FROM AuditLog a
        WHERE (:entity IS NULL OR a.entity = :entity)
          AND (:from IS NULL OR a.timestamp >= :from)
          AND (:to IS NULL OR a.timestamp <= :to)
        ORDER BY a.timestamp DESC
        """)
    Page<AuditLog> search(
            @Param("entity") String entity,
            @Param("from") Instant from,
            @Param("to") Instant to,
            Pageable pageable);
}
