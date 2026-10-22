package com.techrecords.controller;

import com.techrecords.dto.response.DueItemResponse;
import com.techrecords.entity.Aircraft;
import com.techrecords.repository.AircraftRepository;
import com.techrecords.service.DueCalculationService;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AircraftRepository aircraftRepository;
    private final DueCalculationService dueCalculationService;

    /**
     * Returns fleet-wide summary: total aircraft counts by status,
     * and total overdue / due-soon task counts across the whole fleet.
     */
    @GetMapping("/summary")
    public ResponseEntity<FleetSummary> summary() {
        List<Aircraft> fleet = aircraftRepository.findAll();

        long active      = fleet.stream().filter(a -> a.getStatus() == Aircraft.AircraftStatus.ACTIVE).count();
        long grounded    = fleet.stream().filter(a -> a.getStatus() == Aircraft.AircraftStatus.GROUNDED).count();
        long maintenance = fleet.stream().filter(a -> a.getStatus() == Aircraft.AircraftStatus.MAINTENANCE).count();

        long overdueCount = 0;
        long dueSoonCount = 0;

        for (Aircraft aircraft : fleet) {
            List<DueItemResponse> dueItems = dueCalculationService.calculateDueList(aircraft);
            overdueCount += dueItems.stream().filter(d -> d.getStatus() == DueItemResponse.DueStatus.OVERDUE).count();
            dueSoonCount += dueItems.stream().filter(d -> d.getStatus() == DueItemResponse.DueStatus.DUE_SOON).count();
        }

        return ResponseEntity.ok(FleetSummary.builder()
                .totalAircraft(fleet.size())
                .active((int) active)
                .grounded((int) grounded)
                .maintenance((int) maintenance)
                .overdueTaskCount((int) overdueCount)
                .dueSoonTaskCount((int) dueSoonCount)
                .build());
    }

    @Getter
    @Builder
    public static class FleetSummary {
        private int totalAircraft;
        private int active;
        private int grounded;
        private int maintenance;
        private int overdueTaskCount;
        private int dueSoonTaskCount;
    }
}
