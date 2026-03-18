package org.example.tathyabackend.service;

import lombok.AllArgsConstructor;
import org.example.tathyabackend.dtos.VerifyOtpRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@AllArgsConstructor
@Service
public class MailService {
    private final JavaMailSender mailSender;
    private final RedisTemplate<String, String> redisTemplate;

    public String generateOtp(){
        return String.format("%06d", new Random().nextInt(999999));
    }
    public void sendOtpEmail(String email)  {

        //Generate Otp
        String otp = generateOtp();
        //save otp in Redis
        redisTemplate.opsForValue().set(email, otp , 5 , TimeUnit.MINUTES);
        //Send Otp via email to User
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your OTP Code");
        message.setText("Your OTP is: " + otp);
        mailSender.send(message);
    }


    public void resendOtp(String email){
        sendOtpEmail(email);
    }

    public Boolean verifyOtp(VerifyOtpRequest request) {
        String cachedOtp = redisTemplate.opsForValue().get(request.getEmail());
        if(cachedOtp != null && cachedOtp.equals(request.getOtp())){
            redisTemplate.delete(request.getEmail());
            return true;
        }
        return false;
    }
}
