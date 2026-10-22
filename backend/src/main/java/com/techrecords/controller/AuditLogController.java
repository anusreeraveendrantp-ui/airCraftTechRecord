package com.techrecords.controller;

import com.techrecords.entity.AuditLog;
import com.techrecords.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/audit-log")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<Page<AuditLog>> search(
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Instant fromInstant = from != null ? from.atStartOfDay().toInstant(java.time.ZoneOffset.UTC) : null;
        Instant toInstant   = to   != null ? to.plusDays(1).atStartOfDay().toInstant(java.time.ZoneOffset.UTC) : null;

        Page<AuditLog> result = auditLogRepository.search(
                entity, fromInstant, toInstant,
                PageRequest.of(page, size, Sort.by("timestamp").descending()));

        return ResponseEntity.ok(result);
    }
}
