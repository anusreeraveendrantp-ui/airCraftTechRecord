package com.techrecords.service;

import com.techrecords.dto.response.DueItemResponse;
import com.techrecords.entity.Aircraft;
import com.techrecords.entity.MaintenanceRecord;
import com.techrecords.entity.TaskTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static com.techrecords.dto.response.DueItemResponse.DueStatus.*;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for DueCalculationService.
 *
 * These tests exercise the core due-date business logic without a database.
 * They are the most important tests in the project and should be highlighted
 * to any technical reviewer.
 */
@ExtendWith(MockitoExtension.class)
class DueCalculationServiceTest {

    @Mock
    private com.techrecords.repository.TaskTemplateRepository taskTemplateRepository;

    @Mock
    private com.techrecords.repository.MaintenanceRecordRepository maintenanceRecordRepository;

    @InjectMocks
    private DueCalculationService service;

    private Aircraft aircraft;

    @BeforeEach
    void setUp() {
        aircraft = Aircraft.builder()
                .id(1L)
                .registration("VT-TEST")
                .type("Cessna 172")
                .totalHours(new BigDecimal("2340.5"))
                .totalCycles(1872)
                .status(Aircraft.AircraftStatus.ACTIVE)
                .build();
    }

    // =========================================================================
    // Hour-based limit tests
    // =========================================================================

    @Nested
    @DisplayName("Hour-based limit")
    class HourLimit {

        @Test
        @DisplayName("OK when remaining hours > 10% threshold")
        void ok_whenMoreThanThresholdHoursRemaining() {
            TaskTemplate template = hourTemplate(100);
            // last at 2290 h → next due at 2390 h, current 2340.5 → 49.5 h remaining (>10 threshold)
            MaintenanceRecord record = recordAt(new BigDecimal("2290.0"), 0, LocalDate.now().minusDays(10));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(OK);
        }

        @Test
        @DisplayName("DUE_SOON when remaining hours ≤ 10% of interval")
        void dueSoon_whenWithinThresholdHours() {
            TaskTemplate template = hourTemplate(100);
            // last at 2250 h → next due 2350, current 2340.5 → 9.5 h remaining (≤10 = 10% of 100)
            MaintenanceRecord record = recordAt(new BigDecimal("2250.0"), 0, LocalDate.now().minusDays(20));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(DUE_SOON);
        }

        @Test
        @DisplayName("OVERDUE when current hours ≥ next due hours")
        void overdue_whenHoursExceeded() {
            TaskTemplate template = hourTemplate(100);
            // last at 2230 h → next due 2330, current 2340.5 → OVERDUE
            MaintenanceRecord record = recordAt(new BigDecimal("2230.0"), 0, LocalDate.now().minusDays(40));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(OVERDUE);
        }

        @Test
        @DisplayName("OVERDUE when exactly at the due hour")
        void overdue_whenExactlyAtDueHour() {
            TaskTemplate template = hourTemplate(100);
            // last at 2240.5 → next due exactly at current 2340.5
            MaintenanceRecord record = recordAt(new BigDecimal("2240.5"), 0, LocalDate.now().minusDays(10));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(OVERDUE);
        }
    }

    // =========================================================================
    // Calendar-based limit tests
    // =========================================================================

    @Nested
    @DisplayName("Calendar-based limit")
    class CalendarLimit {

        @Test
        @DisplayName("OK when more than threshold days remaining")
        void ok_whenMoreThanThresholdDaysRemaining() {
            TaskTemplate template = calendarTemplate(365);
            // last done 200 days ago → next due in 165 days — well past threshold
            MaintenanceRecord record = recordAt(BigDecimal.ZERO, 0, LocalDate.now().minusDays(200));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(OK);
        }

        @Test
        @DisplayName("DUE_SOON when within 30-day calendar threshold")
        void dueSoon_whenWithin30DaysOfAnnualDue() {
            TaskTemplate template = calendarTemplate(365);
            // last done 340 days ago → next due in 25 days (≤30)
            MaintenanceRecord record = recordAt(BigDecimal.ZERO, 0, LocalDate.now().minusDays(340));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(DUE_SOON);
        }

        @Test
        @DisplayName("OVERDUE when past the calendar due date")
        void overdue_whenPastCalendarDueDate() {
            TaskTemplate template = calendarTemplate(365);
            // last done 400 days ago → overdue by 35 days
            MaintenanceRecord record = recordAt(BigDecimal.ZERO, 0, LocalDate.now().minusDays(400));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(OVERDUE);
        }
    }

    // =========================================================================
    // Cycle-based limit tests
    // =========================================================================

    @Nested
    @DisplayName("Cycle-based limit")
    class CycleLimit {

        @Test
        @DisplayName("OK when remaining cycles > 10% threshold")
        void ok_whenMoreThanThresholdCyclesRemaining() {
            TaskTemplate template = cycleTemplate(200);
            // last at 1700 cycles → next due 1900, current 1872 → 28 remaining (>20 threshold)
            MaintenanceRecord record = recordAt(BigDecimal.ZERO, 1700, LocalDate.now().minusDays(30));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(OK);
        }

        @Test
        @DisplayName("DUE_SOON when remaining cycles ≤ 10% of cycle interval")
        void dueSoon_whenWithinThresholdCycles() {
            TaskTemplate template = cycleTemplate(200);
            // last at 1690 cycles → next due 1890, current 1872 → 18 remaining (≤20 = 10% of 200)
            MaintenanceRecord record = recordAt(BigDecimal.ZERO, 1690, LocalDate.now().minusDays(40));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(DUE_SOON);
        }

