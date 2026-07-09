package com.example.cakesmenagement.Controller;

import com.example.cakesmenagement.Dto.AuthResponse;
import com.example.cakesmenagement.Dto.LoginRequest;
import com.example.cakesmenagement.Dto.RegisterRequest;
import com.example.cakesmenagement.Service.ClientService;
import jakarta.servlet.http.HttpServletRequest;
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

    // 🔹 הרשמה - מנפיקה ומחזירה טוקן באופן אוטומטי (Auto-Login) ללא לוגיקה בקונטרולר
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = clientService.registerAndGetToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        String token = clientService.loginAndGetToken(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    // 🔹 התחברות באמצעות גוגל (OAuth2) - דלגציה מלאה לסרוויס
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        AuthResponse response = clientService.loginWithGoogle(request.get("token"));
        return ResponseEntity.ok(response);
    }

    // 🔹 התנתקות מאובטחת - שליפת הטוקן מה-Header והעברתו לסרוויס לפסילה
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            clientService.logout(token);
        }
        return ResponseEntity.ok("התנתקת בהצלחה מהמערכת.");
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