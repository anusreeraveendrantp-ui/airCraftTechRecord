package com.techrecords.audit;

import java.lang.annotation.*;

/**
 * Mark a service method to trigger audit logging via AuditAspect.
 *
 * Example:
 *   {@code @Auditable(entity = "Aircraft", action = "CREATE")}
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Auditable {
    String entity();
    String action();
}
