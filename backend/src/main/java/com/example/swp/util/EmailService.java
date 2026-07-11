package com.example.swp.util;

public interface EmailService {
    void sendSimpleMessage(String to, String subject, String text);
}