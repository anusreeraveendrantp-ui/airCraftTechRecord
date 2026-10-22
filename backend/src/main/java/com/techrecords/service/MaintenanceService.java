package com.techrecords.service;

import com.techrecords.dto.request.MaintenanceRecordRequest;
import com.techrecords.dto.request.TaskTemplateRequest;
import com.techrecords.dto.response.DueItemResponse;
import com.techrecords.entity.Aircraft;
import com.techrecords.entity.Component;
import com.techrecords.entity.MaintenanceRecord;
import com.techrecords.entity.TaskTemplate;
import com.techrecords.exception.ResourceNotFoundException;
import com.techrecords.repository.ComponentRepository;
import com.techrecords.repository.MaintenanceRecordRepository;
import com.techrecords.repository.TaskTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final TaskTemplateRepository taskTemplateRepository;
    private final ComponentRepository componentRepository;
    private final AircraftService aircraftService;
    private final DueCalculationService dueCalculationService;

    // --- Task Templates ---

    public List<TaskTemplate> findAllTemplates() {
        return taskTemplateRepository.findAll();
    }

    @Transactional
    public TaskTemplate createTemplate(TaskTemplateRequest request) {
        TaskTemplate template = TaskTemplate.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .intervalHours(request.getIntervalHours())
                .intervalCycles(request.getIntervalCycles())
                .intervalDays(request.getIntervalDays())
                .appliesToType(request.getAppliesToType())
                .build();
        return taskTemplateRepository.save(template);
    }

    // --- Maintenance Records ---

    public List<MaintenanceRecord> findRecordsByAircraft(Long aircraftId) {
        return maintenanceRecordRepository.findByAircraftIdOrderByPerformedDateDesc(aircraftId);
    }

    @Transactional
    public MaintenanceRecord createRecord(Long aircraftId, MaintenanceRecordRequest request) {
        Aircraft aircraft = aircraftService.getOrThrow(aircraftId);

        TaskTemplate template = taskTemplateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new ResourceNotFoundException("Task template not found: " + request.getTemplateId()));

        Component component = null;
        if (request.getComponentId() != null) {
            component = componentRepository.findById(request.getComponentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Component not found: " + request.getComponentId()));
        }

        MaintenanceRecord record = MaintenanceRecord.builder()
                .aircraft(aircraft)
                .component(component)
                .template(template)
                .performedDate(request.getPerformedDate())
                .hoursAtCompletion(request.getHoursAtCompletion())
                .cyclesAtCompletion(request.getCyclesAtCompletion())
                .performedBy(request.getPerformedBy())
                .remarks(request.getRemarks())
                .certifiedBy(request.getCertifiedBy())
                .build();

        return maintenanceRecordRepository.save(record);
    }

    // --- Due List ---

    public List<DueItemResponse> getDueList(Long aircraftId) {
        Aircraft aircraft = aircraftService.getOrThrow(aircraftId);
        return dueCalculationService.calculateDueList(aircraft);
    }
}
