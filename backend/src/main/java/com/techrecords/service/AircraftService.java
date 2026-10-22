package com.techrecords.service;

import com.techrecords.dto.request.AircraftRequest;
import com.techrecords.dto.response.AircraftResponse;
import com.techrecords.entity.Aircraft;
import com.techrecords.exception.ConflictException;
import com.techrecords.exception.ResourceNotFoundException;
import com.techrecords.repository.AircraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AircraftService {

    private final AircraftRepository aircraftRepository;

    public List<AircraftResponse> findAll() {
        return aircraftRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public AircraftResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public AircraftResponse create(AircraftRequest request) {
        if (aircraftRepository.existsByRegistration(request.getRegistration())) {
            throw new ConflictException("Registration already exists: " + request.getRegistration());
        }
        Aircraft aircraft = Aircraft.builder()
                .registration(request.getRegistration())
                .type(request.getType())
                .manufacturer(request.getManufacturer())
                .serialNo(request.getSerialNo())
                .totalHours(request.getTotalHours())
                .totalCycles(request.getTotalCycles())
                .status(request.getStatus())
                .build();
        return toResponse(aircraftRepository.save(aircraft));
    }

    @Transactional
    public AircraftResponse update(Long id, AircraftRequest request) {
        Aircraft aircraft = getOrThrow(id);

        if (!aircraft.getRegistration().equals(request.getRegistration())
                && aircraftRepository.existsByRegistration(request.getRegistration())) {
            throw new ConflictException("Registration already exists: " + request.getRegistration());
        }

        aircraft.setRegistration(request.getRegistration());
        aircraft.setType(request.getType());
        aircraft.setManufacturer(request.getManufacturer());
        aircraft.setSerialNo(request.getSerialNo());
        aircraft.setTotalHours(request.getTotalHours());
        aircraft.setTotalCycles(request.getTotalCycles());
        aircraft.setStatus(request.getStatus());

        return toResponse(aircraftRepository.save(aircraft));
    }

    @Transactional
    public void delete(Long id) {
        aircraftRepository.delete(getOrThrow(id));
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    public Aircraft getOrThrow(Long id) {
        return aircraftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aircraft not found: " + id));
    }

    private AircraftResponse toResponse(Aircraft a) {
        return AircraftResponse.builder()
                .id(a.getId())
                .registration(a.getRegistration())
                .type(a.getType())
                .manufacturer(a.getManufacturer())
                .serialNo(a.getSerialNo())
                .totalHours(a.getTotalHours())
                .totalCycles(a.getTotalCycles())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
