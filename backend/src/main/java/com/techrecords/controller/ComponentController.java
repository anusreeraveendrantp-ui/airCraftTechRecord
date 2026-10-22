package com.techrecords.controller;

import com.techrecords.entity.Aircraft;
import com.techrecords.entity.Component;
import com.techrecords.exception.ResourceNotFoundException;
import com.techrecords.repository.ComponentRepository;
import com.techrecords.service.AircraftService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ComponentController {

    private final ComponentRepository componentRepository;
    private final AircraftService aircraftService;

    @GetMapping("/api/aircraft/{aircraftId}/components")
    public ResponseEntity<List<Component>> list(@PathVariable Long aircraftId) {
        return ResponseEntity.ok(componentRepository.findByAircraftId(aircraftId));
    }

    @PostMapping("/api/aircraft/{aircraftId}/components")
    public ResponseEntity<Component> create(
            @PathVariable Long aircraftId,
            @Valid @RequestBody ComponentRequest request) {

        Aircraft aircraft = aircraftService.getOrThrow(aircraftId);

        Component component = Component.builder()
                .aircraft(aircraft)
                .partNumber(request.getPartNumber())
                .serialNo(request.getSerialNo())
                .name(request.getName())
                .hoursSinceNew(request.getHoursSinceNew())
                .cyclesSinceNew(request.getCyclesSinceNew())
                .installedDate(request.getInstalledDate())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(componentRepository.save(component));
    }

    @PutMapping("/api/components/{id}")
    public ResponseEntity<Component> update(
            @PathVariable Long id,
            @Valid @RequestBody ComponentRequest request) {

        Component component = componentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Component not found: " + id));

        component.setPartNumber(request.getPartNumber());
        component.setSerialNo(request.getSerialNo());
        component.setName(request.getName());
        component.setHoursSinceNew(request.getHoursSinceNew());
        component.setCyclesSinceNew(request.getCyclesSinceNew());
        component.setInstalledDate(request.getInstalledDate());

        return ResponseEntity.ok(componentRepository.save(component));
    }

    // Inline DTO — kept here since it's only used by this controller
    @Getter @Setter
    public static class ComponentRequest {
        @NotBlank private String partNumber;
        private String serialNo;
        @NotBlank private String name;
        private BigDecimal hoursSinceNew;
        private Integer cyclesSinceNew;
        private LocalDate installedDate;
    }
}
