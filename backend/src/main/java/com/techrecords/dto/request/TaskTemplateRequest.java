package com.techrecords.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TaskTemplateRequest {

    @NotBlank
    private String title;

    private String description;
    private Integer intervalHours;
    private Integer intervalCycles;
    private Integer intervalDays;
    private String appliesToType;
}
