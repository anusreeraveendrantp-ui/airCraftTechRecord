package com.techrecords.controller;

import com.techrecords.dto.request.AdComplianceRequest;
import com.techrecords.entity.AdCompliance;
import com.techrecords.entity.AirworthinessDirective;
import com.techrecords.exception.ResourceNotFoundException;
import com.techrecords.repository.AdComplianceRepository;
import com.techrecords.repository.AirworthinessDirectiveRepository;
import com.techrecords.service.AircraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AdController {

    private final AirworthinessDirectiveRepository adRepository;
    private final AdComplianceRepository adComplianceRepository;
    private final AircraftService aircraftService;

    // --- Airworthiness Directives ---

    @GetMapping("/api/ads")
    public ResponseEntity<List<AirworthinessDirective>> listAds() {
        return ResponseEntity.ok(adRepository.findAll());
    }

    @PostMapping("/api/ads")
    public ResponseEntity<AirworthinessDirective> createAd(
            @RequestBody AirworthinessDirective ad) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adRepository.save(ad));
    }

    // --- AD Compliance per Aircraft ---

    @GetMapping("/api/aircraft/{aircraftId}/ad-compliance")
    public ResponseEntity<List<AdCompliance>> listCompliance(@PathVariable Long aircraftId) {
        return ResponseEntity.ok(adComplianceRepository.findByAircraftId(aircraftId));
    }

    @PutMapping("/api/aircraft/{aircraftId}/ad-compliance/{adId}")
    public ResponseEntity<AdCompliance> updateCompliance(
            @PathVariable Long aircraftId,
            @PathVariable Long adId,
            @Valid @RequestBody AdComplianceRequest request) {

        // Find existing record or create a new one
        AdCompliance compliance = adComplianceRepository
                .findByAircraftIdAndAdId(aircraftId, adId)
                .orElseGet(() -> {
                    AirworthinessDirective ad = adRepository.findById(adId)
                            .orElseThrow(() -> new ResourceNotFoundException("AD not found: " + adId));
                    return AdCompliance.builder()
                            .aircraft(aircraftService.getOrThrow(aircraftId))
                            .ad(ad)
                            .build();
                });

        compliance.setStatus(request.getStatus());
        compliance.setCompliedDate(request.getCompliedDate());
        compliance.setRemarks(request.getRemarks());

        return ResponseEntity.ok(adComplianceRepository.save(compliance));
    }
}
