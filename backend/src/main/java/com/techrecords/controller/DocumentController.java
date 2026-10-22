package com.techrecords.controller;

import com.techrecords.entity.Document;
import com.techrecords.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/api/aircraft/{aircraftId}/documents")
    public ResponseEntity<List<Document>> list(@PathVariable Long aircraftId) {
        return ResponseEntity.ok(documentService.findByAircraft(aircraftId));
    }

    @PostMapping("/api/documents/upload")
    public ResponseEntity<Document> upload(
            @RequestParam("aircraftId") Long aircraftId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "docType", required = false) String docType,
            @RequestParam(value = "recordId", required = false) Long recordId,
            @AuthenticationPrincipal UserDetails principal) throws IOException {

        Document doc = documentService.upload(aircraftId, file, docType, recordId,
                principal.getUsername());
        return ResponseEntity.ok(doc);
    }

    @GetMapping("/api/documents/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws MalformedURLException {
        Resource resource = documentService.download(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
