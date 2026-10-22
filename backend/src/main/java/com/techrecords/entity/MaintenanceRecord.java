package com.techrecords.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_records")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    /** Nullable — record may apply to airframe, not a specific component */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id")
    private Component component;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private TaskTemplate template;

    @Column(name = "performed_date", nullable = false)
    private LocalDate performedDate;

    @Column(name = "hours_at_completion", precision = 10, scale = 1, nullable = false)
    private BigDecimal hoursAtCompletion;

    @Column(name = "cycles_at_completion", nullable = false)
    private Integer cyclesAtCompletion;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "certified_by")
    private String certifiedBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
