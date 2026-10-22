package com.techrecords.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "components")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Component {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    @Column(name = "part_number", nullable = false)
    private String partNumber;

    @Column(name = "serial_no")
    private String serialNo;

    @Column(nullable = false)
    private String name;

    /** Hours accumulated since new/overhaul */
    @Column(name = "hours_since_new", precision = 10, scale = 1)
    private BigDecimal hoursSinceNew;

    @Column(name = "cycles_since_new")
    private Integer cyclesSinceNew;

    @Column(name = "installed_date")
    private LocalDate installedDate;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
