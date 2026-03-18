package org.example.tathyabackend.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyOtpRequest {

    @NotBlank(message = "email must be provided")
    @Email
    private String email;

    @NotBlank(message = "otp must be provided")
    @Size(min = 6 , max = 6 , message = "OTP should be exact 6 letters")
    private String otp;
}
