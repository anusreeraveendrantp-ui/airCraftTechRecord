package com.techrecords.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "ad_compliance")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdCompliance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ad_id", nullable = false)
    private AirworthinessDirective ad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplianceStatus status;

    @Column(name = "complied_date")
    private LocalDate compliedDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum ComplianceStatus {
        NOT_APPLICABLE, PENDING, COMPLIED, OVERDUE
    }
}
