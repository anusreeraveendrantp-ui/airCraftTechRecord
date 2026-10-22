package com.techrecords.controller;

import com.techrecords.dto.request.FlightLogRequest;
import com.techrecords.entity.FlightLog;
import com.techrecords.service.FlightLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aircraft/{aircraftId}/flight-logs")
@RequiredArgsConstructor
public class FlightLogController {

    private final FlightLogService flightLogService;

    @GetMapping
    public ResponseEntity<List<FlightLog>> list(@PathVariable Long aircraftId) {
        return ResponseEntity.ok(flightLogService.findByAircraft(aircraftId));
    }

    @PostMapping
    public ResponseEntity<FlightLog> log(
            @PathVariable Long aircraftId,
            @Valid @RequestBody FlightLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(flightLogService.logFlight(aircraftId, request));
    }
}
