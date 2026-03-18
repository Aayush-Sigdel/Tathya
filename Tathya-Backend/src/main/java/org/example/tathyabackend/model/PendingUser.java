package org.example.tathyabackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "pending_users")
@NoArgsConstructor
public class PendingUser {

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

}