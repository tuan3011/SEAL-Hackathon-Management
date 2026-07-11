package com.example.swp.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender emailSender;

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {

        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom("noreply@hackathon.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            emailSender.send(message);

            log.info("Email sent successfully to: {}", to);

        } catch (Exception e) {

            log.error(
                    "Email sending failed, using mock log instead. Error: {}",
                    e.getMessage());

            log.info("\n====================================================");
            log.info("[MOCK EMAIL] To      : {}", to);
            log.info("[MOCK EMAIL] Subject : {}", subject);
            log.info("[MOCK EMAIL] Body    : {}", text);
            log.info("====================================================\n");
        }
    }
}