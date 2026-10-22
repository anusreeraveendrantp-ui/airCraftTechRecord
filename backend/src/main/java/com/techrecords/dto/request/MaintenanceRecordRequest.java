package com.techrecords.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
public class MaintenanceRecordRequest {

    @NotNull
    private Long templateId;

    private Long componentId;

    @NotNull
    private LocalDate performedDate;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal hoursAtCompletion;

    @NotNull
    @Min(0)
    private Integer cyclesAtCompletion;

    @NotBlank
    private String performedBy;

    private String remarks;
    private String certifiedBy;
}
