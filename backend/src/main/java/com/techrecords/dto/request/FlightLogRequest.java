package com.techrecords.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
public class FlightLogRequest {

    @NotNull
    private LocalDate flightDate;

    @NotNull
    @DecimalMin("0.1")
    private BigDecimal hoursFlown;

    @NotNull
    @Min(0)
    private Integer cycles;

    private String pilotName;

    @Size(max = 4)
    private String departureIcao;

    @Size(max = 4)
    private String arrivalIcao;
}
