package com.example.cakesmenagement.Service;

import com.example.cakesmenagement.Dto.ContactRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class ContactService {

    @Autowired
    private EmailService emailService;
    @Autowired
    private RateLimitingService rateLimitingService;

    private static final String ADMIN_EMAIL = "sweets.bakery.info@gmail.com";

    public void sendContactMessage(ContactRequest request) {
        rateLimitingService.checkRateLimit(); // אותה הגנה שקיימת כבר על addOrder

        String safeName = HtmlUtils.htmlEscape(request.getName());
        String safeMessage = HtmlUtils.htmlEscape(request.getMessage());

        String content = emailService.buildContactEmail(safeName, request.getEmail(), safeMessage);
        emailService.sendEmail(ADMIN_EMAIL, "פנייה חדשה מהאתר מ-" + safeName, content);
    }
}