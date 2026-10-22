package com.techrecords.controller;

import com.techrecords.dto.request.MaintenanceRecordRequest;
import com.techrecords.dto.request.TaskTemplateRequest;
import com.techrecords.dto.response.DueItemResponse;
import com.techrecords.entity.MaintenanceRecord;
import com.techrecords.entity.TaskTemplate;
import com.techrecords.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    // --- Task Templates ---

    @GetMapping("/api/task-templates")
    public ResponseEntity<List<TaskTemplate>> listTemplates() {
        return ResponseEntity.ok(maintenanceService.findAllTemplates());
    }

    @PostMapping("/api/task-templates")
    public ResponseEntity<TaskTemplate> createTemplate(@Valid @RequestBody TaskTemplateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(maintenanceService.createTemplate(request));
    }

    // --- Maintenance Records ---

    @GetMapping("/api/aircraft/{aircraftId}/maintenance-records")
    public ResponseEntity<List<MaintenanceRecord>> listRecords(@PathVariable Long aircraftId) {
        return ResponseEntity.ok(maintenanceService.findRecordsByAircraft(aircraftId));
    }

    @PostMapping("/api/aircraft/{aircraftId}/maintenance-records")
    public ResponseEntity<MaintenanceRecord> createRecord(
            @PathVariable Long aircraftId,
            @Valid @RequestBody MaintenanceRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(maintenanceService.createRecord(aircraftId, request));
    }

    // --- Due List ---

    @GetMapping("/api/aircraft/{aircraftId}/due-list")
    public ResponseEntity<List<DueItemResponse>> dueList(@PathVariable Long aircraftId) {
        return ResponseEntity.ok(maintenanceService.getDueList(aircraftId));
    }
}
