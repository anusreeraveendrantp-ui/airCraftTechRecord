package com.techrecords.controller;

import com.techrecords.dto.request.AircraftRequest;
import com.techrecords.dto.response.AircraftResponse;
import com.techrecords.service.AircraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aircraft")
@RequiredArgsConstructor
public class AircraftController {

    private final AircraftService aircraftService;

    @GetMapping
    public ResponseEntity<List<AircraftResponse>> list() {
        return ResponseEntity.ok(aircraftService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AircraftResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(aircraftService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AircraftResponse> create(@Valid @RequestBody AircraftRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aircraftService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AircraftResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AircraftRequest request) {
        return ResponseEntity.ok(aircraftService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        aircraftService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
