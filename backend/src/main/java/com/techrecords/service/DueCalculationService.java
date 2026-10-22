package com.techrecords.service;

import com.techrecords.dto.response.DueItemResponse;
import com.techrecords.entity.Aircraft;
import com.techrecords.entity.MaintenanceRecord;
import com.techrecords.entity.TaskTemplate;
import com.techrecords.repository.MaintenanceRecordRepository;
import com.techrecords.repository.TaskTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Core business logic for due-date calculations.
 *
 * For each applicable task template the service computes:
 *   nextDueHours  = lastHours  + intervalHours
 *   nextDueCycles = lastCycles + intervalCycles
 *   nextDueDate   = lastDate   + intervalDays
 *
 * The task is due at whichever limit is reached first.
 *
 * Status rules:
 *   OVERDUE   – any limit has already been exceeded
 *   DUE_SOON  – within 10 % of the interval (or 30 days for calendar)
 *   OK        – otherwise
 */
@Service
@RequiredArgsConstructor
public class DueCalculationService {

    /** Calendar threshold used when no interval_days exists */
    static final int CALENDAR_THRESHOLD_DAYS = 30;

    private final TaskTemplateRepository taskTemplateRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    public List<DueItemResponse> calculateDueList(Aircraft aircraft) {
        List<TaskTemplate> templates = taskTemplateRepository.findApplicableTo(aircraft.getType());
        List<DueItemResponse> results = new ArrayList<>();

        for (TaskTemplate template : templates) {
            Optional<MaintenanceRecord> lastRecord =
                    maintenanceRecordRepository.findTopByAircraftIdAndTemplateIdOrderByPerformedDateDesc(
                            aircraft.getId(), template.getId());

            DueItemResponse item = computeDueItem(aircraft, template, lastRecord.orElse(null));
            results.add(item);
        }

        // Sort: OVERDUE first, then DUE_SOON, then OK
        results.sort((a, b) -> a.getStatus().compareTo(b.getStatus()));
        return results;
    }

    // -------------------------------------------------------------------------
    // Core calculation — package-visible so JUnit can test it directly
    // -------------------------------------------------------------------------

    DueItemResponse computeDueItem(Aircraft aircraft, TaskTemplate template, MaintenanceRecord lastRecord) {

        LocalDate today = LocalDate.now();
        BigDecimal currentHours = aircraft.getTotalHours();
        int currentCycles = aircraft.getTotalCycles();

        // Defaults when no record exists: treat as if task was done at zero
        BigDecimal lastHours = BigDecimal.ZERO;
        int lastCycles = 0;
        LocalDate lastDate = today.minusDays(0); // conservative: start counting now

        if (lastRecord != null) {
            lastHours = lastRecord.getHoursAtCompletion();
            lastCycles = lastRecord.getCyclesAtCompletion();
            lastDate = lastRecord.getPerformedDate();
        }

        // Compute individual due points
        BigDecimal nextDueHours = template.getIntervalHours() != null
                ? lastHours.add(BigDecimal.valueOf(template.getIntervalHours()))
                : null;

        Integer nextDueCycles = template.getIntervalCycles() != null
                ? lastCycles + template.getIntervalCycles()
                : null;

        LocalDate nextDueDate = template.getIntervalDays() != null
                ? lastDate.plusDays(template.getIntervalDays())
                : null;

        // Determine status
        DueItemResponse.DueStatus status = evaluateStatus(
                currentHours, currentCycles, today,
                nextDueHours, nextDueCycles, nextDueDate,
                template);

        return DueItemResponse.builder()
                .templateId(template.getId())
                .templateTitle(template.getTitle())
                .lastCompletedDate(lastRecord != null ? lastRecord.getPerformedDate() : null)
                .lastCompletedHours(lastRecord != null ? lastRecord.getHoursAtCompletion() : null)
                .nextDueHours(nextDueHours)
                .nextDueCycles(nextDueCycles)
                .nextDueDate(nextDueDate)
                .status(status)
                .build();
    }

    /**
     * Evaluates the overall due status by checking each active limit.
     * Any single limit being overdue or due-soon escalates the status.
     */
    DueItemResponse.DueStatus evaluateStatus(
            BigDecimal currentHours,
            int currentCycles,
            LocalDate today,
            BigDecimal nextDueHours,
            Integer nextDueCycles,
            LocalDate nextDueDate,
            TaskTemplate template) {

        boolean overdue = false;
        boolean dueSoon = false;

        // --- Hour limit ---
        if (nextDueHours != null) {
            int cmp = currentHours.compareTo(nextDueHours);
            if (cmp >= 0) {
                overdue = true;
            } else if (template.getIntervalHours() != null) {
                double remaining = nextDueHours.subtract(currentHours).doubleValue();
                double threshold = template.getIntervalHours() * 0.10;
                if (remaining <= threshold) {
                    dueSoon = true;
                }
            }
        }

        // --- Cycle limit ---
        if (nextDueCycles != null) {
            if (currentCycles >= nextDueCycles) {
                overdue = true;
            } else if (template.getIntervalCycles() != null) {
                int remaining = nextDueCycles - currentCycles;
                int threshold = (int) Math.ceil(template.getIntervalCycles() * 0.10);
                if (remaining <= threshold) {
                    dueSoon = true;
                }
            }
        }

        // --- Calendar limit ---
        if (nextDueDate != null) {
            if (!today.isBefore(nextDueDate)) {
                overdue = true;
            } else {
                long daysRemaining = today.until(nextDueDate, java.time.temporal.ChronoUnit.DAYS);
                long threshold = template.getIntervalDays() != null
                        ? Math.min((long) (template.getIntervalDays() * 0.10), CALENDAR_THRESHOLD_DAYS)
                        : CALENDAR_THRESHOLD_DAYS;
                if (daysRemaining <= threshold) {
                    dueSoon = true;
                }
            }
        }

        if (overdue) return DueItemResponse.DueStatus.OVERDUE;
        if (dueSoon)  return DueItemResponse.DueStatus.DUE_SOON;
        return DueItemResponse.DueStatus.OK;
    }
}