        @Test
        @DisplayName("OVERDUE when cycles exceeded")
        void overdue_whenCyclesExceeded() {
            TaskTemplate template = cycleTemplate(200);
            // last at 1600 cycles → next due 1800, current 1872 → OVERDUE
            MaintenanceRecord record = recordAt(BigDecimal.ZERO, 1600, LocalDate.now().minusDays(60));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(OVERDUE);
        }
    }

    // =========================================================================
    // Compound limit tests ("whichever comes first")
    // =========================================================================

    @Nested
    @DisplayName("Compound limit — whichever comes first")
    class CompoundLimit {

        @Test
        @DisplayName("OVERDUE when calendar limit exceeded even if hours are OK")
        void overdue_whenCalendarExceededButHoursOk() {
            TaskTemplate template = compoundTemplate(100, 365);
            // Hours: last 2200 → next 2300, current 2240 → OK
            // Calendar: last 400 days ago → OVERDUE
            MaintenanceRecord record = recordAt(new BigDecimal("2200.0"), 0, LocalDate.now().minusDays(400));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(OVERDUE);
        }

        @Test
        @DisplayName("OVERDUE when hours exceeded even if calendar is OK")
        void overdue_whenHoursExceededButCalendarOk() {
            TaskTemplate template = compoundTemplate(100, 365);
            // Hours: last 2230 → next 2330, current 2340.5 → OVERDUE
            // Calendar: last 30 days ago → OK
            MaintenanceRecord record = recordAt(new BigDecimal("2230.0"), 0, LocalDate.now().minusDays(30));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(OVERDUE);
        }

        @Test
        @DisplayName("DUE_SOON when one limit is due-soon and the other is OK")
        void dueSoon_whenOneLimitIsDueSoonOtherIsOk() {
            TaskTemplate template = compoundTemplate(100, 365);
            // Hours: last 2251 → next 2351, current 2340.5 → 10.5 h remaining > threshold
            // Calendar: last 340 days ago → next due in 25 days → DUE_SOON
            MaintenanceRecord record = recordAt(new BigDecimal("2251.0"), 0, LocalDate.now().minusDays(340));

            DueItemResponse result = service.computeDueItem(aircraft, template, record);

            assertThat(result.getStatus()).isEqualTo(DUE_SOON);
        }
    }

    // =========================================================================
    // No prior record edge case
    // =========================================================================

    @Nested
    @DisplayName("No prior maintenance record")
    class NoPriorRecord {

        @Test
        @DisplayName("OK when no record exists and interval not exceeded from zero baseline")
        void ok_whenNoRecordAndIntervalNotExceeded() {
            // Aircraft at 50 hours, 100-hr interval → should be OK (next due at 100)
            aircraft.setTotalHours(new BigDecimal("50.0"));
            aircraft.setTotalCycles(40);
            TaskTemplate template = hourTemplate(100);

            DueItemResponse result = service.computeDueItem(aircraft, template, null);

            assertThat(result.getStatus()).isEqualTo(OK);
        }

        @Test
        @DisplayName("OVERDUE when no record exists and aircraft has exceeded the interval")
        void overdue_whenNoRecordAndHoursExceedInterval() {
            TaskTemplate template = hourTemplate(100);
            // Aircraft at 2340.5 h, no record — baseline is zero → next due at 100 → OVERDUE

            DueItemResponse result = service.computeDueItem(aircraft, template, null);

            assertThat(result.getStatus()).isEqualTo(OVERDUE);
        }
    }

    // =========================================================================
    // Response field assertions
    // =========================================================================

    @Test
    @DisplayName("Response includes correct next due hours and template info")
    void responseFields_areCorrect() {
        TaskTemplate template = hourTemplate(100);
        template.setId(42L);
        template.setTitle("100-Hour Inspection");

        MaintenanceRecord record = recordAt(new BigDecimal("2300.0"), 1850, LocalDate.now().minusDays(5));
        record.setHoursAtCompletion(new BigDecimal("2300.0"));

        DueItemResponse result = service.computeDueItem(aircraft, template, record);

        assertThat(result.getTemplateId()).isEqualTo(42L);
        assertThat(result.getTemplateTitle()).isEqualTo("100-Hour Inspection");
        assertThat(result.getNextDueHours()).isEqualByComparingTo("2400.0");
        assertThat(result.getLastCompletedHours()).isEqualByComparingTo("2300.0");
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private TaskTemplate hourTemplate(int intervalHours) {
        TaskTemplate t = new TaskTemplate();
        t.setId(1L);
        t.setTitle("Test Hour Template");
        t.setIntervalHours(intervalHours);
        return t;
    }

    private TaskTemplate calendarTemplate(int intervalDays) {
        TaskTemplate t = new TaskTemplate();
        t.setId(2L);
        t.setTitle("Test Calendar Template");
        t.setIntervalDays(intervalDays);
        return t;
    }

    private TaskTemplate cycleTemplate(int intervalCycles) {
        TaskTemplate t = new TaskTemplate();
        t.setId(3L);
        t.setTitle("Test Cycle Template");
        t.setIntervalCycles(intervalCycles);
        return t;
    }

    private TaskTemplate compoundTemplate(int intervalHours, int intervalDays) {
        TaskTemplate t = new TaskTemplate();
        t.setId(4L);
        t.setTitle("Test Compound Template");
        t.setIntervalHours(intervalHours);
        t.setIntervalDays(intervalDays);
        return t;
    }

    private MaintenanceRecord recordAt(BigDecimal hours, int cycles, LocalDate date) {
        MaintenanceRecord r = new MaintenanceRecord();
        r.setHoursAtCompletion(hours);
        r.setCyclesAtCompletion(cycles);
        r.setPerformedDate(date);
        return r;
    }
}
