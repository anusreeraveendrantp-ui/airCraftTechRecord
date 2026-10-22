package com.techrecords.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "aircraft")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ICAO/national registration, e.g. VT-ABC */
    @Column(nullable = false, unique = true, length = 20)
    private String registration;

    @Column(nullable = false)
    private String type;

    private String manufacturer;

    @Column(name = "serial_no")
    private String serialNo;

    /** Cumulative airframe hours */
    @Column(name = "total_hours", precision = 10, scale = 1, nullable = false)
    private BigDecimal totalHours;

    /** Cumulative landings/cycles */
    @Column(name = "total_cycles", nullable = false)
    private Integer totalCycles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AircraftStatus status;

    @OneToMany(mappedBy = "aircraft", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Component> components = new ArrayList<>();

    @OneToMany(mappedBy = "aircraft", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FlightLog> flightLogs = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public enum AircraftStatus {
        ACTIVE, GROUNDED, MAINTENANCE, RETIRED
    }
}
