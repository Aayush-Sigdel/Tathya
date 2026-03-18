package org.example.tathyabackend.repository;

import org.example.tathyabackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
  User findByEmail(String email);

    boolean existsByEmail(String attr0);

  List<User> findAllByIsKycVerifiedFalseAndKycDocumentPathIsNotNull();

    long getUserByEmail(String email);
}