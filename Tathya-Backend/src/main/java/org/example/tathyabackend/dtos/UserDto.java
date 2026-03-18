package org.example.tathyabackend.dtos;

import lombok.Data;

import java.util.Date;

@Data
public class UserDto {
    private long id;
    private String name;
    private String email;
    private Date dateOfBirth;

    public UserDto(Long id, String name, String email, Date dateOfBirth){
        this.id = id;
        this.name = name;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
    }
}
