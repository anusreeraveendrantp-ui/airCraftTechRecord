package com.techrecords.dto.request;

import com.techrecords.entity.Aircraft;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class AircraftRequest {

    @NotBlank
    @Size(max = 20)
    private String registration;

    @NotBlank
    private String type;

    private String manufacturer;
    private String serialNo;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal totalHours;

    @NotNull
    @Min(0)
    private Integer totalCycles;

    @NotNull
    private Aircraft.AircraftStatus status;
}
