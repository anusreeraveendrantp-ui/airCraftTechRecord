package com.techrecords.dto.request;

import com.techrecords.entity.AdCompliance;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class AdComplianceRequest {

    @NotNull
    private AdCompliance.ComplianceStatus status;

    private LocalDate compliedDate;
    private String remarks;
}
