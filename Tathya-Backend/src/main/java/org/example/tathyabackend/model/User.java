package org.example.tathyabackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "users")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(nullable = false , name = "display_name")
    private String name;

    @Column(unique = true , name = "email")
    private String email;

    @Column(nullable = false , name = "password")
    private String password;

    @Column(nullable = false , name = "date_of_birth")
    private Date dateOfBirth;

    @Column(nullable = false , name = "isemail_verified")
    private boolean isEmailVerified;

    @Column(name = "kyc_document_path")
    private String kycDocumentPath;

    @Column(name = "kyc_doc_uploaded_at")
    private Date kycDocUploadedAt;

    @Column(nullable = false , name = "iskyc_verified")
    private boolean isKycVerified;

}