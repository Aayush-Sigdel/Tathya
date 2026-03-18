package org.example.tathyabackend.controller;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.example.tathyabackend.dtos.LoginRequest;
import org.example.tathyabackend.dtos.UserRegisterDto;
import org.example.tathyabackend.dtos.VerifyOtpRequest;
import org.example.tathyabackend.service.FileStorageUserService;
import org.example.tathyabackend.service.MailService;
import org.example.tathyabackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@AllArgsConstructor
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final MailService mailService;
    private final FileStorageUserService fileStorageUserService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegisterDto userRegisterDto) throws MessagingException {
        String message = userService.registerUser(userRegisterDto);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
    @PostMapping("/register/verify-otp")
    public ResponseEntity<?> verifyOtpAndSaveUser(@RequestBody VerifyOtpRequest verifyOtpRequest, HttpServletResponse response) {
        return ResponseEntity.ok(userService.verifyUserAndSave(verifyOtpRequest, response));
    }

    @PostMapping("/register/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String email) throws MessagingException {
         mailService.resendOtp(email);
         return new ResponseEntity<>("OTP resent successfully", HttpStatus.OK);
    }

    @GetMapping("/getIdByEmail")
    public ResponseEntity<?> getIdByEmail(@RequestParam String email){
        long id = userService.getIdByEmail(email);
        return new ResponseEntity<>(id, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {

        System.out.println("Login attempt for email: " + loginRequest.getEmail());
        System.out.println("Password provided: " + loginRequest.getPassword());

        String result = userService.login(loginRequest.getEmail(), loginRequest.getPassword(), response);

        // Check if the result is an error message
        if ("Invalid credentials".equals(result)) {
            return new ResponseEntity<>(result, HttpStatus.UNAUTHORIZED); // 401
        }

        // If not an error, it's a valid token
        return new ResponseEntity<>(result, HttpStatus.OK); // 200
    }

    @PostMapping("/verify-kyc")
    public ResponseEntity<?> verifyKycEmail(
            @RequestParam String email,
            @RequestParam(value = "valid_doc", required = false) MultipartFile validDoc
    ) {
        String message = fileStorageUserService.saveKycAndProfile(email, validDoc);
        return ResponseEntity.ok().body(message);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        userService.logout(response);
        return ResponseEntity.ok().body("Logged out");
    }

    @GetMapping("/is-kyc-verified")
    public ResponseEntity<?> isKycVerified(@RequestParam String email) {
        boolean isVerified = userService.isKycVerified(email);
        return ResponseEntity.ok().body(isVerified);
    }

}
