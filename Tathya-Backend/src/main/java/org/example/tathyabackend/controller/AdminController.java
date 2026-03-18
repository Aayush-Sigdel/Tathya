package org.example.tathyabackend.controller;

import lombok.AllArgsConstructor;
import org.example.tathyabackend.model.User;
import org.example.tathyabackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    // List all users who uploaded document but not yet verified
    @GetMapping("/kyc/pending")
    public ResponseEntity<List<User>> getPendingKyc() {
        List<User> pending = userRepository.findAllByIsKycVerifiedFalseAndKycDocumentPathIsNotNull();
        return ResponseEntity.ok(pending);
    }


    // Verify or reject KYC for a user
    @PostMapping("/kyc/verify")
    public ResponseEntity<String> verifyKyc(
            @RequestParam Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setKycVerified(true);
        userRepository.save(user);

        return ResponseEntity.ok("KYC updated for user " + userId + " to verified=" + true);
    }
}
