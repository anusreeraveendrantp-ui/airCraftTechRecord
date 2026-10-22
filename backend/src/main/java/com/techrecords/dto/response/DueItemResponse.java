package com.techrecords.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DueItemResponse {

    private Long templateId;
    private String templateTitle;
    private LocalDate lastCompletedDate;
    private BigDecimal lastCompletedHours;
    private BigDecimal nextDueHours;
    private Integer nextDueCycles;
    private LocalDate nextDueDate;
    private DueStatus status;

    public enum DueStatus {
        /** A limit has already been exceeded — sort first */
        OVERDUE,
        /** Within 10 % of the interval or 30 days — sort second */
        DUE_SOON,
        /** All limits are comfortably in the future */
        OK
    }
}
