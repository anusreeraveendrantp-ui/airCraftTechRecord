package com.techrecords.service;

import com.techrecords.entity.Aircraft;
import com.techrecords.entity.Document;
import com.techrecords.exception.ResourceNotFoundException;
import com.techrecords.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AircraftService aircraftService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public List<Document> findByAircraft(Long aircraftId) {
        return documentRepository.findByAircraftIdOrderByUploadedAtDesc(aircraftId);
    }

    @Transactional
    public Document upload(Long aircraftId, MultipartFile file, String docType,
                           Long recordId, String uploadedBy) throws IOException {
        Aircraft aircraft = aircraftService.getOrThrow(aircraftId);

        // Store file with a UUID-prefixed name to avoid collisions
        String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir, String.valueOf(aircraftId));
        Files.createDirectories(uploadPath);

        Path filePath = uploadPath.resolve(storedName);
        file.transferTo(filePath.toFile());

        Document doc = Document.builder()
                .aircraft(aircraft)
                .recordId(recordId)
                .fileName(file.getOriginalFilename())
                .docType(docType)
                .filePath(Paths.get(String.valueOf(aircraftId), storedName).toString())
                .uploadedBy(uploadedBy)
                .build();

        return documentRepository.save(doc);
    }

    public Resource download(Long documentId) throws MalformedURLException {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));

        Path filePath = Paths.get(uploadDir).resolve(doc.getFilePath()).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new ResourceNotFoundException("File not readable: " + documentId);
        }

        return resource;
    }
}
