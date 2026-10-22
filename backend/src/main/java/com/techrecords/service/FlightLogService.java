package com.techrecords.service;

import com.techrecords.dto.request.FlightLogRequest;
import com.techrecords.entity.Aircraft;
import com.techrecords.entity.FlightLog;
import com.techrecords.repository.AircraftRepository;
import com.techrecords.repository.FlightLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FlightLogService {

    private final FlightLogRepository flightLogRepository;
    private final AircraftService aircraftService;
    private final AircraftRepository aircraftRepository;

    public List<FlightLog> findByAircraft(Long aircraftId) {
        return flightLogRepository.findByAircraftIdOrderByFlightDateDesc(aircraftId);
    }

    @Transactional
    public FlightLog logFlight(Long aircraftId, FlightLogRequest request) {
        Aircraft aircraft = aircraftService.getOrThrow(aircraftId);

        FlightLog log = FlightLog.builder()
                .aircraft(aircraft)
                .flightDate(request.getFlightDate())
                .hoursFlown(request.getHoursFlown())
                .cycles(request.getCycles())
                .pilotName(request.getPilotName())
                .departureIcao(request.getDepartureIcao())
                .arrivalIcao(request.getArrivalIcao())
                .build();

        // Update cumulative totals on the aircraft
        aircraft.setTotalHours(aircraft.getTotalHours().add(request.getHoursFlown()));
        aircraft.setTotalCycles(aircraft.getTotalCycles() + request.getCycles());
        aircraftRepository.save(aircraft);

        return flightLogRepository.save(log);
    }
}
