package com.techrecords.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "airworthiness_directives")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AirworthinessDirective {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ad_number", nullable = false, unique = true)
    private String adNumber;

    @Column(nullable = false)
    private String title;

    @Column(name = "applies_to_type")
    private String appliesToType;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "compliance_deadline")
    private LocalDate complianceDeadline;

    @Column(name = "is_recurring", nullable = false)
    private boolean recurring;

    @Column(columnDefinition = "TEXT")
    private String description;
}
