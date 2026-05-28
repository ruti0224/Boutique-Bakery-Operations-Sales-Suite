package com.example.cakesmenagement.Controller;

import com.example.cakesmenagement.Dto.RegisterRequest;
import com.example.cakesmenagement.Entities.Users;
import com.example.cakesmenagement.Service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private ClientService clientService;

    // 🔹 הרשמה - קורא לסרוויס בצורה נקייה
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) { // שמנו פה את ה-DTO

            Users registeredUser = clientService.register(request);
            return ResponseEntity.ok("נרשמת בהצלחה!");

    }
    @PostMapping("/login")
    public ResponseEntity<?> login( @RequestBody Users loginRequest) {
            String token = clientService.loginAndGetToken(loginRequest.getEmail(), loginRequest.getPassword());
            return ResponseEntity.ok(token);
    }
}