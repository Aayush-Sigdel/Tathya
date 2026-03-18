package org.example.tathyabackend.repository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.example.tathyabackend.model.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {
    PendingUser findByEmail(@NotBlank(message = "email must be provided") @Email String email);

    void deleteByEmail(String email);
}