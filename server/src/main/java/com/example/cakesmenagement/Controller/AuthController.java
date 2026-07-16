package com.example.cakesmenagement.Controller;

import com.example.cakesmenagement.Dto.AuthResponse;
import com.example.cakesmenagement.Dto.LoginRequest;
import com.example.cakesmenagement.Dto.RegisterRequest;
import com.example.cakesmenagement.Dto.TokenPairDto;
import com.example.cakesmenagement.Service.ClientService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private ClientService clientService;

    // 🔹 הרשמה - מחזירה צמד טוקנים (Access + Refresh) ואורזת את ה-Refresh בעוגייה
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        TokenPairDto tokens = clientService.registerAndGetToken(request);

        ResponseCookie cookie = createCookie("refreshToken", tokens.getRefreshToken(), 7 * 24 * 60 * 60);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(tokens.getAccessToken()));
    }

    // 🔹 התחברות רגילה - מחזירה צמד טוקנים (Access + Refresh)
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        TokenPairDto tokens = clientService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());

        ResponseCookie cookie = createCookie("refreshToken", tokens.getRefreshToken(), 7 * 24 * 60 * 60);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(tokens.getAccessToken()));
    }

    // 🔹 התחברות באמצעות גוגל (OAuth2) - מחזירה צמד טוקנים
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        TokenPairDto tokens = clientService.loginWithGoogle(request.get("token"));

        ResponseCookie cookie = createCookie("refreshToken", tokens.getRefreshToken(), 7 * 24 * 60 * 60);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(tokens.getAccessToken()));
    }

    // 🔹 רענון טוקן - מקבלת את עוגיית ה-Refresh ומחזירה Access Token חדש
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        String newAccessToken = clientService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(new AuthResponse(newAccessToken));
    }

    // 🔹 התנתקות מאובטחת - רישום ה-Access Token ברשימה השחורה ומחיקת עוגיית ה-Refresh
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // 1. פסילת ה-Access Token הנוכחי
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            clientService.logout(token);
        }

        // 2. מחיקת עוגיית ה-Refresh Token אצל הלקוח ע"י איפוס התוקף שלה ל-0
        ResponseCookie deleteCookie = createCookie("refreshToken", "", 0);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body("התנתקת בהצלחה מהמערכת.");
    }

    // 🔹 שכחתי סיסמה - שליחת מייל
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        clientService.generateResetToken(request.get("email"));
        return ResponseEntity.ok("אם המייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה.");
    }

    // 🔹 איפוס סיסמה בפועל
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        clientService.resetPassword(request.get("token"), request.get("newPassword"));
        return ResponseEntity.ok("הסיסמה שונתה בהצלחה. כעת תוכל להתחבר.");
    }

    // ==========================================
    // פונקציית עזר פרטית - שומרת על הקונטרולר נקי
    // ==========================================
    private ResponseCookie createCookie(String name, String value, long maxAgeSeconds) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)                // מונע גישה לקוקי דרך JavaScript בצד הלקוח (הגנה מפני XSS)
                .secure(true)                  // מבטיח שהקוקי יישלח רק בתקשורת מוצפנת (HTTPS)
                .path("/")                     // הקוקי יהיה זמין בכל נתיבי האפליקציה
                .maxAge(maxAgeSeconds)         // זמן תפוגה בשניות
                .sameSite("Strict")            // מונע שליחת הקוקי מבקשות צד שלישי (הגנה מפני CSRF)
                .build();
    }
}