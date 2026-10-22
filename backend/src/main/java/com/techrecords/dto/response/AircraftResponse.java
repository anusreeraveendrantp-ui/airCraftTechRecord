package com.techrecords.dto.response;

import com.techrecords.entity.Aircraft;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AircraftResponse {
    private Long id;
    private String registration;
    private String type;
    private String manufacturer;
    private String serialNo;
    private BigDecimal totalHours;
    private Integer totalCycles;
    private Aircraft.AircraftStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
