package com.techrecords.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "documents")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aircraft_id", nullable = false)
    private Aircraft aircraft;

    /** Optional — links document to a specific maintenance record */
    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "doc_type")
    private String docType;

    /** Relative path within the upload directory */
    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @CreatedDate
    @Column(name = "uploaded_at", updatable = false)
    private Instant uploadedAt;
}
