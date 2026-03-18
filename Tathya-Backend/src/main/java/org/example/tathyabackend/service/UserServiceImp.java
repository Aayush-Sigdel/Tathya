package org.example.tathyabackend.service;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.example.tathyabackend.dtos.UserDto;
import org.example.tathyabackend.dtos.UserRegisterDto;
import org.example.tathyabackend.dtos.VerifyOtpRequest;
import org.example.tathyabackend.exception.UserNotFoundException;
import org.example.tathyabackend.model.PendingUser;
import org.example.tathyabackend.model.User;
import org.example.tathyabackend.repository.PendingUserRepository;
import org.example.tathyabackend.repository.UserRepository;
import org.example.tathyabackend.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


@Service
@AllArgsConstructor
public class UserServiceImp implements UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final PendingUserRepository pendingUserRepository;
    private final MailService mailService;
    private final AuthenticationManager authenticationManager;


    @Transactional
    @Override
    public String registerUser(UserRegisterDto registerRequest) throws MessagingException {
        if (userRepository.existsByEmail(registerRequest.getEmail() )){
            return "email already in use";
        }
        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            return "Passwords do not match";
        }
        if (registerRequest.getPassword().length() < 8 || registerRequest.getPassword().length() > 32) {
            return "Password must be between 8 and 32 characters";
        }

        //  Remove any previous pending signup with the same email (cleanup)
        pendingUserRepository.deleteByEmail(registerRequest.getEmail());

        // Store pending signup in DB
        PendingUser pending = new PendingUser();
        pending.setName(registerRequest.getName());
        pending.setEmail(registerRequest.getEmail());
        pending.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        pending.setDateOfBirth(registerRequest.getDateOfBirth());
        pendingUserRepository.save(pending);

        // ️Send OTP
        mailService.sendOtpEmail(registerRequest.getEmail());
        return "OTP sent. Please verify to complete signup.";
    }

    @Transactional
    @Override
    public String verifyUserAndSave(VerifyOtpRequest request, HttpServletResponse response) {
        if(!mailService.verifyOtp(request)){
            return "verification failed";
        }
        PendingUser pendingUser = pendingUserRepository.findByEmail(request.getEmail());
        if(pendingUser == null) {
            return "No pending user found with this email";
        }else {
            User newUser = new User();
            newUser.setName(pendingUser.getName());
            newUser.setEmail(pendingUser.getEmail());
            newUser.setPassword(pendingUser.getPassword());
            newUser.setDateOfBirth(pendingUser.getDateOfBirth());
            newUser.setEmailVerified(true);
            userRepository.save(newUser);

            pendingUserRepository.deleteByEmail(request.getEmail());
            return jwtUtil.generateToken(newUser.getEmail());
        }
    }



    @Override
    public String login(String email, String password, HttpServletResponse response) {

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            String token = jwtUtil.generateToken(email);

            // set cookie (HttpOnly)
            Cookie cookie = new Cookie("jwt", token);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge((int) (jwtUtil.getJwtExpirationMs() / 1000));
            response.addCookie(cookie);

            return token;
        } catch (BadCredentialsException e) {
            return "Invalid credentials";
        }
    }

    @Override
    public String verifyKycEmail(String email, MultipartFile valid_doc) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User not found with email: " + email);
        }
        user.setKycDocumentPath(valid_doc.getOriginalFilename());
        userRepository.save(user);
        return "KYC verification successful";
    }

    @Override
    public UserDto getBasicUserInfo(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            throw new UserNotFoundException("User not found with id: " + id);
        }
        return new UserDto(user.getId() , user.getName(), user.getEmail(), user.getDateOfBirth());
    }


    @Override
    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    @Override
    public boolean isKycVerified(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User not found with email: " + email);
        }
        return user.isKycVerified();
    }

    @Override
    public long getIdByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User not found with email: " + email);
        }
        return user.getId();
    }
}
