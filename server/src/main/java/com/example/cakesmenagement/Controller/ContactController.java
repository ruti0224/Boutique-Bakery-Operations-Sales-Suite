package com.example.cakesmenagement.Controller;

import com.example.cakesmenagement.Dto.ContactRequest;
import com.example.cakesmenagement.Service.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping
    public String sendMessage(@Valid @RequestBody ContactRequest request) {
        contactService.sendContactMessage(request);
        return "ההודעה נשלחה בהצלחה! ניצור איתך קשר בהקדם.";
    }
}