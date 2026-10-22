package com.techrecords.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techrecords.entity.AuditLog;
import com.techrecords.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Intercepts service write methods and writes an entry to audit_log.
 *
 * Annotate any service method with @Auditable to trigger this aspect,
 * or extend the pointcut expression to catch all service write operations.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @AfterReturning(
            pointcut = "@annotation(auditable)",
            returning = "result")
    public void logAudit(JoinPoint joinPoint, Auditable auditable, Object result) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String actor = auth != null ? auth.getName() : "system";

            AuditLog entry = AuditLog.builder()
                    .entity(auditable.entity())
                    .action(auditable.action())
                    .newValue(safeSerialize(result))
                    .timestamp(Instant.now())
                    .build();

            auditLogRepository.save(entry);
        } catch (Exception e) {
            // Never let audit failures break the main flow
            log.warn("Audit logging failed for {}: {}", joinPoint.getSignature(), e.getMessage());
        }
    }

    private String safeSerialize(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return obj != null ? obj.toString() : null;
        }
    }
}
