package org.example.tathyabackend.service;

import org.example.tathyabackend.model.User;
import org.example.tathyabackend.exception.UserNotFoundException;
import org.example.tathyabackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
public class FileStorageUserService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageUserService.class);

    private final UserRepository userRepository;

    @Value("${file.upload.base-dir}")
    private String baseDir;

    // allowed types and size limit
    private static final List<String> ALLOWED_TYPES = List.of("image/png", "image/jpeg", "application/pdf");
    private static final long MAX_FILE_SIZE = 15L * 1024 * 1024; // 15MB

    public FileStorageUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public String saveKycAndProfile(String email, MultipartFile validDoc) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User not found with email: " + email);
        }

        Path root = Paths.get(System.getProperty("user.dir")).resolve(baseDir);

        try {
            // VALID DOCUMENT (KYC)
            if (validDoc != null && !validDoc.isEmpty()) {
                validateFile(validDoc);

                String docPath = "users/documents/" + Instant.now().getEpochSecond() + "_" + sanitizeFileName(validDoc.getOriginalFilename());
                Path destDoc = root.resolve(docPath);
                Files.createDirectories(destDoc.getParent());
                validDoc.transferTo(destDoc.toFile());

                user.setKycDocumentPath(docPath);
                user.setKycDocUploadedAt(Date.from(Instant.now()));
                user.setKycVerified(false);
            }

            userRepository.save(user);
            return "Upload successful";
        } catch (IOException e) {
            log.error("Failed to store files: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File too large. Max allowed: " + (MAX_FILE_SIZE / (1024*1024)) + "MB");
        }
        String ct = file.getContentType() == null ? "" : file.getContentType();
        if (!ALLOWED_TYPES.contains(ct)) {
            throw new IllegalArgumentException("Unsupported file type: " + ct);
        }
    }

    private String sanitizeFileName(String original) {
        // basic sanitization: remove path separators and trim
        return original.replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
    }
}
