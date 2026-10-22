package com.techrecords.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "flight_logs")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FlightLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    @Column(name = "flight_date", nullable = false)
    private LocalDate flightDate;

    @Column(name = "hours_flown", precision = 5, scale = 1, nullable = false)
    private BigDecimal hoursFlown;

    /** Number of landings (cycles) on this flight */
    @Column(nullable = false)
    private Integer cycles;

    @Column(name = "pilot_name")
    private String pilotName;

    @Column(name = "departure_icao", length = 4)
    private String departureIcao;

    @Column(name = "arrival_icao", length = 4)
    private String arrivalIcao;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
