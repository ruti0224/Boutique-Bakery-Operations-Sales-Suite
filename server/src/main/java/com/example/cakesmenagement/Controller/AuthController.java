package com.example.cakesmenagement.Controller;

import com.example.cakesmenagement.Dto.AuthResponse;
import com.example.cakesmenagement.Dto.LoginRequest;
import com.example.cakesmenagement.Dto.RegisterRequest;
import com.example.cakesmenagement.Entities.Users;
import com.example.cakesmenagement.Service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private ClientService clientService;

    // 🔹 הרשמה - קורא לסרוויס בצורה נקייה
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

            Users registeredUser = clientService.register(request);
            return ResponseEntity.ok("נרשמת בהצלחה!");

    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        String token = clientService.loginAndGetToken(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(token));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        clientService.generateResetToken(request.get("email"));
        return ResponseEntity.ok("אם המייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        clientService.resetPassword(request.get("token"), request.get("newPassword"));
        return ResponseEntity.ok("הסיסמה שונתה בהצלחה. כעת תוכל להתחבר.");
    }
}