package org.example.tathyabackend.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class UserRegisterDto {
    private String name;
    private String email;
    private String password;
    private String confirmPassword;
    private Date dateOfBirth;
}
