package com.techrecords.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "task_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Recurring interval in flight hours; null = no hour limit */
    @Column(name = "interval_hours")
    private Integer intervalHours;

    /** Recurring interval in cycles; null = no cycle limit */
    @Column(name = "interval_cycles")
    private Integer intervalCycles;

    /** Recurring interval in calendar days; null = no calendar limit */
    @Column(name = "interval_days")
    private Integer intervalDays;

    /** Aircraft type this template applies to; null = all types */
    @Column(name = "applies_to_type")
    private String appliesToType;
}
