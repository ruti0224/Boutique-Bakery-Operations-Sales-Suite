package com.example.cakesmenagement.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key;

    // זמני תפוגה (ניתן לשנות במידת הצורך)
    private static final long ACCESS_TOKEN_VALIDITY = 15 * 60 * 1000; // 15 דקות
    private static final long REFRESH_TOKEN_VALIDITY = 7L * 24 * 60 * 60 * 1000; // 7 ימים

    public JwtUtil(@Value("${jwt.secret}") String secretString) {
        if (secretString == null || secretString.trim().isEmpty()) {
            throw new IllegalStateException("FATAL: JWT Secret key is missing!");
        }
        byte[] secretBytes = secretString.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("FATAL: JWT Secret key is too weak! Must be at least 32 bytes.");
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
    }

    // יצירת Access Token (קצר מועד)
    public String generateAccessToken(String email, String role, int userId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // יצירת Refresh Token (ארוך מועד, ללא תפקיד ומזהה כדי להקטין סיכון)
    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public String getRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            return extractClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}